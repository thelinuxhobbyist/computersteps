import {
  buildStarterHistory,
  checkCardDetails,
  checkDeliveryDetails,
  cleanReference,
  makeCard,
  makeIdentity,
  normaliseCardNumber,
  readAmount,
  readCardDetails,
  TOP_UP_PENCE,
  readDeliveryDetails,
  usernameKey,
  validateUsername,
} from "./bank";
import { ensureIdentity, identityOf, insertTransactions, loadAccount, type AccountRow } from "./accounts";
import {
  cancelDirectDebit,
  getEnergy,
  payByBankTransfer,
  payEnergyByCard,
  sendEnergyMessage,
  setUpDirectDebit,
  submitMeterReading,
} from "./energy-store";
import {
  answerTask,
  checkTask,
  getCurrentTask,
  learnerSummary,
  listLearners,
  nextTask,
  showHint,
  skipTask,
  tutorAllowed,
  tutorStart,
  tutorStop,
} from "./exercises/store";
import { corsHeaders, json, readJson, secureRandom } from "./http";
import { getCouncil, payCouncilTax, sendCouncilRequest } from "./council-store";
import { getDeliveries, saveDeliveryRequest } from "./delivery-store";
import { changeMobilePlan, getMobile, payMobileBill, sendMobileMessage } from "./mobile-store";
import { checkJobsExercise, getJobs, saveJob, submitJobApplication } from "./jobs-store";
import { searchAddresses } from "./place-search";
import { bookTrip, cancelTrip, getTravel } from "./travel-store";
import { creditSharedBalance, debitSharedBalance, readIdempotencyKey } from "./payments";
import { createPatient, getPatient, orderPrescription } from "./patients";

const INACTIVE_DAYS = 365;

