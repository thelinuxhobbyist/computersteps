export const TRAVEL = {
  name: "Westford Travel",
  phone: "0306 999 0710",
  email: "help@westfordtravel.practice",
} as const;

export const AIRLINE = "Westford Air";

export type Airport = { code: string; name: string };

export const AIRPORTS: Record<string, Airport> = {
  London: { code: "LHR", name: "London Heathrow" },
  Manchester: { code: "MAN", name: "Manchester" },
  Edinburgh: { code: "EDI", name: "Edinburgh" },
  Bristol: { code: "BRS", name: "Bristol" },
  Cardiff: { code: "CWL", name: "Cardiff" },
};

export function airportOf(city: string): Airport {
  return AIRPORTS[city] ?? { code: city.slice(0, 3).toUpperCase(), name: city };
}

export type Flight = {
  id: string;
  flightNumber: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: number;
  /** Connection city when the flight is not direct. */
  via?: string;
  pricePence: number;
};

export type StayScene = "harbour" | "castle" | "canal" | "bridge" | "oldtown" | "quay" | "cottage" | "bay";

export type Stay = {
  id: string;
  kind: "hotel" | "rental";
  name: string;
  city: string;
  area: string;
  room: string;
  guests: number;
  nightlyPence: number;
  summary: string;
  facilities: string[];
  checkInFrom: string;
  checkOutBy: string;
  scene: StayScene;
};

export const FLIGHTS: Flight[] = [
  { id: "lon-edi-0810", flightNumber: "WF1842", from: "London", to: "Edinburgh", depart: "08:10", arrive: "09:35", duration: "1h 25m", stops: 0, pricePence: 6400 },
  { id: "lon-edi-1840", flightNumber: "WF2210", from: "London", to: "Edinburgh", depart: "18:40", arrive: "20:05", duration: "1h 25m", stops: 0, pricePence: 4900 },
  { id: "lon-edi-1115", flightNumber: "WF1604", from: "London", to: "Edinburgh", depart: "11:15", arrive: "14:40", duration: "3h 25m", stops: 1, via: "Manchester", pricePence: 3800 },
  { id: "lon-man-0745", flightNumber: "WF0908", from: "London", to: "Manchester", depart: "07:45", arrive: "08:50", duration: "1h 5m", stops: 0, pricePence: 4200 },
  { id: "lon-man-1620", flightNumber: "WF2416", from: "London", to: "Manchester", depart: "16:20", arrive: "17:25", duration: "1h 5m", stops: 0, pricePence: 5500 },
  { id: "man-brs-0930", flightNumber: "WF1120", from: "Manchester", to: "Bristol", depart: "09:30", arrive: "10:25", duration: "55m", stops: 0, pricePence: 3600 },
  { id: "brs-cdf-1210", flightNumber: "WF0744", from: "Bristol", to: "Cardiff", depart: "12:10", arrive: "12:40", duration: "30m", stops: 0, pricePence: 2800 },
  { id: "edi-lon-1005", flightNumber: "WF1902", from: "Edinburgh", to: "London", depart: "10:05", arrive: "11:30", duration: "1h 25m", stops: 0, pricePence: 6100 },
  { id: "edi-lon-1900", flightNumber: "WF2318", from: "Edinburgh", to: "London", depart: "19:00", arrive: "20:25", duration: "1h 25m", stops: 0, pricePence: 4700 },
  { id: "man-lon-1805", flightNumber: "WF1540", from: "Manchester", to: "London", depart: "18:05", arrive: "19:10", duration: "1h 5m", stops: 0, pricePence: 4400 },
];

