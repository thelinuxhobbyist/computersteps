import { BANK_NAME, formatCardNumber, maskCardNumber, type BankAccount } from "../bank-data";

type BankCardProps = {
  account: Pick<BankAccount, "nameOnCard" | "cardNumber" | "expiry" | "cvv">;
  revealed: boolean;
};

/** A picture of the front and back of the card. The details are also listed as text beside it. */
export default function BankCard({ account, revealed }: BankCardProps) {
  return (
    <div className="pb-cards" aria-hidden="true">
      <div className="pb-card">
        <div className="pb-card__top">
          <span className="pb-card__bank">{BANK_NAME}</span>
          <span className="pb-card__tag">PRACTICE ONLY</span>
        </div>
        <span className="pb-card__chip" />
        <span className="pb-card__number">{revealed ? formatCardNumber(account.cardNumber) : maskCardNumber(account.cardNumber)}</span>
        <div className="pb-card__bottom">
          <span>
            <small>Name</small>
            {account.nameOnCard}
          </span>
          <span>
            <small>Expires</small>
            {revealed ? account.expiry : "••/••"}
          </span>
        </div>
      </div>

      <div className="pb-card pb-card--back">
        <span className="pb-card__stripe" />
        <div className="pb-card__signature">
          <span>Security code</span>
          <strong>{revealed ? account.cvv : "•••"}</strong>
        </div>
        <span className="pb-card__small">Not a real card. Only works in the Computer Steps Practice Shop.</span>
      </div>
    </div>
  );
}
