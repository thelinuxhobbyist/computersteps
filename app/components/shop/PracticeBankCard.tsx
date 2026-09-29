import { PRACTICE_CARD } from "../../shop/shop-data";

export default function PracticeBankCard() {
  return (
    <figure className="practice-card-wrap">
      <div className="practice-card" role="img" aria-label={`Practice Bank Card from ${PRACTICE_CARD.bankName}. Name ${PRACTICE_CARD.cardholderName}, card number ${PRACTICE_CARD.cardNumber}, expires ${PRACTICE_CARD.expiry}, security code ${PRACTICE_CARD.cvv}.`}>
        <div className="practice-card__top">
          <span className="practice-card__bank">{PRACTICE_CARD.bankName}</span>
          <span className="practice-card__badge">PRACTICE</span>
        </div>
        <div className="practice-card__chip" aria-hidden="true" />
        <p className="practice-card__number">{PRACTICE_CARD.cardNumber}</p>
        <div className="practice-card__bottom">
          <div>
            <span className="practice-card__label">Card holder</span>
            <span className="practice-card__value">{PRACTICE_CARD.cardholderName}</span>
          </div>
          <div>
            <span className="practice-card__label">Expires</span>
            <span className="practice-card__value">{PRACTICE_CARD.expiry}</span>
          </div>
          <div>
            <span className="practice-card__label">CVV</span>
            <span className="practice-card__value">{PRACTICE_CARD.cvv}</span>
          </div>
        </div>
      </div>
      <figcaption className="practice-card__caption">
        <strong>Practice card — not real.</strong> Copy these details into the form. On a real card, the 3-digit security
        code (CVV) is printed on the back.
        <span className="practice-card__extra">
          Sort code {PRACTICE_CARD.sortCode} · Account number {PRACTICE_CARD.accountNumber} (you do not need these to pay
          by card)
        </span>
      </figcaption>
    </figure>
  );
}
