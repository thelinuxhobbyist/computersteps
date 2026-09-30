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
    id: "gp-surgery",
    name: "GP Surgery",
    icon: "🩺",
    summary: "Find surgery information and contact the practice online",
    description:
      "The website of Yama Clinic, a pretend GP surgery. Find opening hours and contact details, read about appointments and fill in an online consultation form.",
    href: "/scenarios/gp-surgery/",
    skills: ["Finding information on a website", "Online consultation forms", "Finding contact details", "Sending an email"],
    tutorTasks: [
      "Find out when the surgery is open on a Saturday.",
      "Find out how to contact the surgery about a problem.",
      "Complete the online consultation form using one of the practice situations.",
      "You need to change an appointment. Find the surgery's email address, then use your own email account to send them a message.",
      "Find out what to do if you need medical help when the surgery is closed.",
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
