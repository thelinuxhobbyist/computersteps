import type { StayScene } from "../../../workers/practice-bank/src/shared/travel";

export function WestfordMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#0e4d5c" />
      <circle cx="13" cy="26" r="3.1" fill="#f6f1e8" />
      <circle cx="27" cy="13" r="3.1" fill="#c4492c" />
      <path d="M15.2 24.2C18 20.8 20.4 18.2 24.6 15.2" fill="none" stroke="#f6f1e8" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function WestfordAirLogo({ detail }: { detail?: string }) {
  return (
    <div className="wt-air">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill="#0e4d5c" />
        <path fill="#f6f1e8" d="M6 21.2h12.2L22 13h2.6L22.2 21.2H31l2.2 2.1h-2.1l-1.5 4.4h-2.4l1.4-4.4H20.6L18.4 29h-2.5l2.6-5.7H6.8L5 25.4H3.4L6 21.2z" />
        <path fill="#c4492c" d="M14.2 21.2 19 14.2h2.2l-3.6 7z" />
      </svg>
      <div>
        <strong>Westford Air</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </div>
  );
}

export function StayScene({ scene }: { scene: StayScene }) {
  return (
    <div className="wt-scene">
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#d7e6ec" />
        <circle cx="262" cy="42" r="18" fill="#f3e2c4" />
        <rect y="118" width="320" height="82" fill="#efe4d0" />
        {scene === "harbour" ? <Harbour /> : null}
        {scene === "castle" ? <Castle /> : null}
        {scene === "canal" ? <Canal /> : null}
        {scene === "bridge" ? <Bridge /> : null}
        {scene === "oldtown" ? <OldTown /> : null}
        {scene === "quay" ? <Quay /> : null}
        {scene === "cottage" ? <Cottage /> : null}
        {scene === "bay" ? <Bay /> : null}
      </svg>
    </div>
  );
}

function Harbour() {
  return (
    <>
      <rect y="132" width="320" height="36" fill="#6f9eae" />
      <rect x="78" y="62" width="96" height="88" fill="#0e4d5c" />
      <rect x="92" y="76" width="16" height="14" fill="#f6e7c1" />
      <rect x="118" y="76" width="16" height="14" fill="#f6e7c1" />
      <rect x="144" y="76" width="16" height="14" fill="#f6e7c1" />
      <rect x="92" y="100" width="16" height="14" fill="#f6e7c1" />
      <rect x="118" y="100" width="16" height="14" fill="#f6e7c1" />
      <rect x="144" y="100" width="16" height="14" fill="#f6e7c1" />
      <rect x="112" y="122" width="22" height="28" fill="#c4492c" />
      <path d="M210 146l28 8-28 8v-6h-18v-4h18z" fill="#f7f1e6" />
    </>
  );
}

function Castle() {
  return (
    <>
      <path d="M20 150c40-28 70-36 110-20 36 14 70 8 110-16v54H20z" fill="#e4d3b4" />
      <rect x="118" y="58" width="84" height="78" fill="#0e4d5c" />
      <rect x="104" y="46" width="18" height="90" fill="#083640" />
      <rect x="198" y="46" width="18" height="90" fill="#083640" />
      <rect x="148" y="40" width="16" height="18" fill="#083640" />
      <rect x="150" y="96" width="20" height="40" fill="#c4492c" />
      <rect x="128" y="74" width="12" height="12" fill="#f6e7c1" />
      <rect x="176" y="74" width="12" height="12" fill="#f6e7c1" />
    </>
  );
}

function Canal() {
  return (
    <>
      <rect y="128" width="320" height="28" fill="#6f9eae" />
      <rect x="36" y="78" width="168" height="62" fill="#0e4d5c" />
      <rect x="48" y="90" width="22" height="16" fill="#f6e7c1" />
      <rect x="80" y="90" width="22" height="16" fill="#f6e7c1" />
      <rect x="112" y="90" width="22" height="16" fill="#f6e7c1" />
      <rect x="144" y="90" width="22" height="16" fill="#f6e7c1" />
      <rect x="48" y="114" width="22" height="16" fill="#f6e7c1" />
      <rect x="80" y="114" width="22" height="16" fill="#f6e7c1" />
      <path d="M210 118c28-26 46-26 74 0" fill="none" stroke="#083640" strokeWidth="8" />
      <rect x="214" y="118" width="8" height="22" fill="#083640" />
      <rect x="272" y="118" width="8" height="22" fill="#083640" />
    </>
  );
}

