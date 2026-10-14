/** Westford Council figures shared by the Worker and the website. */

export const COUNCIL = {
  name: "Westford Council",
  phone: "0306 999 0410",
  email: "contact@westfordcouncil.practice",
  addressLines: ["Westford Council", "Town Hall", "High Street", "Westford", "WE1 1HQ"],
} as const;

/** The instalment a new resident account owes. Historical payments are not invented, so the bank balance stays intact. */
export const COUNCIL_INSTALMENT_PENCE = 4000;

export const COUNCIL_REQUEST_KINDS = ["contact", "report", "bins", "housing", "benefits"] as const;

export type CouncilRequestKind = (typeof COUNCIL_REQUEST_KINDS)[number];
