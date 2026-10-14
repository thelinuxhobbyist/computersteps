"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { setLearner, useLearner } from "../../lib/learner-session";
import { formatDay } from "../energy/energy-data";
import { formatMoney } from "../practice-bank/bank-data";
import { getAccount } from "../practice-bank/bank-api";
import { BANK_BASE } from "../practice-bank/bank-data";
import { DESTINATIONS, FLIGHTS, STAYS, quoteTrip } from "../../../workers/practice-bank/src/shared/travel";
import { bookTrip, cancelTrip, getTravel, type TravelBooking } from "./travel-api";

function Picture({ label }: { label: string }) {
  return (
    <div aria-hidden="true" style={{ height: 88, borderRadius: 8, background: "linear-gradient(135deg,#0e4d5c,#c4492c)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>
      {label}
    </div>
  );
}

export function TravelSearch() {
  return (
    <div className="ps-wrap">
      <h1>Search for a practice trip</h1>
      <p>Choose flights, a hotel or a holiday rental. Prices are examples. Nothing is a real booking.</p>
      <div className="ps-grid">
        <FlightSearch />
        <StaySearch kind="hotel" title="Hotels" />
        <StaySearch kind="rental" title="Holiday rentals" />
      </div>
    </div>
  );
}

function FlightSearch() {
  const router = useRouter();
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Edinburgh");
  const [depart, setDepart] = useState("2026-11-02");
  const [ret, setRet] = useState("2026-11-04");
  const [travellers, setTravellers] = useState("1");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (from === to) {
      setError("Choose two different cities.");
      return;
    }
    if (ret <= depart) {
      setError("The return date must be after the departure date.");
      return;
    }
    const params = new URLSearchParams({ from, to, depart, return: ret, travellers });
    router.push(`/scenarios/travel/flights/?${params.toString()}`);
  };
  return (
    <form className="ps-panel" onSubmit={submit}>
      <h2>Flights</h2>
      {error ? <p className="ps-error">{error}</p> : null}
      <CityField id="wt-from" label="From" value={from} onChange={setFrom} />
      <CityField id="wt-to" label="To" value={to} onChange={setTo} />
      <div className="ps-field">
        <label htmlFor="wt-depart">Depart</label>
        <input id="wt-depart" type="date" value={depart} onChange={(event) => setDepart(event.target.value)} />
      </div>
      <div className="ps-field">
        <label htmlFor="wt-return">Return</label>
        <input id="wt-return" type="date" value={ret} onChange={(event) => setRet(event.target.value)} />
      </div>
      <div className="ps-field">
        <label htmlFor="wt-travellers">Travellers</label>
        <input id="wt-travellers" inputMode="numeric" value={travellers} onChange={(event) => setTravellers(event.target.value)} />
      </div>
      <button className="ps-btn" type="submit">
        Search flights
      </button>
    </form>
  );
}

function StaySearch({ kind, title }: { kind: "hotel" | "rental"; title: string }) {
  const router = useRouter();
  const [city, setCity] = useState("Edinburgh");
  const [checkIn, setCheckIn] = useState("2026-11-02");
  const [checkOut, setCheckOut] = useState("2026-11-04");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    const path = kind === "hotel" ? "hotels" : "rentals";
    router.push(`/scenarios/travel/${path}/?${new URLSearchParams({ city, checkIn, checkOut, guests }).toString()}`);
  };
  return (
    <form className="ps-panel" onSubmit={submit}>
      <h2>{title}</h2>
      {error ? <p className="ps-error">{error}</p> : null}
      <CityField id={`${kind}-city`} label="City" value={city} onChange={setCity} />
      <div className="ps-field">
        <label htmlFor={`${kind}-in`}>Check in</label>
        <input id={`${kind}-in`} type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
      </div>
      <div className="ps-field">
        <label htmlFor={`${kind}-out`}>Check out</label>
        <input id={`${kind}-out`} type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
      </div>
      <div className="ps-field">
        <label htmlFor={`${kind}-guests`}>Guests</label>
        <input id={`${kind}-guests`} inputMode="numeric" value={guests} onChange={(event) => setGuests(event.target.value)} />
      </div>
      <button className="ps-btn" type="submit">
        Search
      </button>
    </form>
  );
}