async function createAccount(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const checked = validateUsername(body.username);
  if ("error" in checked) return json({ error: "invalid_username", message: checked.error }, 400);

  const key = usernameKey(checked.username);
  const existing = await env.BANK_DB.prepare("SELECT 1 FROM accounts WHERE username_key = ?").bind(key).first();
  if (existing) return json({ error: "username_taken" }, 409);

  const now = new Date();
  const history = buildStarterHistory(now, secureRandom);

  const identity = makeIdentity(secureRandom);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const card = makeCard(identity.fullName, now, secureRandom);
    try {
      await env.BANK_DB.batch([
        env.BANK_DB.prepare(
          `INSERT INTO accounts (username_key, username, name_on_card, card_number, expiry, cvv, sort_code, account_number,
             opening_balance_pence, created_at, last_used_at, full_name, address_line1, town_or_city, postcode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          key,
          checked.username,
          card.nameOnCard,
          card.cardNumber,
          card.expiry,
          card.cvv,
          card.sortCode,
          card.accountNumber,
          history.openingBalancePence,
          now.toISOString(),
          now.toISOString(),
          identity.fullName,
          identity.addressLine1,
          identity.townOrCity,
          identity.postcode,
        ),
        insertTransactions(env.BANK_DB, key, history.transactions),
      ]);
      return json({ account: await loadAccount(env.BANK_DB, key) }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("accounts.username_key")) return json({ error: "username_taken" }, 409);
      if (!message.includes("accounts.card_number")) throw error;
    }
  }

  throw new Error("Could not generate a unique card number.");
}

async function takePayment(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const amountPence = readAmount(body.amountPence);
  if (amountPence === null) return json({ error: "bad_amount" }, 400);

  const details = readCardDetails(body);
  const found = await env.BANK_DB.prepare("SELECT * FROM accounts WHERE card_number = ?")
    .bind(normaliseCardNumber(details.cardNumber))
    .first<AccountRow>();
  if (!found) return json({ error: "card_not_found" }, 404);
  const account = await ensureIdentity(env.BANK_DB, found);

  const errors = {
    ...checkDeliveryDetails(identityOf(account), readDeliveryDetails(body)),
    ...checkCardDetails(
      { nameOnCard: account.name_on_card, cardNumber: account.card_number, expiry: account.expiry, cvv: account.cvv },
      details,
    ),
  };
  if (Object.keys(errors).length > 0) return json({ error: "card_details_wrong", errors }, 400);

  const key = account.username_key;
  const now = new Date().toISOString();
  const reference = cleanReference(body.reference);

  // The shop order number is the idempotency key, so a repeated checkout cannot charge twice.
  const debit = await debitSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence,
    postedAt: now,
    description: "Westford Foods",
    type: "Card payment",
    category: "Shopping",
    reference: reference ?? `PS${now.slice(0, 10)}`,
    idempotencyKey: reference ? `shop-${reference}` : null,
  });

  if (!debit.ok) {
    if (debit.error === "insufficient_funds") return json({ error: "insufficient_funds", balancePence: debit.balancePence }, 402);
    return json({ error: debit.error }, 409);
  }
  return json({ ok: true, duplicate: debit.duplicate, username: account.username, balancePence: debit.balancePence });
}

/** Adds another £500 of pretend money. Each new idempotency key is a separate top-up. */
async function addPracticeMoney(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const checked = validateUsername(rawUsername);
  if ("error" in checked) return json({ error: "account_not_found" }, 404);
  const key = usernameKey(checked.username);
  const found = await env.BANK_DB.prepare("SELECT 1 FROM accounts WHERE username_key = ?").bind(key).first();
  if (!found) return json({ error: "account_not_found" }, 404);

  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (idempotencyKey === "invalid") return json({ error: "bad_idempotency_key" }, 400);

  const now = new Date().toISOString();
  const credit = await creditSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence: TOP_UP_PENCE,
    postedAt: now,
    description: "Extra practice money",
    type: "Payment in",
    category: "Money in",
    reference: "TOPUP",
    idempotencyKey,
  });
  if (!credit.ok) return json({ error: credit.error }, 409);
  return json({ ok: true, duplicate: credit.duplicate, amountPence: TOP_UP_PENCE, balancePence: credit.balancePence });
}

async function route(request: Request, env: Env, pathname: string): Promise<Response> {
  const { method } = request;
  const get = method === "GET";
  const post = method === "POST";

  if (post && pathname === "/accounts") return createAccount(request, env);
  if (post && pathname === "/payments") return takePayment(request, env);
  if (post && pathname === "/patients") return createPatient(request, env);

  const patient = pathname.match(/^\/patients\/([^/]+)(\/prescriptions)?$/);
  if (patient) {
    const username = decodeURIComponent(patient[1]);
    if (get && !patient[2]) return getPatient(env, username);
    if (post && patient[2]) return orderPrescription(request, env, username);
  }

  const account = pathname.match(/^\/accounts\/([^/]+)(\/(transfers|top-up))?$/);
  if (account) {
    const username = decodeURIComponent(account[1]);
    if (post && account[3] === "transfers") return payByBankTransfer(request, env, username);
    if (post && account[3] === "top-up") return addPracticeMoney(request, env, username);
    if (get && !account[2]) {
      const checked = validateUsername(username);
      if ("error" in checked) return json({ error: "account_not_found" }, 404);
      const found = await loadAccount(env.BANK_DB, usernameKey(checked.username));
      return found ? json({ account: found }) : json({ error: "account_not_found" }, 404);
    }
  }

  const mobile = pathname.match(/^\/mobile\/([^/]+)(\/[a-z-]+)?$/);
  if (mobile) {
    const username = decodeURIComponent(mobile[1]);
    const action = mobile[2] ?? "";
    if (get && action === "") return getMobile(env, username);
    if (post && action === "/payments") return payMobileBill(request, env, username);
    if (post && action === "/plan") return changeMobilePlan(request, env, username);
    if (post && action === "/messages") return sendMobileMessage(request, env, username);
  }

  const deliveries = pathname.match(/^\/deliveries\/([^/]+)(\/requests)?$/);
  if (deliveries) {
    const username = decodeURIComponent(deliveries[1]);
    if (get && !deliveries[2]) return getDeliveries(env, username);
    if (post && deliveries[2]) return saveDeliveryRequest(request, env, username);
  }

  if (get && pathname === "/places/search") return searchAddresses(new URL(request.url));
  if (post && pathname === "/jobs/exercises/check") return checkJobsExercise(request, env);
  const jobs = pathname.match(/^\/jobs\/([^/]+)(?:\/(saved|applications)(?:\/(remove))?)?$/);
  if (jobs) {
    const username = decodeURIComponent(jobs[1]);
    const action = jobs[2] ?? "";
    const remove = jobs[3] === "remove";
    if (get && !action) return getJobs(env, username);
    if (post && action === "saved") return saveJob(request, env, username, remove);
    if (post && action === "applications" && !remove) return submitJobApplication(request, env, username);
  }

  const travel = pathname.match(/^\/travel\/([^/]+)(\/bookings(?:\/[^/]+\/cancel)?)?$/);
  if (travel) {
    const username = decodeURIComponent(travel[1]);
    const action = travel[2] ?? "";
    if (get && action === "") return getTravel(env, username);
    if (post && action === "/bookings") return bookTrip(request, env, username);
    const cancel = action.match(/^\/bookings\/([^/]+)\/cancel$/);
    if (post && cancel) return cancelTrip(request, env, username, decodeURIComponent(cancel[1]));
  }

  const council = pathname.match(/^\/council\/([^/]+)(\/[a-z-]+)?$/);
  if (council) {
    const username = decodeURIComponent(council[1]);
    const action = council[2] ?? "";
    if (get && action === "") return getCouncil(env, username);
    if (post && action === "/payments") return payCouncilTax(request, env, username);
    if (post && action === "/requests") return sendCouncilRequest(request, env, username);
  }

  const energy = pathname.match(/^\/energy\/([^/]+)(\/[a-z-/]+)?$/);
  if (energy) {
    const username = decodeURIComponent(energy[1]);
    const action = energy[2] ?? "";
    if (get && action === "") return getEnergy(env, username);
    if (post && action === "/payments") return payEnergyByCard(request, env, username);
    if (post && action === "/direct-debit") return setUpDirectDebit(request, env, username);
    if (post && action === "/direct-debit/cancel") return cancelDirectDebit(env, username);
    if (post && action === "/readings") return submitMeterReading(request, env, username);
    if (post && action === "/messages") return sendEnergyMessage(request, env, username);
  }

  const learner = pathname.match(/^\/learners\/([^/]+)\/exercise(\/[a-z]+)?$/);
  if (learner) {
    const username = decodeURIComponent(learner[1]);
    const action = learner[2] ?? "";
    if (get && action === "") return getCurrentTask(env, username);
    if (post && action === "/next") return nextTask(request, env, username);
    if (post && action === "/answer") return answerTask(request, env, username);
    if (post && action === "/check") return checkTask(request, env, username);
    if (post && action === "/hint") return showHint(env, username);
    if (post && action === "/skip") return skipTask(env, username);
  }

  if (pathname.startsWith("/tutor/")) {
    const refused = tutorAllowed(request, env);
    if (refused) return refused;
    if (get && pathname === "/tutor/learners") return listLearners(env);
    const tutor = pathname.match(/^\/tutor\/learners\/([^/]+)(\/exercise(?:\/stop)?)?$/);
    if (tutor) {
      const username = decodeURIComponent(tutor[1]);
      if (get && !tutor[2]) return learnerSummary(request, env, username);
      if (post && tutor[2] === "/exercise") return tutorStart(request, env, username);
      if (post && tutor[2] === "/exercise/stop") return tutorStop(env, username);
    }
  }

  if (get && pathname === "/") {
    return new Response("Computer Steps practice websites are running.", { headers: corsHeaders });
  }
  return json({ error: "not_found" }, 404);
}

const practiceBankWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const { pathname } = new URL(request.url);
    try {
      return await route(request, env, pathname);
    } catch (error) {
      console.error(JSON.stringify({ message: "Westford Bank request failed", path: pathname, error: String(error) }));
      return json({ error: "server_error" }, 500);
    }
  },

  // Bank, energy, council, jobs and exercise rows share the account.
  // Closing an inactive account removes them together. The Westford Jobs vacancy
  // catalogue is source data, so this cleanup does not delete fictional vacancies.
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const [accounts, patients] = await env.BANK_DB.batch([
      env.BANK_DB.prepare("DELETE FROM accounts WHERE last_used_at < ?").bind(cutoff),
      env.BANK_DB.prepare("DELETE FROM patients WHERE last_used_at < ?").bind(cutoff),
    ]);
    console.log(
      JSON.stringify({ message: "Closed inactive practice accounts", accounts: accounts.meta.changes, patients: patients.meta.changes }),
    );
  },
};

export default practiceBankWorker;