export const STAYS: Stay[] = [
  {
    id: "harbour-hotel",
    kind: "hotel",
    name: "Harbour Hotel",
    city: "Edinburgh",
    area: "Leith",
    room: "Double room",
    guests: 2,
    nightlyPence: 9500,
    summary: "A 24-room hotel on the water at Leith, a short walk from the tram.",
    facilities: ["Breakfast", "Wi-Fi", "Lift"],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    scene: "harbour",
  },
  {
    id: "castle-view",
    kind: "hotel",
    name: "Castle View Hotel",
    city: "Edinburgh",
    area: "Old Town",
    room: "Queen room",
    guests: 2,
    nightlyPence: 12000,
    summary: "A quiet hotel on the Royal Mile, with a lounge looking towards the castle.",
    facilities: ["Wi-Fi", "Restaurant", "24-hour desk"],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    scene: "castle",
  },
  {
    id: "canal-hotel",
    kind: "hotel",
    name: "Canal Hotel",
    city: "Manchester",
    area: "Castlefield",
    room: "Double room",
    guests: 2,
    nightlyPence: 8000,
    summary: "A simple hotel beside the canal, about eight minutes' walk from Deansgate station.",
    facilities: ["Wi-Fi", "Tea and coffee"],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    scene: "canal",
  },
  {
    id: "bridge-hotel",
    kind: "hotel",
    name: "Bridge Hotel",
    city: "Bristol",
    area: "Harbourside",
    room: "Family room",
    guests: 3,
    nightlyPence: 8800,
    summary: "A city-centre hotel near the harbourside, with a family room and breakfast.",
    facilities: ["Wi-Fi", "Breakfast", "Family room"],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    scene: "bridge",
  },
  {
    id: "old-town-flat",
    kind: "rental",
    name: "Old Town Flat",
    city: "Edinburgh",
    area: "Lawnmarket",
    room: "One bedroom and a sofa bed",
    guests: 4,
    nightlyPence: 11000,
    summary: "A one-bedroom flat above a bakery, with a sofa bed in the living room.",
    facilities: ["Kitchen", "Wi-Fi", "Washing machine"],
    checkInFrom: "16:00",
    checkOutBy: "10:00",
    scene: "oldtown",
  },
  {
    id: "quayside",
    kind: "rental",
    name: "Quayside Apartment",
    city: "Manchester",
    area: "Salford Quays",
    room: "Studio",
    guests: 2,
    nightlyPence: 7500,
    summary: "A compact studio with a river view and a small kitchen.",
    facilities: ["Kitchen", "Wi-Fi"],
    checkInFrom: "16:00",
    checkOutBy: "10:00",
    scene: "quay",
  },
  {
    id: "harbour-cottage",
    kind: "rental",
    name: "Harbour Cottage",
    city: "Bristol",
    area: "Hotwells",
    room: "Two bedrooms",
    guests: 3,
    nightlyPence: 9800,
    summary: "A cottage with a small garden, about ten minutes from the harbourside.",
    facilities: ["Kitchen", "Garden", "Wi-Fi"],
    checkInFrom: "16:00",
    checkOutBy: "10:00",
    scene: "cottage",
  },
  {
    id: "bay-house",
    kind: "rental",
    name: "Bay House",
    city: "Cardiff",
    area: "Cardiff Bay",
    room: "Three bedrooms",
    guests: 5,
    nightlyPence: 13000,
    summary: "A house that sleeps five, with parking at the front and a kitchen.",
    facilities: ["Kitchen", "Parking", "Wi-Fi", "Washing machine"],
    checkInFrom: "16:00",
    checkOutBy: "10:00",
    scene: "bay",
  },
];

export const DESTINATIONS = ["London", "Manchester", "Edinburgh", "Bristol", "Cardiff"] as const;

export type PriceLine = { label: string; amountPence: number };

export type TravelQuote = {
  guests: number;
  departDate: string | null;
  returnDate: string | null;
  flight: Flight | null;
  returnFlight: Flight | null;
  stay: (Stay & { checkIn: string; checkOut: string; nights: number; totalPence: number }) | null;
  lines: PriceLine[];
  totalPence: number;
  /** Set when the booking is saved, from the learner's practice account. */
  passengerName?: string;
};

/** Splits a practice price into fare and tax without changing the total. */
export function fareParts(pricePence: number): { farePence: number; taxPence: number } {
  const taxPence = Math.round(pricePence * 0.13);
  return { farePence: pricePence - taxPence, taxPence };
}

export function stopsText(flight: Pick<Flight, "stops" | "via">): string {
  if (flight.stops <= 0) return "Direct";
  const stop = `${flight.stops} stop${flight.stops === 1 ? "" : "s"}`;
  return flight.via ? `${stop} · ${flight.via}` : stop;
}

/** Cabin bag on every practice fare. Cheaper fares do not include a checked bag. */
export function baggageFor(flight: Pick<Flight, "pricePence">): { cabin: string; checked: string } {
  return {
    cabin: "1 cabin bag (10 kg)",
    checked: flight.pricePence < 4500 ? "No checked bag on this fare" : "1 checked bag (23 kg)",
  };
}

function flightFareLabel(flight: Flight, kind: "Flight" | "Return flight"): string {
  const number = flight.flightNumber ? ` · ${flight.flightNumber}` : "";
  return `${kind} fare${number} · ${flight.from} to ${flight.to}`;
}

