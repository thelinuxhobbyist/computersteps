"use client";

import { useRouter } from "next/navigation";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { COUNCIL_BASE } from "./council-data";

export default function CouncilUserBar() {
  const username = useLearner();
  const router = useRouter();
  if (!username) return null;

  return (
    <div className="council-user">
      <span>
        Signed in as <strong>{username}</strong>
      </span>
      <button
        type="button"
        className="council-user__logout"
        onClick={() => {
          clearLearner();
          router.push(`${COUNCIL_BASE}/`);
        }}
      >
        Sign out
      </button>
    </div>
  );
}
