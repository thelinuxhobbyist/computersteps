"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useLearner } from "../../lib/learner-session";
import { formatDay } from "../energy/energy-data";
import { BANK_BASE, formatMoney } from "../practice-bank/bank-data";
import { formatCardNumberInput, formatCvvInput, formatExpiryInput } from "../../shop/shop-data";
import {
  AIRLINE,
  DESTINATIONS,
  FLIGHTS,
  STAYS,
  airportOf,
  baggageFor,
  displayLines,
  quoteTrip,
  stopsText,
  type Flight,
  type Stay,
  type TravelQuote,
} from "../../../workers/practice-bank/src/shared/travel";
import { StayScene, WestfordAirLogo } from "./TravelArt";
import { bookTrip, cancelTrip, getTravel, type TravelBooking } from "./travel-api";

function query(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

function formatTravelDate(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date, 12)));
}

function adults(count: number) {
  return `${count} adult${count === 1 ? "" : "s"}`;
}

function validPeople(value: string | null, fallback: string) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 6 ? String(number) : fallback;
}

type Journey = "oneway" | "return";

function resolveTrip(trip: string | null, returnDate: string | null): Journey {
  if (trip === "oneway") return "oneway";
  if (trip === "return" || returnDate) return "return";
  return "oneway";
}

function cheapestFare(from: string, to: string) {
  const prices = FLIGHTS.filter((flight) => flight.from === from && flight.to === to).map((flight) => flight.pricePence);
  return prices.length > 0 ? Math.min(...prices) : null;
}

const ROUTES: { from: string; to: string; depart: string; return?: string; travellers: string; trip: Journey }[] = [
  { from: "London", to: "Edinburgh", depart: "2026-11-02", return: "2026-11-04", travellers: "1", trip: "return" },
  { from: "London", to: "Manchester", depart: "2026-11-12", return: "2026-11-14", travellers: "1", trip: "return" },
  { from: "Edinburgh", to: "London", depart: "2026-11-18", travellers: "1", trip: "oneway" },
];

function flightSearchQuery(input: { from: string; to: string; depart: string; ret?: string; travellers: string; trip: Journey }) {
  const params: Record<string, string> = {
    from: input.from,
    to: input.to,
    depart: input.depart,
    travellers: input.travellers,
    trip: input.trip,
  };
  if (input.trip === "return" && input.ret) params.return = input.ret;
  return query(params);
}

