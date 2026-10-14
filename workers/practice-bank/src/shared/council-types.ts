export type CouncilBill = {
  id: number;
  reference: string;
  yearLabel: string;
  issuedOn: string;
  periodStart: string;
  dueOn: string;
  instalmentNumber: number;
  instalmentsTotal: number;
  amountPence: number;
  status: "paid" | "unpaid";
};

export type CouncilPayment = {
  id: number;
  paidAt: string;
  amountPence: number;
  method: string;
  reference: string;
};

export type CouncilServiceRequest = {
  id: number;
  kind: string;
  topic: string;
  location: string | null;
  body: string;
  reference: string;
  status: string;
  submittedAt: string;
  replyAt: string | null;
  replyBody: string | null;
};

export type CouncilAccount = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  residentNumber: string;
  councilTaxReference: string;
  councilTaxBand: string;
  /** Positive when an instalment is still unpaid. */
  balancePence: number;
  bills: CouncilBill[];
  payments: CouncilPayment[];
  requests: CouncilServiceRequest[];
  bins: { nextDate: string; binType: string; briefing: string };
};
