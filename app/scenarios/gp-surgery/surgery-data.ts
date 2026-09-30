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

export const EXTENDED_HOURS: OpeningHoursRow[] = [
  { day: "Tuesday evenings", hours: "6:30pm to 8:00pm" },
  { day: "First Saturday of the month", hours: "8:30am to 12:00pm" },
];

export const GP_NAV = [
  { href: `${GP_BASE}/`, label: "Home" },
  { href: `${GP_BASE}/appointments/`, label: "Appointments" },
  { href: `${GP_BASE}/online-consultation/`, label: "Contact us online" },
  { href: `${GP_BASE}/prescriptions/`, label: "Prescriptions" },
  { href: `${GP_BASE}/our-team/`, label: "Our team" },
  { href: `${GP_BASE}/new-patients/`, label: "New patients" },
  { href: `${GP_BASE}/contact/`, label: "Contact and opening hours" },
] as const;

export type TeamMember = { name: string; role: string; days?: string; helpsWith?: string };

export const TEAM: { heading: string; members: TeamMember[] }[] = [
  {
    heading: "Doctors",
    members: [
      { name: "Dr Sarah Okafor", role: "GP (female)", days: "Mon, Tue, Thu, Fri", helpsWith: "Women's health" },
      { name: "Dr James Whitfield", role: "GP (male)", days: "Mon to Thu", helpsWith: "Diabetes and heart health" },
      { name: "Dr Priya Nair", role: "GP (female)", days: "Tue, Wed, Fri", helpsWith: "Children's health" },
      { name: "Dr Tom Hughes", role: "GP in training (male)", days: "Mon to Fri" },
    ],
  },
  {
    heading: "Nurses",
    members: [
      { name: "Emma Clarke", role: "Nurse", days: "Mon to Fri", helpsWith: "Asthma, vaccinations, smear tests" },
      { name: "Daniel Price", role: "Healthcare Assistant", days: "Mon to Fri", helpsWith: "Blood tests, blood pressure" },
    ],
  },
  {
    heading: "Other staff",
    members: [
      { name: "Linda Marsh", role: "Practice Manager", helpsWith: "Feedback and complaints" },
      { name: "Reception team", role: "Receptionists", helpsWith: "Appointments and questions" },
    ],
  },
];

export const NEWS = [
  {
    date: "Wednesday 14 October",
    title: "Closed in the afternoon",
    body: "We close at 1:00pm for staff training. Need help? Call 111.",
  },
  {
    date: "From 1 October",
    title: "Flu jabs",
    body: "Free flu jabs for people aged 65 and over, and some other people. Ask at reception.",
  },
  {
    date: "September",
    title: "Contact us online",
    body: "You can now use our online form at any time of day.",
  },
];