export function TravelSearch() {
  return (
    <>
      <section className="wt-hero">
        <div className="ps-wrap">
          <h1>Where do you want to go?</h1>
          <p>Search flights, hotels or holiday rentals, compare the results, then open a trip before you pay.</p>
          <Suspense fallback={<p>Loading search…</p>}>
            <SearchCard />
          </Suspense>
        </div>
      </section>
      <div className="ps-wrap wt-page">
        <h2>Routes to try</h2>
        <div className="wt-results">
          {ROUTES.map((route) => {
            const fare = cheapestFare(route.from, route.to);
            const href = `/scenarios/travel/flights/?${flightSearchQuery({
              from: route.from,
              to: route.to,
              depart: route.depart,
              ret: route.return,
              travellers: route.travellers,
              trip: route.trip,
            })}`;
            return (
              <article key={href} className="wt-card wt-route">
                <div>
                  <h2>
                    {route.from} to {route.to}
                  </h2>
                  <p className="wt-meta">
                    {route.trip === "return" ? "Return" : "One way"} · {formatTravelDate(route.depart)}
                    {route.trip === "return" && route.return ? ` to ${formatTravelDate(route.return)}` : ""}
                    {fare !== null ? ` · from ${formatMoney(fare)}` : ""}
                  </p>
                </div>
                <div className="wt-price">
                  <Link href={href}>Search this route</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SearchCard() {
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<"flights" | "hotels" | "rentals">(tabParam === "hotels" || tabParam === "rentals" ? tabParam : "flights");
  const [trip, setTrip] = useState<Journey>(params.get("trip") === "oneway" ? "oneway" : "return");
  const [from, setFrom] = useState(params.get("from") ?? "London");
  const [to, setTo] = useState(params.get("to") ?? "Edinburgh");
  const [depart, setDepart] = useState(params.get("depart") ?? params.get("checkIn") ?? "2026-11-02");
  const [ret, setRet] = useState(params.get("return") ?? params.get("checkOut") ?? "2026-11-04");
  const [travellers, setTravellers] = useState(validPeople(params.get("travellers"), "1"));
  const [city, setCity] = useState(params.get("city") ?? params.get("to") ?? "Edinburgh");
  const [guests, setGuests] = useState(validPeople(params.get("guests"), "2"));
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (tab === "flights") {
      if (from === to) {
        setError("Choose two different cities.");
        return;
      }
      if (trip === "return" && ret <= depart) {
        setError("The return date must be after the departure date.");
        return;
      }
      router.push(
        `/scenarios/travel/flights/?${flightSearchQuery({ from, to, depart, ret: trip === "return" ? ret : undefined, travellers, trip })}`,
      );
      return;
    }
    if (ret <= depart) {
      setError("Check-out must be after check-in.");
      return;
    }
    const path = tab === "hotels" ? "hotels" : "rentals";
    router.push(`/scenarios/travel/${path}/?${query({ city, checkIn: depart, checkOut: ret, guests })}`);
  };

  return (
    <div className="wt-search">
      <div className="wt-tabs" role="tablist" aria-label="What to search">
        {(
          [
            ["flights", "Flights"],
            ["hotels", "Hotels"],
            ["rentals", "Holiday rentals"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setError(""); }}>
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        {error ? <p className="wt-error">{error}</p> : null}
        {tab === "flights" ? (
          <fieldset className="wt-trip-type">
            <legend>Journey</legend>
            <label>
              <input type="radio" name="wt-trip" value="return" checked={trip === "return"} onChange={() => setTrip("return")} />
              Return
            </label>
            <label>
              <input type="radio" name="wt-trip" value="oneway" checked={trip === "oneway"} onChange={() => setTrip("oneway")} />
              One way
            </label>
          </fieldset>
        ) : null}
        <div className={tab === "flights" ? "wt-search__row wt-search__row--flights" : "wt-search__row wt-search__row--stay"}>
          {tab === "flights" ? (
            <>
              <CityField id="wt-from" label="From" value={from} onChange={setFrom} />
              <CityField id="wt-to" label="To" value={to} onChange={setTo} />
            </>
          ) : (
            <CityField id="wt-city" label="City" value={city} onChange={setCity} />
          )}
          <label htmlFor="wt-depart">
            {tab === "flights" ? "Depart" : "Check in"}
            <input id="wt-depart" type="date" value={depart} onChange={(event) => setDepart(event.target.value)} />
          </label>
          {tab !== "flights" || trip === "return" ? (
            <label htmlFor="wt-return">
              {tab === "flights" ? "Return" : "Check out"}
              <input id="wt-return" type="date" value={ret} onChange={(event) => setRet(event.target.value)} />
            </label>
          ) : null}
          <label htmlFor="wt-people">
            {tab === "flights" ? "Travellers" : "Guests"}
            <PeopleSelect id="wt-people" value={tab === "flights" ? travellers : guests} onChange={tab === "flights" ? setTravellers : setGuests} />
          </label>
          <button type="submit">Search</button>
        </div>
      </form>
    </div>
  );
}

function PeopleSelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
      {["1", "2", "3", "4", "5", "6"].map((count) => (
        <option key={count} value={count}>
          {count}
        </option>
      ))}
    </select>
  );
}

function CityField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {DESTINATIONS.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
    </label>
  );
}

export function FlightResults() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading flights…</p>}>
      <FlightList />
    </Suspense>
  );
}

function FlightList() {
  const params = useSearchParams();
  const hasSearch = params.has("from") || params.has("depart") || params.has("trip") || params.has("return");
  const requested = params.get("trip");
  const trip: Journey =
    requested === "oneway" ? "oneway" : requested === "return" || params.has("return") || !hasSearch ? "return" : "oneway";
  const from = params.get("from") ?? "London";
  const to = params.get("to") ?? "Edinburgh";
  const depart = params.get("depart") ?? "2026-11-02";
  const ret = trip === "return" ? params.get("return") ?? (hasSearch ? "" : "2026-11-04") : "";
  const travellers = validPeople(params.get("travellers"), "1");
  const outbound = FLIGHTS.filter((flight) => flight.from === from && flight.to === to).sort((a, b) => a.depart.localeCompare(b.depart));
  const returns = FLIGHTS.filter((flight) => flight.from === to && flight.to === from);
  const searchHref = `/scenarios/travel/?${flightSearchQuery({ from, to, depart, ret, travellers, trip })}`;
  const people = Number(travellers);
  return (
    <div className="ps-wrap wt-page">
      <div className="wt-summary">
        <div>
          <p className="wt-kicker">{AIRLINE}</p>
          <h1 className="wt-title">
            {from} to {to}
          </h1>
          <p className="wt-meta">
            {trip === "return" ? "Return" : "One way"}
            {depart ? ` · ${formatTravelDate(depart)}` : ""}
            {trip === "return" && ret ? ` to ${formatTravelDate(ret)}` : ""}
            {` · ${adults(people)}`}
          </p>
        </div>
        <p className="wt-links">
          <Link className="wt-textlink" href={searchHref}>
            Change search
          </Link>
        </p>
      </div>
      {trip === "return" && !ret ? <p className="wt-error">Choose a return date.</p> : null}
      {trip === "return" && ret && returns.length === 0 ? (
        <p>Westford Air has no flight back from {to} to {from}. Change the search if you need a return.</p>
      ) : null}
      {outbound.length > 0 ? (
        <p className="wt-meta">
          {outbound.length} flight{outbound.length === 1 ? "" : "s"} to compare.
          {trip === "return" && returns.length > 0 ? " Choose the outbound flight. You pick the return on the next page." : ""}
        </p>
      ) : (
        <p>No flights match those cities. Try London to Edinburgh.</p>
      )}
      <div className="wt-results">
        {outbound.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            date={depart}
            priceLabel={trip === "return" ? "outbound" : "total"}
            href={`/scenarios/travel/flight/?${flightSearchQuery({ from, to, depart, ret, travellers, trip })}&${query({ id: flight.id })}`}
          />
        ))}
      </div>
    </div>
  );
}