function CityField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="ps-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {DESTINATIONS.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
    </div>
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
  const inbound = FLIGHTS.filter((flight) => flight.from === to && flight.to === from);
  return (
    <div className="ps-wrap">
      <h1>
        Flights from {from} to {to}
      </h1>
      <p>
        Outbound {formatDay(depart)}. Return {formatDay(ret)}. {travellers} traveller{travellers === "1" ? "" : "s"}. Compare the price and the departure time.
      </p>
      <h2>Outbound</h2>
      <div className="ps-grid">
        {outbound.map((flight) => (
          <article key={flight.id} className="ps-panel">
            <h3>
              {flight.depart}–{flight.arrive}
            </h3>
            <p>
              {flight.duration} · {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
            </p>
            <p>{formatMoney(flight.pricePence)}</p>
            <Link href={`/scenarios/travel/book/?flight=${flight.id}&guests=${travellers}`}>Choose this flight</Link>
          </article>
        ))}
      </div>
      {outbound.length === 0 ? <p>No flights match those cities. Try London to Edinburgh.</p> : null}
      <h2>Return</h2>
      <div className="ps-grid">
        {inbound.map((flight) => (
          <article key={flight.id} className="ps-panel">
            <h3>
              {flight.depart}–{flight.arrive}
            </h3>
            <p>{formatMoney(flight.pricePence)}</p>
            <p>Add this on the booking page after you choose an outbound flight, or open a return on its own.</p>
            <Link href={`/scenarios/travel/book/?flight=${flight.id}&guests=${travellers}`}>Choose</Link>
          </article>
        ))}
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
  const city = params.get("city") ?? "";
  const checkIn = params.get("checkIn") ?? "2026-11-02";
  const checkOut = params.get("checkOut") ?? "2026-11-04";
  const guests = Number(params.get("guests") ?? "2");
  const stays = STAYS.filter((stay) => stay.kind === kind && (!city || stay.city === city) && stay.guests >= guests);
  return (
    <div className="ps-wrap">
      <h1>{kind === "hotel" ? "Hotels" : "Holiday rentals"}</h1>
      <p>
        {checkIn && checkOut ? `${formatDay(checkIn)} to ${formatDay(checkOut)}. ` : ""}
        {guests} guest{guests === 1 ? "" : "s"}.
      </p>
      <div className="ps-grid">
        {stays.map((stay) => {
          const priced = quoteTrip({ stayId: stay.id, checkIn, checkOut, guests });
          const total = priced.ok ? priced.quote.totalPence : stay.nightlyPence;
          return (
            <article key={stay.id} className="ps-panel">
              <Picture label={stay.city} />
              <h2>{stay.name}</h2>
              <p>{stay.summary}</p>
              <p>Sleeps {stay.guests}. {stay.facilities.join(", ")}.</p>
              <p>
                {formatMoney(stay.nightlyPence)} a night · {formatMoney(total)} for the stay
              </p>
              <Link href={`/scenarios/travel/book/?stay=${stay.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}>Choose</Link>
            </article>
          );
        })}
      </div>
      {stays.length === 0 ? <p>Nothing matches that search. Try Edinburgh for 2 guests.</p> : null}
    </div>
  );
}

export function BookingPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading your booking…</p>}>
      <BookingForm />
    </Suspense>
  );
}

function BookingForm() {
  const params = useSearchParams();
  const username = useLearner();
  const attempt = useRef<string | null>(null);
  const [outbound, setOutbound] = useState(params.get("flight") ?? "");
  const [inbound, setInbound] = useState(params.get("returnFlight") ?? "");
  const [signIn, setSignIn] = useState("");
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
  const returns = priced.ok && priced.quote.flight ? FLIGHTS.filter((flight) => flight.from === priced.quote.flight?.to && flight.to === priced.quote.flight?.from) : [];

  const pay = async () => {
    if (!username || !priced.ok || busy) return;
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
      },
      attempt.current,
    );
    setBusy(false);
    if (result.ok) {
      setDone({ reference: result.reference, balancePence: result.balancePence });
      setError("");
      return;
    }
    setError(result.reason === "insufficient-funds" ? `Practice Bank does not have enough money. Balance: ${formatMoney(result.balancePence)}. The booking was not confirmed.` : result.message ?? "The booking was not confirmed.");
  };

  const sign = async (event: FormEvent) => {
    event.preventDefault();
    const result = await getAccount(signIn.trim());
    if (result.status === "ready") setLearner(result.account.username);
    else setError("We can't find that username.");
  };

  return (
    <div className="ps-wrap">
      <h1>Review booking</h1>
      {!priced.ok ? <p className="ps-error">{priced.error}</p> : null}
      {priced.ok ? (
        <div className="ps-panel">
          {priced.quote.flight ? (
            <p>
              Flight {priced.quote.flight.from} to {priced.quote.flight.to}, departs {priced.quote.flight.depart}, {formatMoney(priced.quote.flight.pricePence)}
            </p>
          ) : null}
          {returns.length > 0 ? (
            <div className="ps-field">
              <label htmlFor="wt-return-flight">Add a return flight</label>
              <select id="wt-return-flight" value={inbound} onChange={(event) => setInbound(event.target.value)}>
                <option value="">No return flight</option>
                {returns.map((flight) => (
                  <option key={flight.id} value={flight.id}>
                    {flight.depart} · {formatMoney(flight.pricePence)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {priced.quote.stay ? (
            <p>
              {priced.quote.stay.name}, {formatDay(priced.quote.stay.checkIn)} to {formatDay(priced.quote.stay.checkOut)} ({priced.quote.stay.nights} nights)
            </p>
          ) : null}
          <ul>
            {priced.quote.lines.map((line) => (
              <li key={line.label}>
                {line.label}: {formatMoney(line.amountPence)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total {formatMoney(priced.quote.totalPence)}</strong> for {priced.quote.guests} guest{priced.quote.guests === 1 ? "" : "s"}
          </p>
        </div>
      ) : null}
      {done ? (
        <p className="ps-ok">
          Booking confirmed. Reference <strong>{done.reference}</strong>.
          {done.balancePence !== null ? ` Practice Bank balance: ${formatMoney(done.balancePence)}.` : ""}{" "}
          <Link href="/scenarios/travel/trips/">My trips</Link>
        </p>
      ) : null}
      {error ? <p className="ps-error">{error}</p> : null}
      {!username ? (
        <form onSubmit={sign}>
          <div className="ps-field">
            <label htmlFor="wt-user">Computer Steps username</label>
            <input id="wt-user" value={signIn} onChange={(event) => setSignIn(event.target.value)} />
          </div>
          <button className="ps-btn" type="submit">
            Sign in
          </button>
          <p>
            <Link href={`${BANK_BASE}/open-account/`}>Open a Practice Bank account</Link>
          </p>
        </form>
      ) : priced.ok && !done ? (
        <button type="button" className="ps-btn ps-btn--accent" onClick={pay} disabled={busy}>
          {busy ? "Paying…" : `Pay ${formatMoney(priced.quote.totalPence)} with Practice Bank`}
        </button>
      ) : null}
    </div>
  );
}

export function MyTrips() {
  const username = useLearner();
  const [bookings, setBookings] = useState<TravelBooking[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!username) return;
    getTravel(username).then((result) => {
      if (result.status === "ready") setBookings(result.bookings);
    });
  }, [username]);
  const sign = async (event: FormEvent) => {
    event.preventDefault();
    const result = await getAccount(name.trim());
    if (result.status === "ready") setLearner(result.account.username);
    else setError("We can't find that username.");
  };
  const cancel = async (reference: string) => {
    if (!username) return;
    const result = await cancelTrip(username, reference);
    if (result.ok) setBookings(result.bookings);
    else setError("The booking was not cancelled.");
  };
  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>My trips</h1>
        <form className="ps-panel" onSubmit={sign}>
          {error ? <p className="ps-error">{error}</p> : null}
          <div className="ps-field">
            <label htmlFor="wt-trips-user">Username</label>
            <input id="wt-trips-user" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <button className="ps-btn" type="submit">
            Sign in
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="ps-wrap">
      <h1>My trips</h1>
      {error ? <p className="ps-error">{error}</p> : null}
      {bookings === null ? <p>Loading your trips…</p> : bookings.length === 0 ? <p>You have no practice bookings yet.</p> : null}
      <ul>
        {(bookings ?? []).map((booking) => (
          <li key={booking.reference} className="ps-panel">
            <h2>Reference {booking.reference}</h2>
            <p>Status: {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}</p>
            <p>Total {formatMoney(booking.totalPence)}</p>
            {booking.quote?.flight ? (
              <p>
                Flight {booking.quote.flight.from} to {booking.quote.flight.to} at {booking.quote.flight.depart}
              </p>
            ) : null}
            {booking.quote?.stay ? <p>{booking.quote.stay.name}</p> : null}
            {booking.paymentReference ? <p>Payment {booking.paymentReference}</p> : null}
            {booking.status === "confirmed" ? (
              <button type="button" className="ps-btn ps-btn--ghost" onClick={() => cancel(booking.reference)}>
                Cancel and refund
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