function Bridge() {
  return (
    <>
      <rect y="136" width="320" height="24" fill="#6f9eae" />
      <path d="M48 136c28-48 64-48 96 0" fill="#efe4d0" stroke="#0e4d5c" strokeWidth="8" />
      <rect x="168" y="70" width="78" height="78" fill="#0e4d5c" />
      <rect x="182" y="84" width="16" height="14" fill="#f6e7c1" />
      <rect x="208" y="84" width="16" height="14" fill="#f6e7c1" />
      <rect x="182" y="108" width="16" height="14" fill="#f6e7c1" />
      <rect x="208" y="108" width="16" height="14" fill="#f6e7c1" />
      <rect x="196" y="124" width="18" height="24" fill="#c4492c" />
    </>
  );
}

function OldTown() {
  return (
    <>
      <rect x="48" y="72" width="52" height="78" fill="#0e4d5c" />
      <rect x="108" y="58" width="58" height="92" fill="#083640" />
      <rect x="174" y="80" width="64" height="70" fill="#0e4d5c" />
      <path d="M48 72l26-22 26 22" fill="#c4492c" />
      <path d="M108 58l29-24 29 24" fill="#a33b24" />
      <path d="M174 80l32-20 32 20" fill="#c4492c" />
      <rect x="66" y="90" width="14" height="16" fill="#f6e7c1" />
      <rect x="126" y="78" width="14" height="16" fill="#f6e7c1" />
      <rect x="148" y="78" width="14" height="16" fill="#f6e7c1" />
      <rect x="196" y="98" width="14" height="16" fill="#f6e7c1" />
      <rect x="124" y="118" width="16" height="32" fill="#f7f1e6" />
    </>
  );
}

function Quay() {
  return (
    <>
      <rect y="140" width="320" height="22" fill="#6f9eae" />
      <rect x="70" y="48" width="70" height="102" fill="#0e4d5c" />
      <rect x="148" y="72" width="92" height="78" fill="#245e6c" />
      {[0, 1, 2, 3].map((column) =>
        [0, 1, 2, 3].map((row) => (
          <rect key={`${column}-${row}`} x={82 + column * 14} y={60 + row * 18} width="8" height="10" fill="#d7e6ec" />
        )),
      )}
      <rect x="164" y="86" width="18" height="12" fill="#f6e7c1" />
      <rect x="190" y="86" width="18" height="12" fill="#f6e7c1" />
      <rect x="164" y="108" width="18" height="12" fill="#f6e7c1" />
      <rect x="190" y="108" width="18" height="12" fill="#f6e7c1" />
    </>
  );
}

function Cottage() {
  return (
    <>
      <path d="M70 118 L150 62 L230 118 Z" fill="#c4492c" />
      <rect x="92" y="118" width="116" height="52" fill="#f7f1e6" stroke="#0e4d5c" strokeWidth="4" />
      <rect x="136" y="136" width="24" height="34" fill="#0e4d5c" />
      <rect x="108" y="132" width="18" height="16" fill="#d7e6ec" />
      <rect x="176" y="132" width="18" height="16" fill="#d7e6ec" />
      <circle cx="250" cy="146" r="16" fill="#7ea18a" />
      <rect x="246" y="146" width="8" height="24" fill="#083640" />
    </>
  );
}

function Bay() {
  return (
    <>
      <path d="M0 150c40 16 80 18 140 8 50-8 90-6 180 10v32H0z" fill="#6f9eae" />
      <rect x="78" y="78" width="120" height="64" fill="#f7f1e6" stroke="#0e4d5c" strokeWidth="4" />
      <path d="M70 82 L138 46 L206 82 Z" fill="#0e4d5c" />
      <rect x="124" y="108" width="22" height="34" fill="#c4492c" />
      <rect x="96" y="96" width="18" height="14" fill="#d7e6ec" />
      <rect x="162" y="96" width="18" height="14" fill="#d7e6ec" />
      <rect x="214" y="118" width="28" height="16" fill="#083640" />
    </>
  );
}