function FlightCard({ flight, date, href, priceLabel }: { flight: Flight; date: string; href: string; priceLabel: string }) {
  return (
    <article className="wt-card wt-flight">
      <WestfordAirLogo detail={flight.flightNumber} />
      <FlightTimeline flight={flight} date={date} />
      <div className="wt-price">
        <strong>{formatMoney(flight.pricePence)}</strong>
        <span>{priceLabel}</span>
        <Link href={href}>View details</Link>
      </div>
    </article>
  );
}

function FlightTimeline({ flight, date }: { flight: Flight; date?: string | null }) {
  const from = airportOf(flight.from);
  const to = airportOf(flight.to);
  return (
    <div className="wt-leg">
      <div className="wt-leg__end">
        <p className="wt-leg__time">{flight.depart}</p>
        <p className="wt-leg__code">{from.code}</p>
        <p className="wt-leg__place">{from.name}</p>
        {date ? <p className="wt-leg__date">{formatTravelDate(date)}</p> : null}
      </div>
      <div className="wt-leg__mid">
        <p>{flight.duration}</p>
        <div className="wt-leg__line" aria-hidden="true" />
        <p>{stopsText(flight)}</p>
      </div>
      <div className="wt-leg__end wt-leg__end--arrive">
        <p className="wt-leg__time">{flight.arrive}</p>
        <p className="wt-leg__code">{to.code}</p>
        <p className="wt-leg__place">{to.name}</p>
        {date ? <p className="wt-leg__date">{formatTravelDate(date)}</p> : null}
      </div>
    </div>
  );
}

export function StayResults({ kind }: { kind: "hotel" | "rental" }) {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading places to stay…</p>}>
      <StayList kind={kind} />
    </Suspense>
  );
}

function StayList({ kind }: { kind: "hotel" | "rental" }) {
  const params = useSearchParams();
  const city = params.get("city") ?? "Edinburgh";
  const checkIn = params.get("checkIn") ?? "2026-11-02";
  const checkOut = params.get("checkOut") ?? "2026-11-04";
  const guestsRaw = Number(params.get("guests") ?? "2");
  const guestsOk = Number.isInteger(guestsRaw) && guestsRaw >= 1 && guestsRaw <= 6;
  const guests = guestsOk ? guestsRaw : 2;
  const stays = guestsOk ? STAYS.filter((stay) => stay.kind === kind && stay.city === city && stay.guests >= guests) : [];
  const searchHref = `/scenarios/travel/?${query({ tab: kind === "hotel" ? "hotels" : "rentals", city, checkIn, checkOut, guests: String(guests) })}`;
  const heading = kind === "hotel" ? "Hotels" : "Holiday rentals";
  return (
    <div className="ps-wrap wt-page">
      <div className="wt-summary">
        <div>
          <p className="wt-kicker">Westford Travel</p>
          <h1 className="wt-title">
            {heading} in {city}
          </h1>
          <p className="wt-meta">
            {formatTravelDate(checkIn)} to {formatTravelDate(checkOut)} · {guests} guest{guests === 1 ? "" : "s"}
          </p>
        </div>
        <p className="wt-links">
          <Link className="wt-textlink" href={searchHref}>
            Change search
          </Link>
        </p>
      </div>
      {!guestsOk ? <p className="wt-error">Choose between 1 and 6 guests.</p> : null}
      <div className="wt-results">
        {stays.map((stay) => {
          const priced = quoteTrip({ stayId: stay.id, checkIn, checkOut, guests });
          const total = priced.ok ? priced.quote.totalPence : stay.nightlyPence;
          return (
            <StayCard
              key={stay.id}
              stay={stay}
              total={total}
              href={`/scenarios/travel/stay/?${query({ id: stay.id, checkIn, checkOut, guests: String(guests) })}`}
            />
          );
        })}
      </div>
      {guestsOk && stays.length === 0 ? <p>Nothing matches that search. Try Edinburgh for 2 guests.</p> : null}
    </div>
  );
}

