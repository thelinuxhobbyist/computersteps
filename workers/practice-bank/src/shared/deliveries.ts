export const DELIVERIES = {
  name: "Westford Deliveries",
  phone: "0306 999 0610",
  email: "help@westforddeliveries.practice",
} as const;

export const COLLECTION_POINT = {
  name: "Westford Library Counter",
  address: "12 Market Street, Westford, WE1 2AA",
  hours: "Monday to Friday 9am to 5pm. Saturday 9am to 1pm. Closed Sunday.",
} as const;

export type ParcelStatus = "label_created" | "received" | "in_transit" | "out_for_delivery" | "attempted" | "delivered";

export type DeliveryAction = "change_date" | "safe_place" | "neighbour" | "collection_point" | "instructions" | "correct_address" | "support";

export type ParcelRecord = {
  code: string;
  status: ParcelStatus;
  statusLabel: string;
  estimatedDelivery: string | null;
  note: string;
  history: { at: string; label: string }[];
  /** Inclusive calendar range when the parcel can be rebooked. Empty when the date cannot change. */
  dateFrom: string;
  dateTo: string;
  actions: DeliveryAction[];
};

const HISTORY = {
  created: { at: "2026-10-10", label: "Label created" },
  received: { at: "2026-10-11", label: "Parcel received at the Westford depot" },
  transit: { at: "2026-10-13", label: "In transit to the local depot" },
  out: { at: "2026-10-14", label: "Out for delivery" },
  attempted: { at: "2026-10-13", label: "Delivery attempted. Nobody was in, and no safe place was nominated." },
  delivered: { at: "2026-10-10", label: "Delivered" },
};

export const PARCELS: ParcelRecord[] = [
  {
    code: "WF48271936",
    status: "in_transit",
    statusLabel: "In transit",
    estimatedDelivery: "2026-10-16",
    note: "The parcel is on its way to the local depot.",
    history: [HISTORY.created, HISTORY.received, HISTORY.transit],
    dateFrom: "2026-10-17",
    dateTo: "2026-11-16",
    actions: ["change_date", "safe_place", "neighbour", "collection_point", "instructions", "correct_address"],
  },
  {
    code: "WF19384720",
    status: "out_for_delivery",
    statusLabel: "Out for delivery",
    estimatedDelivery: "2026-10-14",
    note: "A driver has this parcel and expects to deliver it today.",
    history: [HISTORY.created, HISTORY.received, HISTORY.transit, HISTORY.out],
    dateFrom: "",
    dateTo: "",
    actions: ["safe_place", "neighbour", "instructions"],
  },
  {
    code: "WF55019283",
    status: "attempted",
    statusLabel: "Delivery attempted",
    estimatedDelivery: "2026-10-15",
    note: "We tried to deliver this parcel on 13 October 2026. Nobody was in, and no safe place was nominated.",
    history: [HISTORY.created, HISTORY.received, HISTORY.transit, HISTORY.attempted],
    dateFrom: "2026-10-16",
    dateTo: "2026-11-15",
    actions: ["change_date", "safe_place", "neighbour", "collection_point", "instructions"],
  },
  {
    code: "WF22018475",
    status: "delivered",
    statusLabel: "Delivered",
    estimatedDelivery: null,
    note: "This parcel was delivered on 10 October 2026.",
    history: [HISTORY.created, HISTORY.delivered],
    dateFrom: "",
    dateTo: "",
    actions: [],
  },
  {
    code: "WF77190334",
    status: "label_created",
    statusLabel: "Label created",
    estimatedDelivery: "2026-10-18",
    note: "The sender has created a label. We have not received the parcel yet.",
    history: [HISTORY.created],
    dateFrom: "2026-10-19",
    dateTo: "2026-11-18",
    actions: ["change_date", "safe_place", "instructions", "correct_address"],
  },
  {
    code: "WF33018462",
    status: "received",
    statusLabel: "Parcel received",
    estimatedDelivery: "2026-10-17",
    note: "The parcel is at the Westford depot and has not left for delivery yet.",
    history: [HISTORY.created, HISTORY.received],
    dateFrom: "2026-10-18",
    dateTo: "2026-11-17",
    actions: ["change_date", "safe_place", "neighbour", "collection_point", "instructions", "correct_address"],
  },
];

export function findParcel(code: string): ParcelRecord | undefined {
  const cleaned = code.replace(/\s/g, "").toUpperCase();
  return PARCELS.find((parcel) => parcel.code === cleaned);
}

export const ACTION_LABELS: Record<DeliveryAction, string> = {
  change_date: "Change the delivery date",
  safe_place: "Leave it in a safe place",
  neighbour: "Deliver to a neighbour",
  collection_point: "Send it to a collection point",
  instructions: "Add delivery instructions",
  correct_address: "Correct the address",
  support: "Ask for help",
};
