import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBolt,
  faBox,
  faBriefcase,
  faBuildingColumns,
  faCartShopping,
  faLandmark,
  faMobileScreen,
  faPlane,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";

export type Scenario = {
  id: string;
  name: string;
  icon: IconDefinition;
  /** One line, shown in the navigation menu. */
  summary: string;
  description: string;
  href: string;
  skills: string[];
  /** Goal-based tasks a tutor can set. They describe what to achieve, not which buttons to press. */
  tutorTasks: string[];
  /** Short label such as New, shown on the scenario card. */
  badge?: string;
};

/**
 * Learner-facing names are "Westford" plus the kind of organisation:
 * Westford Foods, Westford Bank, Westford Energy, and so on.
 * New scenarios use that same pattern. Page addresses can stay as they are.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "practice-shop",
    name: "Westford Foods",
    icon: faCartShopping,
    summary: "Buy groceries online with a pretend bank card",
    description:
      "An online supermarket where nothing costs real money. Search for items, fill a basket, reach free delivery and check out with a pretend bank card.",
    href: "/shop/",
    skills: ["Searching and filtering", "Using a basket", "Filling in forms", "Paying by card safely"],
    tutorTasks: [
      "Buy a loaf of bread, a pint of milk and some tea bags, and have them delivered to your practice address.",
      "Find the cheapest household item in the shop.",
      "Get your basket to free delivery, then remove one item and see what happens to the delivery price.",
      "Find out whether the chocolate biscuits contain milk.",
    ],
  },
  {
    id: "practice-bank",
    name: "Westford Bank",
    icon: faBuildingColumns,
    summary: "Your own pretend bank account and card",
    description:
      "Open a pretend bank account with £5,000 and a bank card. Pay with the card at Westford Foods, send a bank transfer, then check your balance, find the payment and download a statement. Come back any time with your username.",
    href: "/scenarios/practice-bank/",
    skills: ["Opening an account", "Keeping card details safe", "Checking a balance", "Finding transactions", "Viewing and downloading a statement"],
    tutorTasks: [
      "Open a Westford Bank account. Write down your username and card details.",
      "Use your Westford Bank card to buy some groceries at Westford Foods. Then find the payment in Westford Bank.",
      "Check your balance before and after shopping. How much money went out?",
      "How much money went out of your account last month?",
      "Look at the last 6 months of transactions. When did you last take money from a cash machine?",
      "Find out how much your broadband bill is each month.",
      "Open last month's statement and look at the PDF, then download it and find it in your Downloads folder.",
      "You have lost the paper with your card details. Find them again in Westford Bank.",
    ],
  },
  {
    id: "gp-surgery",
    name: "GP Surgery",
    icon: faStethoscope,
    summary: "Find surgery information and contact the practice online",
    description:
      "The website of Yama Clinic, a pretend GP surgery. Find opening hours and contact details, read about appointments, order a prescription and fill in an online consultation form.",
    href: "/scenarios/gp-surgery/",
    skills: [
      "Finding information on a website",
      "Ordering a prescription",
      "Online consultation forms",
      "Finding contact details",
      "Sending an email",
    ],
    tutorTasks: [
      "Find out when the surgery is open on a Saturday.",
      "Find out how to contact the surgery about a problem.",
      "Register for online prescriptions with a username. Write down your username and NHS number.",
      "Look at your last prescription, then order the same medicines again.",
      "Order just one of your repeat medicines.",
      "You are going on holiday next month. Order your repeat medicines and add a message asking for next month's medicine too.",
      "Order the cream the doctor said you could have. It is not on your repeat list.",
      "Come back another day, log in with your username, and find the order you placed in your prescription history.",
      "Complete the online consultation form using one of the practice situations.",
      "You need to change an appointment. Find the surgery's email address, then use your own email account to send them a message.",
      "Find out what to do if you need medical help when the surgery is closed.",
    ],
  },
  {
    id: "westford-energy",
    name: "Westford Energy",
    icon: faBolt,
    summary: "Read an electricity bill, pay it and find help",
    description:
      "The website of a pretend electricity supplier. It uses your Westford Bank username: read your bills, check your energy use, send a meter reading and pay with your Westford Bank account. Practice tasks appear on the screen and check your answers as you go.",
    href: "/scenarios/energy/",
    skills: ["Reading a bill", "Working with money and dates", "Paying a bill online", "Finding help and contact details", "Using two websites together"],
    tutorTasks: [
      "Log in with your Westford Bank username, then choose “Start a practice task”.",
      "Find out how much your latest electricity bill is and when it must be paid by.",
      "Pay your electricity bill online with your Westford Bank card, then check your bank balance.",
      "Find out what help Westford Energy offers if you are struggling to pay.",
    ],
  },
  {
    id: "westford-council",
    name: "Westford Council",
    icon: faLandmark,
    summary: "Check bills, collection dates and local services",
    description:
      "A pretend local council website where learners can view Council Tax, report a problem, check bin collection dates and send a service message using the same Computer Steps account they already use elsewhere.",
    href: "/scenarios/council/",
    skills: ["Finding council information", "Checking dates and due payments", "Completing forms", "Reporting local issues", "Tracking requests"],
    tutorTasks: [
      "Find your Council Tax bill and check the payment due date.",
      "Look up the next bin collection and identify which bin to put out.",
      "Send a message through the contact form and find the reference number in your account.",
      "Report a problem and check the status in My Account.",
    ],
  },
  {
    id: "westford-mobile",
    name: "Westford Mobile",
    icon: faMobileScreen,
    summary: "Check data, read a bill and ask for help",
    description:
      "A pretend mobile phone provider. See your number, data allowance and bill, compare plans, pay with Westford Bank and save a support request.",
    href: "/scenarios/mobile/",
    skills: ["Reading an allowance", "Comparing plans", "Paying a bill", "Sending a support message"],
    tutorTasks: [
      "Find how much mobile data is left.",
      "Find the date the current bill must be paid.",
      "Pay the current bill with Westford Bank and note the reference.",
      "Compare Everyday and Essential and say which has more data.",
      "Report a mobile internet problem and find the reference number.",
    ],
  },
  {
    id: "westford-deliveries",
    name: "Westford Deliveries",
    icon: faBox,
    summary: "Track a parcel and change a delivery",
    description:
      "A pretend courier website. Track a practice code such as WF48271936, read the status and save a delivery instruction.",
    href: "/scenarios/deliveries/",
    skills: ["Entering a tracking code", "Reading a delivery status", "Choosing a delivery option", "Finding a reference"],
    tutorTasks: [
      "Track WF48271936 and find the estimated delivery date.",
      "Track WF55019283 and find out why the delivery was not completed.",
      "Change a delivery date to one of the available days.",
      "Choose a safe place and save the instruction.",
      "Find the Westford Library Counter address and opening hours.",
      "Open My deliveries and find the confirmation reference.",
    ],
  },
  {
    id: "westford-travel",
    name: "Westford Travel",
    icon: faPlane,
    summary: "Compare flights and places to stay, then book",
    description:
      "A pretend travel website for flights, hotels and holiday rentals in the UK. Compare prices, review the total and pay with Westford Bank.",
    href: "/scenarios/travel/",
    skills: ["Searching", "Comparing prices and times", "Reading a booking total", "Paying and finding a reference"],
    tutorTasks: [
      "Find a return flight between two UK cities.",
      "Compare two flights by price and departure time.",
      "Find a hotel or rental for two nights.",
      "Compare a hotel with a holiday rental.",
      "Review a combined booking total before paying.",
      "Pay with Westford Bank, then find the booking reference in My trips.",
    ],
  },
  {
    id: "westford-jobs",
    name: "Westford Jobs",
    icon: faBriefcase,
    summary: "Search for jobs and practise an application",
    description:
      "Practise searching for jobs, comparing vacancies and completing application forms on a simulated UK recruitment website.",
    href: "/scenarios/jobs/",
    badge: "New",
    skills: [
      "Searching and filtering",
      "Reading a job advert",
      "Comparing vacancies",
      "Saving a job",
      "Completing an application",
      "Spotting suspicious adverts",
    ],
    tutorTasks: [
      "Search for a warehouse operative vacancy and open the advert.",
      "Find a part-time retail job in Leeds.",
      "Compare two vacancies by pay, hours and requirements.",
      "Save a job, then find it again in Saved jobs.",
      "Complete a practice application and find the reference in My applications.",
      "Read a practice interview invitation and note the time and place.",
      "Find the warning signs in a suspicious fictional advert.",
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