function StayCard({ stay, total, href }: { stay: Stay; total: number; href: string }) {
  return (
    <article className="wt-card wt-stay">
      <StayScene scene={stay.scene} />
      <div>
        <h2>{stay.name}</h2>
        <p className="wt-meta">
          {stay.area}, {stay.city}
        </p>
        <p className="wt-meta">{stay.summary}</p>
        <p className="wt-meta">
          {stay.room}. Sleeps {stay.guests}. {stay.facilities.join(", ")}.
        </p>
      </div>
      <div className="wt-price">
        <strong>{formatMoney(total)}</strong>
        <span>{formatMoney(stay.nightlyPence)} a night</span>
        <Link href={href}>View details</Link>
      </div>
    </article>
  );
}

export function FlightDetail() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading flight…</p>}>
      <FlightDetailBody />
    </Suspense>
  );
}

function FlightDetailBody() {
  const params = useSearchParams();
  const [chosenReturn, setChosenReturn] = useState("");
  const flight = FLIGHTS.find((item) => item.id === (params.get("id") ?? ""));
  const trip = resolveTrip(params.get("trip"), params.get("return"));
  const depart = params.get("depart") ?? "";
  const ret = trip === "return" ? (params.get("return") ?? "") : "";
  const travellers = validPeople(params.get("travellers"), "1");
  const people = Number(travellers);
  const returnOptions = flight && trip === "return" ? FLIGHTS.filter((item) => item.from === flight.to && item.to === flight.from) : [];
  const selectedReturn = returnOptions.find((item) => item.id === chosenReturn) ?? returnOptions[0] ?? null;
  if (!flight) {
    return (
      <div className="ps-wrap wt-page">
        <p>That flight is not in this practice search.</p>
      </div>
    );
  }
  const dateReady = /^\d{4}-\d{2}-\d{2}$/.test(depart) && (trip === "oneway" || /^\d{4}-\d{2}-\d{2}$/.test(ret));
  const datesInOrder = trip === "oneway" || (dateReady && ret > depart);
  const canBook = dateReady && datesInOrder && (trip === "oneway" || selectedReturn !== null);
  const priced = canBook
    ? quoteTrip({
        flightId: flight.id,
        returnFlightId: selectedReturn?.id,
        guests: people,
        departDate: depart,
        returnDate: selectedReturn ? ret : undefined,
      })
    : null;
  const resultsHref = `/scenarios/travel/flights/?${flightSearchQuery({
    from: flight.from,
    to: flight.to,
    depart: depart || "2026-11-02",
    ret,
    travellers,
    trip,
  })}`;
  const searchHref = `/scenarios/travel/?${flightSearchQuery({
    from: flight.from,
    to: flight.to,
    depart: depart || "2026-11-02",
    ret,
    travellers,
    trip,
  })}`;
  const checkoutHref = priced?.ok
    ? `/scenarios/travel/checkout/?${query({
        flight: flight.id,
        guests: travellers,
        depart,
        ...(selectedReturn ? { returnFlight: selectedReturn.id, return: ret } : {}),
      })}`
    : "";
  const legs = selectedReturn ? [flight, selectedReturn] : [flight];
  return (
    <div className="ps-wrap wt-page">
      <div className="wt-summary">
        <div>
          <p className="wt-kicker">Flight details</p>
          <h1 className="wt-title">
            {flight.from} to {flight.to}
          </h1>
          <p className="wt-meta">
            {trip === "return" ? "Return" : "One way"}
            {depart ? ` · ${formatTravelDate(depart)}` : ""}
            {trip === "return" && ret ? ` to ${formatTravelDate(ret)}` : ""}
            {` · ${adults(people)}`}
          </p>
        </div>
        <p className="wt-links">
          <Link className="wt-textlink" href={resultsHref}>
            Back to results
          </Link>
          <Link className="wt-textlink" href={searchHref}>
            Change search
          </Link>
        </p>
      </div>
      <div className="wt-detail">
        <article className="wt-panel">
          <WestfordAirLogo />
          <section className="wt-leg-block">
            <h2>Outbound{flight.flightNumber ? ` · ${flight.flightNumber}` : ""}</h2>
            <FlightTimeline flight={flight} date={depart || null} />
          </section>
          {trip === "return" && selectedReturn ? (
            <section className="wt-leg-block">
              <h2>Return · {selectedReturn.flightNumber}</h2>
              <FlightTimeline flight={selectedReturn} date={ret || null} />
            </section>
          ) : null}
          {trip === "return" && returnOptions.length > 1 ? (
            <fieldset className="wt-choice">
              <legend>Choose the return flight</legend>
              {returnOptions.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name="wt-return-flight"
                    value={option.id}
                    checked={selectedReturn?.id === option.id}
                    onChange={() => setChosenReturn(option.id)}
                  />
                  <span>
                    <strong>
                      {option.depart}–{option.arrive}
                    </strong>{" "}
                    {option.flightNumber} · {stopsText(option)} · {option.duration}
                  </span>
                  <span className="wt-choice__price">{formatMoney(option.pricePence)}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
          {trip === "return" && returnOptions.length === 0 ? (
            <p>Westford Air has no return flight from {flight.to} to {flight.from}. Change the search, or search again as one way.</p>
          ) : null}
          {trip === "oneway" ? <p className="wt-note">One way. This booking does not include a return flight.</p> : null}
          {!dateReady ? <p className="wt-error">Choose travel dates before checkout.</p> : null}
          {dateReady && !datesInOrder ? <p className="wt-error">The return date must be after the departure date.</p> : null}
          <div className="wt-facts">
            <div>
              <h3>Passengers</h3>
              <p>{adults(people)}</p>
            </div>
            <div>
              <h3>Bags</h3>
              <BaggageNotes flights={legs} />
            </div>
          </div>
        </article>
        <aside className="wt-panel wt-fare">
          <h2>Price</h2>
          {priced?.ok ? (
            <>
              <FareList quote={priced.quote} />
              <p className="wt-amount wt-amount--due">
                <span>Total</span>
                <span>{formatMoney(priced.quote.totalPence)}</span>
              </p>
              <p className="wt-note">
                Practice fare, paid with pretend money.
                {people > 1 ? " This fare is charged once for the booking, not once for each traveller." : ""}
              </p>
              <Link className="wt-btn wt-btn--pay" href={checkoutHref}>
                Continue to checkout
              </Link>
            </>
          ) : (
            <p className="wt-note">{priced && !priced.ok ? priced.error : "The price appears here once the dates and flights match."}</p>
          )}
          <p className="wt-note">You can cancel a practice booking later from My trips. The pretend payment is refunded.</p>
          <p className="wt-links">
            <Link className="wt-textlink" href={resultsHref}>
              Back to results
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function BaggageNotes({ flights }: { flights: Flight[] }) {
  const notes = flights.map((flight) => ({ flight, bag: baggageFor(flight) }));
  const first = notes[0];
  const same = notes.every((item) => item.bag.cabin === first.bag.cabin && item.bag.checked === first.bag.checked);
  if (same) {
    return (
      <>
        <p>{first.bag.cabin}</p>
        <p>{first.bag.checked}</p>
      </>
    );
  }
  return notes.map(({ flight, bag }) => (
    <p key={flight.id}>
      {flight.flightNumber}: {bag.cabin}. {bag.checked}.
    </p>
  ));
}

export function StayDetail() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading place to stay…</p>}>
      <StayDetailBody />
    </Suspense>
  );
}

function StayDetailBody() {
  const params = useSearchParams();
  const stay = STAYS.find((item) => item.id === (params.get("id") ?? ""));
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const guests = validPeople(params.get("guests"), "2");
  if (!stay) {
    return (
      <div className="ps-wrap wt-page">
        <p>That place is not in this practice search.</p>
      </div>
    );
  }
  const priced = quoteTrip({ stayId: stay.id, checkIn, checkOut, guests: Number(guests) });
  const listPath = stay.kind === "hotel" ? "hotels" : "rentals";
  const resultsHref = `/scenarios/travel/${listPath}/?${query({ city: stay.city, checkIn, checkOut, guests })}`;
  const searchHref = `/scenarios/travel/?${query({
    tab: stay.kind === "hotel" ? "hotels" : "rentals",
    city: stay.city,
    checkIn,
    checkOut,
    guests,
  })}`;
  return (
    <div className="ps-wrap wt-page">
      <div className="wt-summary">
        <div>
          <p className="wt-kicker">{stay.kind === "hotel" ? "Hotel" : "Holiday rental"}</p>
          <h1 className="wt-title">{stay.name}</h1>
          <p className="wt-meta">
            {stay.area}, {stay.city}
            {checkIn && checkOut ? ` · ${formatTravelDate(checkIn)} to ${formatTravelDate(checkOut)}` : ""}
          </p>
        </div>
        <p className="wt-links">
          <Link className="wt-textlink" href={resultsHref}>
            Back to results
          </Link>
          <Link className="wt-textlink" href={searchHref}>
            Change search
          </Link>
        </p>
      </div>
      <div className="wt-detail">
        <article className="wt-panel">
          <StayScene scene={stay.scene} />
          <p>{stay.summary}</p>
          <div className="wt-facts">
            <div>
              <h3>Room</h3>
              <p>{stay.room}</p>
              <p>Sleeps {stay.guests}</p>
            </div>
            <div>
              <h3>Dates</h3>
              <p>Check in from {stay.checkInFrom}</p>
              <p>Check out by {stay.checkOutBy}</p>
            </div>
            <div>
              <h3>Guests</h3>
              <p>
                {guests} guest{guests === "1" ? "" : "s"}
              </p>
            </div>
          </div>
          <h2>What is included</h2>
          <ul>
            {stay.facilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <aside className="wt-panel wt-fare">
          <h2>Price for these dates</h2>
          {priced.ok ? (
            <>
              <FareList quote={priced.quote} />
              <p className="wt-amount wt-amount--due">
                <span>Total</span>
                <span>{formatMoney(priced.quote.totalPence)}</span>
              </p>
              <p className="wt-note">
                {formatMoney(stay.nightlyPence)} a night. Practice price, paid with pretend money.
              </p>
              <Link className="wt-btn wt-btn--pay" href={`/scenarios/travel/checkout/?${query({ stay: stay.id, checkIn, checkOut, guests })}`}>
                Continue to checkout
              </Link>
            </>
          ) : (
            <p className="wt-error">{priced.error}</p>
          )}
          <p className="wt-note">You can cancel a practice booking later from My trips. The pretend payment is refunded.</p>
        </aside>
      </div>
    </div>
  );
}

function FareList({ quote }: { quote: TravelQuote }) {
  return (
    <dl className="wt-farelist">
      {displayLines(quote).map((line) => (
        <div key={line.label}>
          <dt>{line.label}</dt>
          <dd>{formatMoney(line.amountPence)}</dd>
        </div>
      ))}
    </dl>
  );
}

function knownFlight(flight: Flight): Flight {
  const current = FLIGHTS.find((item) => item.id === flight.id);
  if (!current) return flight;
  return { ...flight, flightNumber: flight.flightNumber || current.flightNumber, via: flight.via ?? current.via };
}

function QuoteItinerary({ quote, passengerName }: { quote: TravelQuote; passengerName?: string }) {
  const passenger = passengerName || quote.passengerName;
  const flight = quote.flight ? knownFlight(quote.flight) : null;
  const returnFlight = quote.returnFlight ? knownFlight(quote.returnFlight) : null;
  return (
    <div className="wt-itinerary">
      {flight ? (
        <section className="wt-leg-block">
          <h3>
            Outbound
            {flight.flightNumber ? ` · ${flight.flightNumber}` : ""} · {AIRLINE}
          </h3>
          <FlightTimeline flight={flight} date={quote.departDate} />
        </section>
      ) : null}
      {returnFlight ? (
        <section className="wt-leg-block">
          <h3>Return · {returnFlight.flightNumber || AIRLINE}</h3>
          <FlightTimeline flight={returnFlight} date={quote.returnDate} />
        </section>
      ) : null}
      {flight && !returnFlight ? <p className="wt-note">One way. No return flight.</p> : null}
      {quote.stay ? (
        <section className="wt-leg-block">
          <h3>{quote.stay.name}</h3>
          <p>
            {quote.stay.area ? `${quote.stay.area}, ` : ""}
            {quote.stay.city}
          </p>
          <p>
            {formatDay(quote.stay.checkIn)} to {formatDay(quote.stay.checkOut)} · {quote.stay.nights} night{quote.stay.nights === 1 ? "" : "s"}
          </p>
          {quote.stay.room ? <p>{quote.stay.room}</p> : null}
        </section>
      ) : null}
      {passenger ? (
        <p>
          Passenger: <strong>{passenger}</strong>
          {quote.guests > 1 ? ` · ${adults(quote.guests)}` : ""}
        </p>
      ) : quote.guests > 0 ? (
        <p>{quote.flight ? adults(quote.guests) : `${quote.guests} guest${quote.guests === 1 ? "" : "s"}`}</p>
      ) : null}
    </div>
  );
}

export function BookingPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading checkout…</p>}>
      <BookingForm />
    </Suspense>
  );
}

