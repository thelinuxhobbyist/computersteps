"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useLearner } from "../../lib/learner-session";
import { formatDay } from "../energy/energy-data";
import { BANK_BASE, formatMoney } from "../practice-bank/bank-data";
import { formatCardNumberInput, formatCvvInput, formatExpiryInput } from "../../shop/shop-data";
import { DESTINATIONS, FLIGHTS, STAYS, quoteTrip, type Flight, type Stay } from "../../../workers/practice-bank/src/shared/travel";
import { bookTrip, cancelTrip, getTravel, type TravelBooking } from "./travel-api";

function query(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export function TravelSearch() {
  return (
    <>
      <section className="wt-hero">
        <div className="ps-wrap">
          <h1>Where do you want to go?</h1>
          <p>Search flights, hotels or holiday rentals, compare the results, then open a trip before you pay.</p>
          <SearchCard />
        </div>
      </section>
      <div className="ps-wrap" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
        <h2>Popular practice trips</h2>
        <div className="wt-results">
          <article className="wt-card">
            <div className="wt-photo wt-photo--flight">Edinburgh</div>
            <div>
              <h2>London to Edinburgh</h2>
              <p className="wt-meta">Direct flights from £38. Hotels by the harbour and the castle.</p>
            </div>
            <div className="wt-price">
              <Link href={`/scenarios/travel/flights/?${query({ from: "London", to: "Edinburgh", depart: "2026-11-02", return: "2026-11-04", travellers: "1" })}`}>
                Search this route
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

function SearchCard() {
  const router = useRouter();
  const [tab, setTab] = useState<"flights" | "hotels" | "rentals">("flights");
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Edinburgh");
  const [depart, setDepart] = useState("2026-11-02");
  const [ret, setRet] = useState("2026-11-04");
  const [travellers, setTravellers] = useState("1");
  const [city, setCity] = useState("Edinburgh");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (tab === "flights") {
      if (from === to) {
        setError("Choose two different cities.");
        return;
      }
      if (ret <= depart) {
        setError("The return date must be after the departure date.");
        return;
      }
      router.push(`/scenarios/travel/flights/?${query({ from, to, depart, return: ret, travellers })}`);
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
          <label htmlFor="wt-return">
            {tab === "flights" ? "Return" : "Check out"}
            <input id="wt-return" type="date" value={ret} onChange={(event) => setRet(event.target.value)} />
          </label>
          <label htmlFor="wt-people">
            {tab === "flights" ? "Travellers" : "Guests"}
            <input id="wt-people" inputMode="numeric" value={tab === "flights" ? travellers : guests} onChange={(event) => (tab === "flights" ? setTravellers(event.target.value) : setGuests(event.target.value))} />
          </label>
          <button type="submit">Search</button>
        </div>
      </form>
    </div>
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
  const from = params.get("from") ?? "London";
  const to = params.get("to") ?? "Edinburgh";
  const depart = params.get("depart") ?? "2026-11-02";
  const ret = params.get("return") ?? "2026-11-04";
  const travellers = params.get("travellers") ?? "1";
  const outbound = FLIGHTS.filter((flight) => flight.from === from && flight.to === to);
  return (
    <div className="ps-wrap" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <h1>
        {from} to {to}
      </h1>
      <p>
        {formatDay(depart)} to {formatDay(ret)}. {travellers} traveller{travellers === "1" ? "" : "s"}. Compare the time and the price, then open the flight that suits you.
      </p>
      <div className="wt-results">
        {outbound.map((flight) => (
          <FlightCard key={flight.id} flight={flight} href={`/scenarios/travel/flight/?${query({ id: flight.id, depart, return: ret, travellers })}`} />
        ))}
      </div>
      {outbound.length === 0 ? <p>No flights match those cities. Try London to Edinburgh.</p> : null}
    </div>
  );
}

function FlightCard({ flight, href }: { flight: Flight; href: string }) {
  return (
    <article className="wt-card">
      <div className="wt-photo wt-photo--flight">Westford Air</div>
      <div>
        <h2>
          {flight.depart} – {flight.arrive}
        </h2>
        <p className="wt-meta">
          {flight.from} to {flight.to} · {flight.duration} · {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
        </p>
      </div>
      <div className="wt-price">
        <strong>{formatMoney(flight.pricePence)}</strong>
        <span>practice fare</span>
        <Link href={href}>View details</Link>
      </div>
    </article>
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
  const guests = Number(params.get("guests") ?? "2");
  const stays = STAYS.filter((stay) => stay.kind === kind && stay.city === city && stay.guests >= guests);
  return (
    <div className="ps-wrap" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <h1>
        {kind === "hotel" ? "Hotels" : "Holiday rentals"} in {city}
      </h1>
      <p>
        {formatDay(checkIn)} to {formatDay(checkOut)}. {guests} guest{guests === 1 ? "" : "s"}.
      </p>
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
      {stays.length === 0 ? <p>Nothing matches that search. Try Edinburgh for 2 guests.</p> : null}
    </div>
  );
}

function StayCard({ stay, total, href }: { stay: Stay; total: number; href: string }) {
  return (
    <article className="wt-card">
      <div className={`wt-photo ${stay.kind === "hotel" ? "wt-photo--hotel" : "wt-photo--rental"}`}>{stay.city}</div>
      <div>
        <h2>{stay.name}</h2>
        <p className="wt-meta">{stay.summary}</p>
        <p className="wt-meta">Sleeps {stay.guests}. {stay.facilities.join(", ")}.</p>
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
  const id = params.get("id") ?? "";
  const depart = params.get("depart") ?? "";
  const ret = params.get("return") ?? "";
  const travellers = params.get("travellers") ?? "1";
  const [returnId, setReturnId] = useState("");
  const flight = FLIGHTS.find((item) => item.id === id);
  if (!flight) return <div className="ps-wrap"><p>That flight is not in this practice search.</p></div>;
  const returns = FLIGHTS.filter((item) => item.from === flight.to && item.to === flight.from);
  const priced = quoteTrip({ flightId: flight.id, returnFlightId: returnId || undefined, guests: Number(travellers) });
  return (
    <div className="ps-wrap wt-detail" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <article className="wt-panel">
        <div className="wt-photo wt-photo--flight">Westford Air</div>
        <h1>
          {flight.from} to {flight.to}
        </h1>
        <p>
          Departs {flight.depart}, arrives {flight.arrive}. {flight.duration}. {flight.stops === 0 ? "Direct flight." : `This flight has ${flight.stops} stop.`}
        </p>
        <p>Travel date {depart ? formatDay(depart) : "not set"}. Return date {ret ? formatDay(ret) : "not set"}.</p>
        {returns.length > 0 ? (
          <div className="ps-field">
            <label htmlFor="wt-return-choice">Return flight</label>
            <select id="wt-return-choice" value={returnId} onChange={(event) => setReturnId(event.target.value)}>
              <option value="">One way</option>
              {returns.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.depart}–{item.arrive} · {formatMoney(item.pricePence)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </article>
      <aside className="wt-panel">
        <h2>Price</h2>
        {priced.ok ? <p className="wt-checkout-total">{formatMoney(priced.quote.totalPence)}</p> : null}
        <p>{travellers} traveller{travellers === "1" ? "" : "s"}.</p>
        <p className="wt-actions">
          <Link href={`/scenarios/travel/checkout/?${query({ flight: flight.id, returnFlight: returnId, guests: travellers })}`}>Continue to checkout</Link>
        </p>
      </aside>
    </div>
  );
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
  const guests = params.get("guests") ?? "2";
  if (!stay) return <div className="ps-wrap"><p>That place is not in this practice search.</p></div>;
  const priced = quoteTrip({ stayId: stay.id, checkIn, checkOut, guests: Number(guests) });
  return (
    <div className="ps-wrap wt-detail" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <article className="wt-panel">
        <div className={`wt-photo ${stay.kind === "hotel" ? "wt-photo--hotel" : "wt-photo--rental"}`}>{stay.city}</div>
        <h1>{stay.name}</h1>
        <p>{stay.summary}</p>
        <p>
          {stay.city}. Sleeps {stay.guests}. {checkIn ? formatDay(checkIn) : ""} to {checkOut ? formatDay(checkOut) : ""}.
        </p>
        <h2>What is included</h2>
        <ul>
          {stay.facilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <aside className="wt-panel">
        <h2>Price for these dates</h2>
        {priced.ok ? (
          <>
            <p className="wt-checkout-total">{formatMoney(priced.quote.totalPence)}</p>
            <ul>
              {priced.quote.lines.map((line) => (
                <li key={line.label}>
                  {line.label}: {formatMoney(line.amountPence)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{priced.error}</p>
        )}
        {priced.ok ? (
          <p className="wt-actions">
            <Link href={`/scenarios/travel/checkout/?${query({ stay: stay.id, checkIn, checkOut, guests })}`}>Continue to checkout</Link>
          </p>
        ) : null}
      </aside>
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
  const [fields, setFields] = useState<CheckoutFields>(EMPTY_CHECKOUT);
  const [fieldErrors, setFieldErrors] = useState<Partial<CheckoutFields>>({});
  const [done, setDone] = useState<{ reference: string; balancePence: number | null } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const stay = params.get("stay") ?? "";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const guests = Number(params.get("guests") ?? "1");
  const priced = quoteTrip({
    flightId: outbound || undefined,
    returnFlightId: inbound || undefined,
    stayId: stay || undefined,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    guests,
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
    if (!fields.fullName.trim()) missing.fullName = "Type the name on your Practice Bank account.";
    if (!fields.addressLine1.trim()) missing.addressLine1 = "Type the first line of the address from Practice Bank.";
    if (!fields.townOrCity.trim()) missing.townOrCity = "Type the town from Practice Bank.";
    if (!fields.postcode.trim()) missing.postcode = "Type the postcode from Practice Bank.";
    if (!fields.nameOnCard.trim()) missing.nameOnCard = "Type the name on your Practice Bank card.";
    if (fields.cardNumber.replace(/\D/g, "").length !== 16) missing.cardNumber = "Type the 16-digit card number from Practice Bank.";
    if (fields.expiry.replace(/\D/g, "").length !== 4) missing.expiry = "Type the expiry date from your card.";
    if (fields.cvv.length !== 3) missing.cvv = "Type the 3-digit security code from your card.";
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      setError("Fill in the address and card before paying.");
      return;
    }
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setBusy(true);
    const result = await bookTrip(
      username,
      { flightId: outbound, returnFlightId: inbound, stayId: stay, checkIn, checkOut, guests, ...fields },
      attempt.current,
    );
    setBusy(false);
    if (result.ok) {
      setDone({ reference: result.reference, balancePence: result.balancePence });
      setError("");
      setFieldErrors({});
      return;
    }
    if (result.reason === "details") {
      setFieldErrors(result.errors);
      setError("Those details do not match the address and card Practice Bank gave you when you registered.");
      return;
    }
    setError(
      result.reason === "insufficient-funds"
        ? `There is not enough pretend money. Balance: ${formatMoney(result.balancePence)}. The booking was not confirmed.`
        : result.message ?? "The booking was not confirmed.",
    );
  };

  return (
    <div className="ps-wrap" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <h1>Checkout</h1>
      <p>
        Enter the address and card from your Practice Bank account. Practice Bank gives you these details when you register.{" "}
        <Link href={`${BANK_BASE}/card/`}>Look at your card</Link> if you need to check them. This does not charge a real card.
      </p>
      {!priced.ok ? <p className="wt-error">{priced.error}</p> : null}
      {done ? (
        <p className="ps-ok">
          Booking confirmed. Reference <strong>{done.reference}</strong>.
          {done.balancePence !== null ? ` Balance left: ${formatMoney(done.balancePence)}.` : ""} <Link href="/scenarios/travel/trips/">My trips</Link>
        </p>
      ) : null}
      {priced.ok && !done ? (
        <form className="wt-checkout" onSubmit={pay} noValidate>
          <div className="wt-panel">
            <h2>Billing address</h2>
            <CheckoutField id="wt-name" label="Full name" value={fields.fullName} error={fieldErrors.fullName} onChange={(value) => setField("fullName", value)} />
            <CheckoutField id="wt-address" label="Address" hint="House number and street" value={fields.addressLine1} error={fieldErrors.addressLine1} onChange={(value) => setField("addressLine1", value)} />
            <CheckoutField id="wt-town" label="Town or city" value={fields.townOrCity} error={fieldErrors.townOrCity} onChange={(value) => setField("townOrCity", value)} />
            <CheckoutField id="wt-postcode" label="Postcode" value={fields.postcode} error={fieldErrors.postcode} onChange={(value) => setField("postcode", value)} />
            <h2>Card details</h2>
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
          <aside className="wt-panel">
            <h2>Your trip</h2>
            {priced.quote.flight ? (
              <p>
                {priced.quote.flight.from} to {priced.quote.flight.to}, departs {priced.quote.flight.depart}
                {priced.quote.returnFlight ? `. Return departs ${priced.quote.returnFlight.depart}` : ""}
              </p>
            ) : null}
            {priced.quote.stay ? (
              <p>
                {priced.quote.stay.name}, {formatDay(priced.quote.stay.checkIn)} to {formatDay(priced.quote.stay.checkOut)}
              </p>
            ) : null}
            {priced.quote.lines.map((line) => (
              <p key={line.label} className="wt-amount">
                <span>{line.label}</span>
                <span>{formatMoney(line.amountPence)}</span>
              </p>
            ))}
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
  const [error, setError] = useState("");
  useEffect(() => {
    if (!username) return;
    getTravel(username).then((result) => {
      if (result.status === "ready") setBookings(result.bookings);
    });
  }, [username]);
  const cancel = async (reference: string) => {
    if (!username) return;
    const result = await cancelTrip(username, reference);
    if (result.ok) setBookings(result.bookings);
    else setError("The booking was not cancelled.");
  };
  return (
    <div className="ps-wrap" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <h1>My trips</h1>
      {error ? <p className="wt-error">{error}</p> : null}
      {bookings === null ? <p>Loading your trips…</p> : bookings.length === 0 ? <p>You have no practice bookings yet.</p> : null}
      <div className="wt-results">
        {(bookings ?? []).map((booking) => (
          <article key={booking.reference} className="wt-panel">
            <h2>Reference {booking.reference}</h2>
            <p>Status: {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}</p>
            <p>Total {formatMoney(booking.totalPence)}</p>
            {booking.quote?.flight ? (
              <p>
                Flight {booking.quote.flight.from} to {booking.quote.flight.to} at {booking.quote.flight.depart}
              </p>
            ) : null}
            {booking.quote?.stay ? <p>{booking.quote.stay.name}</p> : null}
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
