export type MobileBill = {
  id: number;
  reference: string;
  periodLabel: string;
  issuedOn: string;
  dueOn: string;
  amountPence: number;
  status: "paid" | "unpaid";
};

export type MobilePayment = { id: number; paidAt: string; amountPence: number; reference: string };

export type MobileMessage = {
  id: number;
  sentAt: string;
  topic: string;
  message: string;
  reference: string;
  status: string;
  replyBody: string | null;
};

export type MobileAccount = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  customerNumber: string;
  mobileNumber: string;
  planId: string;
  planName: string;
  monthlyPence: number;
  balancePence: number;
  usage: {
    dataUsedGb: number;
    dataAllowanceGb: number;
    dataRemainingGb: number;
    minutesUsed: number;
    minutesAllowance: string;
    textsUsed: number;
    textsAllowance: string;
    resetsOn: string;
  };
  bills: MobileBill[];
  payments: MobilePayment[];
  messages: MobileMessage[];
};
