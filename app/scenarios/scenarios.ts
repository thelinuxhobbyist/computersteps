export type Scenario = {
  id: string;
  name: string;
  icon: string;
  /** One line, shown in the navigation menu. */
  summary: string;
  description: string;
  href: string;
  skills: string[];
  /** Goal-based tasks a tutor can set. They describe what to achieve, not which buttons to press. */
  tutorTasks: string[];
};

export const SCENARIOS: Scenario[] = [
  {
    id: "practice-shop",
    name: "Practice Shop",
    icon: "🛒",
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
    name: "Practice Bank",
    icon: "🏦",
    summary: "Your own pretend bank account and card",
    description:
      "Open a pretend bank account with £500 and a bank card. Pay with the card in the Practice Shop, then check your balance, find the payment and download a statement. Come back any time with your username.",
    href: "/scenarios/practice-bank/",
    skills: ["Opening an account", "Keeping card details safe", "Checking a balance", "Finding transactions", "Downloading a statement"],
    tutorTasks: [
      "Open a Practice Bank account. Write down your username and card details.",
      "Use your Practice Bank card to buy some groceries in the Practice Shop. Then find the payment in Practice Bank.",
      "Check your balance before and after shopping. How much money went out?",
      "How much money went out of your account last month?",
      "Look at the last 6 months of transactions. When did you last take money from a cash machine?",
      "Find out how much your broadband bill is each month.",
      "Download last month's statement, then find it in your Downloads folder.",
      "You have lost the paper with your card details. Find them again in Practice Bank.",
    ],
  },
  {
    id: "gp-surgery",
    name: "GP Surgery",
    icon: "🩺",
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
    icon: "⚡",
    summary: "Read an electricity bill, pay it and find help",
    description:
      "The website of a pretend electricity supplier. It uses your Practice Bank username: read your bills, check your energy use, send a meter reading and pay with your Practice Bank account. Practice tasks appear on the screen and check your answers as you go.",
    href: "/scenarios/energy/",
    skills: ["Reading a bill", "Working with money and dates", "Paying a bill online", "Finding help and contact details", "Using two websites together"],
    tutorTasks: [
      "Log in with your Practice Bank username, then choose “Start a practice task”.",
      "Find out how much your latest electricity bill is and when it must be paid by.",
      "Pay your electricity bill online with your Practice Bank card, then check your bank balance.",
      "Find out what help Westford Energy offers if you are struggling to pay.",
    ],
  },
  {
    id: "westford-council",
    name: "Westford Council",
    icon: "🏛️",
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
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
