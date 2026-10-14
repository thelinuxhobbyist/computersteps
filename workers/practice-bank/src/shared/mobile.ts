export const MOBILE = {
  name: "Westford Mobile",
  phone: "0306 999 0510",
  email: "help@westfordmobile.practice",
} as const;

export const MOBILE_PLANS = [
  { id: "essential", name: "Essential", dataGb: 5, minutes: "200", texts: "200", monthlyPence: 1200 },
  { id: "everyday", name: "Everyday", dataGb: 25, minutes: "500", texts: "Unlimited", monthlyPence: 1800 },
  { id: "unlimited", name: "Unlimited", dataGb: 100, minutes: "Unlimited", texts: "Unlimited", monthlyPence: 2500 },
] as const;

export type MobilePlanId = (typeof MOBILE_PLANS)[number]["id"];

export const MOBILE_TOPICS = [
  { id: "internet", label: "Mobile internet is not working" },
  { id: "bill", label: "A question about my bill" },
  { id: "plan", label: "Changing my plan" },
  { id: "handset", label: "My phone or SIM" },
  { id: "other", label: "Something else" },
] as const;

export const CURRENT_BILL_PENCE = 2500;
export const PREVIOUS_BILL_PENCE = 1800;

export function planById(id: string) {
  return MOBILE_PLANS.find((plan) => plan.id === id) ?? MOBILE_PLANS[1];
}

/** Sample usage stays the same for a plan, so practice tasks do not change between page loads. */
export function usageFor(planId: string) {
  const plan = planById(planId);
  const dataUsedGb = Math.min(12, plan.dataGb - 1);
  return {
    dataUsedGb,
    dataAllowanceGb: plan.dataGb,
    dataRemainingGb: plan.dataGb - dataUsedGb,
    minutesUsed: plan.minutes === "Unlimited" ? 180 : Math.min(180, Number(plan.minutes)),
    minutesAllowance: plan.minutes,
    textsUsed: plan.texts === "Unlimited" ? 90 : Math.min(90, Number(plan.texts)),
    textsAllowance: plan.texts,
    resetsOn: "2026-11-01",
  };
}
