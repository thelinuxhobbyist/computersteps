import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";

export default function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <span className={`star-rating star-rating--${size}`} role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((position) => {
        const full = rating >= position;
        const half = !full && rating >= position - 0.5;
        return (
          <FontAwesomeIcon
            key={position}
            icon={half ? faStarHalfStroke : faStar}
            className={full || half ? "is-on" : "is-off"}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
}
