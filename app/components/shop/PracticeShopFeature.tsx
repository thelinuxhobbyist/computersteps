import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function PracticeShopFeature() {
  return (
    <div className="shop-feature">
      <div className="shop-feature__icon" aria-hidden="true">
        🛒
      </div>
      <div className="shop-feature__text">
        <p className="eyebrow">New exercise</p>
        <h2>Practice Shop</h2>
        <p>
          Try shopping online without spending a penny. Search for items, fill a basket, reach free delivery and pay with a
          pretend bank card.
        </p>
      </div>
      <Link href="/shop/" className="btn btn-primary">
        Open the Practice Shop <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Link>
    </div>
  );
}