export function buildLines(quote: Pick<TravelQuote, "flight" | "returnFlight" | "stay">): PriceLine[] {
  const lines: PriceLine[] = [];
  if (quote.flight) {
    const parts = fareParts(quote.flight.pricePence);
    lines.push({ label: flightFareLabel(quote.flight, "Flight"), amountPence: parts.farePence });
    lines.push({ label: "Flight taxes and charges", amountPence: parts.taxPence });
  }
  if (quote.returnFlight) {
    const parts = fareParts(quote.returnFlight.pricePence);
    lines.push({ label: flightFareLabel(quote.returnFlight, "Return flight"), amountPence: parts.farePence });
    lines.push({ label: "Return taxes and charges", amountPence: parts.taxPence });
  }
  if (quote.stay) {
    const parts = fareParts(quote.stay.totalPence);
    const nights = quote.stay.nights;
    lines.push({
      label: `${quote.stay.name} · ${nights} night${nights === 1 ? "" : "s"}`,
      amountPence: parts.farePence,
    });
    lines.push({ label: "Stay taxes and charges", amountPence: parts.taxPence });
  }
  return lines;
}

/** Fare breakdown for display. Older saved quotes used a single line per flight; the total stays the same. */
export function displayLines(quote: TravelQuote): PriceLine[] {
  const lines = buildLines(quote);
  const sum = lines.reduce((total, line) => total + line.amountPence, 0);
  return lines.length > 0 && sum === quote.totalPence ? lines : quote.lines;
}

export function nightsBetween(checkIn: string, checkOut: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return null;
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const nights = Math.round((end - start) / 86_400_000);
  return nights >= 1 && nights <= 14 ? nights : null;
}

function readIsoDate(value: string | undefined): string | null | "invalid" {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return "invalid";
  return value;
}

export function quoteTrip(input: {
  flightId?: string;
  returnFlightId?: string;
  stayId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  departDate?: string;
  returnDate?: string;
}): { ok: true; quote: TravelQuote } | { ok: false; error: string } {
  const guests = input.guests ?? 1;
  if (!Number.isInteger(guests) || guests < 1 || guests > 6) return { ok: false, error: "Choose between 1 and 6 travellers." };

  const flight = input.flightId ? FLIGHTS.find((item) => item.id === input.flightId) ?? null : null;
  const returnFlight = input.returnFlightId ? FLIGHTS.find((item) => item.id === input.returnFlightId) ?? null : null;
  if (input.flightId && !flight) return { ok: false, error: "Choose a flight from the list." };
  if (input.returnFlightId && !returnFlight) return { ok: false, error: "Choose a return flight from the list." };
  if (flight && returnFlight && (returnFlight.from !== flight.to || returnFlight.to !== flight.from)) {
    return { ok: false, error: "The return flight must go back to the city you left." };
  }

  const departDate = readIsoDate(input.departDate);
  if (departDate === "invalid") return { ok: false, error: "Choose a departure date." };
  const parsedReturn = readIsoDate(input.returnDate);
  if (parsedReturn === "invalid") return { ok: false, error: "Choose a return date." };
  const returnDate = returnFlight ? parsedReturn : null;
  if (departDate && returnDate && returnDate <= departDate) {
    return { ok: false, error: "The return date must be after the departure date." };
  }

  const staySource = input.stayId ? STAYS.find((item) => item.id === input.stayId) ?? null : null;
  if (input.stayId && !staySource) return { ok: false, error: "Choose a place to stay from the list." };
  if (staySource && guests > staySource.guests) return { ok: false, error: `${staySource.name} sleeps ${staySource.guests}.` };

  let stay: TravelQuote["stay"] = null;
  if (staySource) {
    if (!input.checkIn || !input.checkOut) return { ok: false, error: "Choose a check-in and check-out date." };
    const nights = nightsBetween(input.checkIn, input.checkOut);
    if (nights === null) return { ok: false, error: "A stay can be from 1 to 14 nights." };
    stay = { ...staySource, checkIn: input.checkIn, checkOut: input.checkOut, nights, totalPence: nights * staySource.nightlyPence };
  }

  if (!flight && !stay) return { ok: false, error: "Choose a flight, a place to stay, or both." };

  const lines = buildLines({ flight: flight ?? null, returnFlight: returnFlight ?? null, stay });
  const totalPence = lines.reduce((sum, line) => sum + line.amountPence, 0);
  return {
    ok: true,
    quote: {
      guests,
      departDate,
      returnDate,
      flight: flight ?? null,
      returnFlight: returnFlight ?? null,
      stay,
      lines,
      totalPence,
    },
  };
}
