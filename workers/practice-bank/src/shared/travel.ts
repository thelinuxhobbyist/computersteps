export const TRAVEL = {
  name: "Westford Travel",
  phone: "0306 999 0710",
  email: "help@westfordtravel.practice",
} as const;

export type Flight = {
  id: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: number;
  pricePence: number;
};

export type Stay = {
  id: string;
  kind: "hotel" | "rental";
  name: string;
  city: string;
  guests: number;
  nightlyPence: number;
  summary: string;
  facilities: string[];
};

export const FLIGHTS: Flight[] = [
  { id: "lon-edi-0810", from: "London", to: "Edinburgh", depart: "08:10", arrive: "09:35", duration: "1h 25m", stops: 0, pricePence: 6400 },
  { id: "lon-edi-1840", from: "London", to: "Edinburgh", depart: "18:40", arrive: "20:05", duration: "1h 25m", stops: 0, pricePence: 4900 },
  { id: "lon-edi-1115", from: "London", to: "Edinburgh", depart: "11:15", arrive: "14:40", duration: "3h 25m", stops: 1, pricePence: 3800 },
  { id: "lon-man-0745", from: "London", to: "Manchester", depart: "07:45", arrive: "08:50", duration: "1h 5m", stops: 0, pricePence: 4200 },
  { id: "lon-man-1620", from: "London", to: "Manchester", depart: "16:20", arrive: "17:25", duration: "1h 5m", stops: 0, pricePence: 5500 },
  { id: "man-brs-0930", from: "Manchester", to: "Bristol", depart: "09:30", arrive: "10:25", duration: "55m", stops: 0, pricePence: 3600 },
  { id: "brs-cdf-1210", from: "Bristol", to: "Cardiff", depart: "12:10", arrive: "12:40", duration: "30m", stops: 0, pricePence: 2800 },
  { id: "edi-lon-1005", from: "Edinburgh", to: "London", depart: "10:05", arrive: "11:30", duration: "1h 25m", stops: 0, pricePence: 6100 },
  { id: "edi-lon-1900", from: "Edinburgh", to: "London", depart: "19:00", arrive: "20:25", duration: "1h 25m", stops: 0, pricePence: 4700 },
  { id: "man-lon-1805", from: "Manchester", to: "London", depart: "18:05", arrive: "19:10", duration: "1h 5m", stops: 0, pricePence: 4400 },
];

export const STAYS: Stay[] = [
  { id: "harbour-hotel", kind: "hotel", name: "Harbour Hotel", city: "Edinburgh", guests: 2, nightlyPence: 9500, summary: "A small hotel by the water, with breakfast included.", facilities: ["Breakfast", "Wi-Fi", "Lift"] },
  { id: "castle-view", kind: "hotel", name: "Castle View Hotel", city: "Edinburgh", guests: 2, nightlyPence: 12000, summary: "Rooms looking towards the castle, with a quiet lounge.", facilities: ["Wi-Fi", "Restaurant", "24-hour desk"] },
  { id: "canal-hotel", kind: "hotel", name: "Canal Hotel", city: "Manchester", guests: 2, nightlyPence: 8000, summary: "A simple hotel a short walk from the station.", facilities: ["Wi-Fi", "Tea and coffee"] },
  { id: "bridge-hotel", kind: "hotel", name: "Bridge Hotel", city: "Bristol", guests: 3, nightlyPence: 8800, summary: "A city-centre hotel near the harbourside.", facilities: ["Wi-Fi", "Breakfast", "Family room"] },
  { id: "old-town-flat", kind: "rental", name: "Old Town Flat", city: "Edinburgh", guests: 4, nightlyPence: 11000, summary: "A one-bedroom flat with a sofa bed, above a bakery.", facilities: ["Kitchen", "Wi-Fi", "Washing machine"] },
  { id: "quayside", kind: "rental", name: "Quayside Apartment", city: "Manchester", guests: 2, nightlyPence: 7500, summary: "A compact apartment with a river view.", facilities: ["Kitchen", "Wi-Fi"] },
  { id: "harbour-cottage", kind: "rental", name: "Harbour Cottage", city: "Bristol", guests: 3, nightlyPence: 9800, summary: "A cottage with a small garden, ten minutes from the centre.", facilities: ["Kitchen", "Garden", "Wi-Fi"] },
  { id: "bay-house", kind: "rental", name: "Bay House", city: "Cardiff", guests: 5, nightlyPence: 13000, summary: "A house that sleeps five, with parking.", facilities: ["Kitchen", "Parking", "Wi-Fi", "Washing machine"] },
];

export const DESTINATIONS = ["London", "Manchester", "Edinburgh", "Bristol", "Cardiff"] as const;

export type PriceLine = { label: string; amountPence: number };

export type TravelQuote = {
  guests: number;
  flight: Flight | null;
  returnFlight: Flight | null;
  stay: (Stay & { checkIn: string; checkOut: string; nights: number; totalPence: number }) | null;
  lines: PriceLine[];
  totalPence: number;
};

export function nightsBetween(checkIn: string, checkOut: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return null;
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const nights = Math.round((end - start) / 86_400_000);
  return nights >= 1 && nights <= 14 ? nights : null;
}

export function quoteTrip(input: {
  flightId?: string;
  returnFlightId?: string;
  stayId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
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

  const lines: PriceLine[] = [];
  if (flight) lines.push({ label: `Flight ${flight.from} to ${flight.to}`, amountPence: flight.pricePence });
  if (returnFlight) lines.push({ label: `Return flight ${returnFlight.from} to ${returnFlight.to}`, amountPence: returnFlight.pricePence });
  if (stay) lines.push({ label: `${stay.name} · ${stay.nights} night${stay.nights === 1 ? "" : "s"}`, amountPence: stay.totalPence });
  const totalPence = lines.reduce((sum, line) => sum + line.amountPence, 0);
  return { ok: true, quote: { guests, flight: flight ?? null, returnFlight: returnFlight ?? null, stay, lines, totalPence } };
}
