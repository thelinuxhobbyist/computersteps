export const GP_BASE = "/scenarios/gp-surgery";

// Phone numbers use Ofcom's reserved drama ranges, so they can never reach a real person.
export const SURGERY = {
  name: "Yama Clinic",
  addressLines: ["24 Yama Lane", "Millbrook", "MB4 7RD"],
  phone: "01632 960 482",
  email: "reception@yamaclinic.practice",
  practiceManager: "Linda Marsh",
} as const;

export type OpeningHoursRow = { day: string; hours: string };

export const OPENING_HOURS: OpeningHoursRow[] = [
  { day: "Monday", hours: "8:00am to 6:30pm" },
  { day: "Tuesday", hours: "8:00am to 6:30pm" },
  { day: "Wednesday", hours: "8:00am to 6:30pm" },
  { day: "Thursday", hours: "8:00am to 6:30pm" },
  { day: "Friday", hours: "8:00am to 6:30pm" },
  { day: "Saturday", hours: "Closed" },
  { day: "Sunday", hours: "Closed" },
];

export const EXTENDED_HOURS =
  "Pre-booked evening appointments are available on Tuesdays from 6:30pm to 8:00pm, and on the first Saturday of each month from 8:30am to 12:00pm.";

export const GP_NAV = [
  { href: `${GP_BASE}/`, label: "Home" },
  { href: `${GP_BASE}/appointments/`, label: "Appointments" },
  { href: `${GP_BASE}/online-consultation/`, label: "Contact us online" },
  { href: `${GP_BASE}/prescriptions/`, label: "Prescriptions" },
  { href: `${GP_BASE}/our-team/`, label: "Our team" },
  { href: `${GP_BASE}/new-patients/`, label: "New patients" },
  { href: `${GP_BASE}/contact/`, label: "Contact and opening hours" },
] as const;

export type TeamMember = { name: string; role: string; details: string };

export const TEAM: { heading: string; members: TeamMember[] }[] = [
  {
    heading: "Doctors",
    members: [
      { name: "Dr Sarah Okafor", role: "Senior Partner (female)", details: "Works Monday, Tuesday, Thursday and Friday. Special interest in women's health." },
      { name: "Dr James Whitfield", role: "Partner (male)", details: "Works Monday to Thursday. Special interest in diabetes and heart health." },
      { name: "Dr Priya Nair", role: "Salaried GP (female)", details: "Works Tuesday, Wednesday and Friday. Special interest in children's health." },
      { name: "Dr Tom Hughes", role: "GP Registrar (male)", details: "A qualified doctor completing his training as a GP. Works Monday to Friday." },
    ],
  },
  {
    heading: "Nursing team",
    members: [
      { name: "Emma Clarke", role: "Practice Nurse", details: "Asthma reviews, vaccinations, travel health and cervical screening." },
      { name: "Daniel Price", role: "Healthcare Assistant", details: "Blood tests, blood pressure checks and NHS Health Checks." },
    ],
  },
  {
    heading: "Practice staff",
    members: [
      { name: "Linda Marsh", role: "Practice Manager", details: "Responsible for the running of the surgery, including feedback and complaints." },
      { name: "Reception and admin team", role: "Care Navigators", details: "Our receptionists are trained to help you get the right care from the right person." },
    ],
  },
];

export const NEWS = [
  {
    date: "Wednesday 14 October",
    title: "Surgery closed for staff training",
    body: "The surgery will close at 1:00pm for staff training and reopen at 8:00am the next day. If you need medical help while we are closed, call 111.",
  },
  {
    date: "From 1 October",
    title: "Flu vaccinations now available",
    body: "Free flu vaccinations are available for patients aged 65 and over, pregnant women and people with some long-term health conditions. Contact reception to book.",
  },
  {
    date: "September",
    title: "Contact us online",
    body: "You can now send us a request using our online consultation form at any time. Requests are read by our practice team during opening hours.",
  },
];