type CheckoutFields = {
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

const EMPTY_CHECKOUT: CheckoutFields = {
  fullName: "",
  addressLine1: "",
  townOrCity: "",
  postcode: "",
  nameOnCard: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

function BookingForm() {
  const params = useSearchParams();
  const username = useLearner();
  const attempt = useRef<string | null>(null);
  const outbound = params.get("flight") ?? "";
  const inbound = params.get("returnFlight") ?? "";
  const stay = params.get("stay") ?? "";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const departDate = params.get("depart") ?? "";
  const returnDate = params.get("return") ?? "";
  const guests = Number(params.get("guests") ?? "1");
  const [fields, setFields] = useState<CheckoutFields>(EMPTY_CHECKOUT);
  const [fieldErrors, setFieldErrors] = useState<Partial<CheckoutFields>>({});
  const [done, setDone] = useState<{ reference: string; balancePence: number | null; passengerName: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const priced = quoteTrip({
    flightId: outbound || undefined,
    returnFlightId: inbound || undefined,
    stayId: stay || undefined,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    guests,
    departDate: departDate || undefined,
    returnDate: inbound ? returnDate || undefined : undefined,
  });

  const setField = (name: keyof CheckoutFields, value: string) => {
    const next =
      name === "cardNumber" ? formatCardNumberInput(value) : name === "expiry" ? formatExpiryInput(value, fields.expiry) : name === "cvv" ? formatCvvInput(value) : value;
    setFields((current) => ({ ...current, [name]: next }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    if (!username || !priced.ok || busy) return;
    const missing: Partial<CheckoutFields> = {};
    if (!fields.fullName.trim()) missing.fullName = "Type the name on your Westford Bank account.";
    if (!fields.addressLine1.trim()) missing.addressLine1 = "Type the first line of the address from Westford Bank.";
    if (!fields.townOrCity.trim()) missing.townOrCity = "Type the town from Westford Bank.";
    if (!fields.postcode.trim()) missing.postcode = "Type the postcode from Westford Bank.";
    if (!fields.nameOnCard.trim()) missing.nameOnCard = "Type the name on your Westford Bank card.";
    if (fields.cardNumber.replace(/\D/g, "").length !== 16) missing.cardNumber = "Type the 16-digit card number from Westford Bank.";
    if (fields.expiry.replace(/\D/g, "").length !== 4) missing.expiry = "Type the expiry date from your card.";
    if (fields.cvv.length !== 3) missing.cvv = "Type the 3-digit security code from your card.";
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      setError("Fill in the passenger details and card before paying.");
      return;
    }
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setBusy(true);
    const result = await bookTrip(
      username,
      {
        flightId: outbound,
        returnFlightId: inbound,
        stayId: stay,
        checkIn,
        checkOut,
        guests,
        departDate,
        returnDate: inbound ? returnDate : "",
        ...fields,
      },
      attempt.current,
    );
    setBusy(false);
    if (result.ok) {
      setDone({ reference: result.reference, balancePence: result.balancePence, passengerName: fields.fullName.trim() });
      setError("");
      setFieldErrors({});
      return;
    }
    if (result.reason === "details") {
      setFieldErrors(result.errors);
      setError("Those details do not match the address and card Westford Bank gave you when you registered.");
      return;
    }
    setError(
      result.reason === "insufficient-funds"
        ? `There is not enough pretend money. Balance: ${formatMoney(result.balancePence)}. The booking was not confirmed.`
        : result.message ?? "The booking was not confirmed.",
    );
  };

  if (done && priced.ok) {
    return (
      <div className="ps-wrap wt-page">
        <article className="wt-panel wt-confirm">
          <p className="wt-kicker">Booking confirmed</p>
          <h1 className="wt-title">Your trip is booked</h1>
          <p>Booking reference</p>
          <p className="wt-ref">{done.reference}</p>
          <QuoteItinerary quote={priced.quote} passengerName={done.passengerName} />
          <FareList quote={priced.quote} />
          <p className="wt-amount wt-amount--due">
            <span>Total paid</span>
            <span>{formatMoney(priced.quote.totalPence)}</span>
          </p>
          {done.balancePence !== null ? <p className="wt-note">Westford Bank balance left: {formatMoney(done.balancePence)}.</p> : null}
          <p className="wt-note">
            This is a practice booking on your account. No airline, hotel or card company has been contacted. Find it again under My trips.
          </p>
          <p className="wt-actions">
            <Link className="wt-btn wt-btn--pay" href="/scenarios/travel/trips/">
              View in My trips
            </Link>
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="ps-wrap wt-page">
      <div className="wt-summary">
        <div>
          <p className="wt-kicker">Checkout</p>
          <h1 className="wt-title">Passenger details</h1>
          <p className="wt-meta">
            Type the name, address and card from your Westford Bank account. Westford Bank gives you these details when you register.{" "}
            <Link className="wt-textlink" href={`${BANK_BASE}/card/`}>
              Look at your card
            </Link>{" "}
            if you need to check them. This does not charge a real card.
          </p>
        </div>
      </div>
      {!priced.ok ? <p className="wt-error">{priced.error}</p> : null}
      {priced.ok ? (
        <form className="wt-checkout" onSubmit={pay} noValidate>
          <div className="wt-panel wt-checkout__form">
            <h2>Passenger</h2>
            <CheckoutField id="wt-name" label="Full name" value={fields.fullName} error={fieldErrors.fullName} onChange={(value) => setField("fullName", value)} />
            <CheckoutField id="wt-address" label="Address" hint="House number and street" value={fields.addressLine1} error={fieldErrors.addressLine1} onChange={(value) => setField("addressLine1", value)} />
            <CheckoutField id="wt-town" label="Town or city" value={fields.townOrCity} error={fieldErrors.townOrCity} onChange={(value) => setField("townOrCity", value)} />
            <CheckoutField id="wt-postcode" label="Postcode" value={fields.postcode} error={fieldErrors.postcode} onChange={(value) => setField("postcode", value)} />
            <h2>Westford Bank card</h2>
            <CheckoutField id="wt-card-name" label="Name on card" value={fields.nameOnCard} error={fieldErrors.nameOnCard} onChange={(value) => setField("nameOnCard", value)} />
            <CheckoutField id="wt-card-number" label="Card number" hint="16 digits. Spaces are added as you type." value={fields.cardNumber} error={fieldErrors.cardNumber} onChange={(value) => setField("cardNumber", value)} inputMode="numeric" />
            <div className="wt-payrow">
              <CheckoutField id="wt-expiry" label="Expiry date" hint="MM/YY" value={fields.expiry} error={fieldErrors.expiry} onChange={(value) => setField("expiry", value)} inputMode="numeric" />
              <CheckoutField id="wt-cvv" label="Security code" hint="3 digits on the back" value={fields.cvv} error={fieldErrors.cvv} onChange={(value) => setField("cvv", value)} inputMode="numeric" />
            </div>
            {error ? <p className="wt-error">{error}</p> : null}
            <button type="submit" className="ps-btn ps-btn--accent" disabled={busy || !username}>
              {busy ? "Paying…" : `Pay ${formatMoney(priced.quote.totalPence)}`}
            </button>
          </div>
          <aside className="wt-panel wt-fare wt-checkout__summary">
            <h2>Your trip</h2>
            <QuoteItinerary quote={priced.quote} />
            <FareList quote={priced.quote} />
            <p className="wt-amount wt-amount--due">
              <span>Amount to pay</span>
              <span>{formatMoney(priced.quote.totalPence)}</span>
            </p>
          </aside>
        </form>
      ) : null}
    </div>
  );
}

function CheckoutField({
  id,
  label,
  hint,
  value,
  error,
  onChange,
  inputMode,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="ps-field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="wt-meta">{hint}</p> : null}
      <input id={id} value={value} inputMode={inputMode} aria-invalid={error ? true : undefined} onChange={(event) => onChange(event.target.value)} />
      {error ? <p className="wt-error">{error}</p> : null}
    </div>
  );
}

export function MyTrips() {
  const username = useLearner();
  const [bookings, setBookings] = useState<TravelBooking[] | null>(null);
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getTravel(username).then((result) => {
      if (cancelled) return;
      if (result.status === "ready") {
        setBookings(result.bookings);
        setAccountName(result.identity.fullName);
        return;
      }
      setBookings([]);
      setError(result.status === "not-found" ? "Sign in again to see your trips." : "Your trips could not be loaded.");
    });
    return () => {
      cancelled = true;
    };
  }, [username]);
  const cancel = async (reference: string) => {
    if (!username) return;
    const result = await cancelTrip(username, reference);
    if (result.ok) setBookings(result.bookings);
    else setError("The booking was not cancelled.");
  };
  return (
    <div className="ps-wrap wt-page">
      <h1 className="wt-title">My trips</h1>
      <p className="wt-meta">Practice bookings saved on this account.</p>
      {error ? <p className="wt-error">{error}</p> : null}
      {bookings === null ? <p>Loading your trips…</p> : null}
      {bookings && bookings.length === 0 ? (
        <p>
          You have no practice bookings yet. <Link className="wt-textlink" href="/scenarios/travel/">Search for a trip</Link>
        </p>
      ) : null}
      <div className="wt-results">
        {(bookings ?? []).map((booking) => (
          <article key={booking.reference} className="wt-panel wt-trip">
            <div className="wt-trip__head">
              <div>
                <p className="wt-kicker">Booking reference</p>
                <h2>{booking.reference}</h2>
              </div>
              <span className={booking.status === "confirmed" ? "wt-status" : "wt-status wt-status--cancelled"}>
                {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
              </span>
            </div>
            {booking.quote ? <QuoteItinerary quote={booking.quote} passengerName={booking.quote.passengerName || accountName} /> : null}
            <p className="wt-amount wt-amount--due">
              <span>Total</span>
              <span>{formatMoney(booking.totalPence)}</span>
            </p>
            {booking.status === "confirmed" ? (
              <button type="button" className="ps-btn ps-btn--ghost" onClick={() => cancel(booking.reference)}>
                Cancel and refund
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
