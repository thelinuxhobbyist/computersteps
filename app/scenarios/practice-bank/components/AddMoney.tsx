"use client";

import { useState } from "react";
import { request } from "../bank-api";
import { formatMoney } from "../bank-data";

export default function AddMoney({ username, onDone }: { username: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    const result = await request(`/accounts/${encodeURIComponent(username)}/top-up`, {
      method: "POST",
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
    });
    setBusy(false);
    if (result?.status === 200 && typeof result.body.balancePence === "number") {
      setMessage(`£500 has been added. Your balance is now ${formatMoney(result.body.balancePence)}.`);
      onDone();
      return;
    }
    setMessage("We couldn't add the money. Check you are connected to the internet, then try again.");
  };

  return (
    <div className="pb-add-money">
      <button type="button" className="pb-btn pb-btn--secondary" onClick={add} disabled={busy}>
        {busy ? "Adding…" : "Add £500 to your account"}
      </button>
      {message ? (
        <p className="pb-add-money__status" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
