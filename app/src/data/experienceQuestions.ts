/**
 * File: src/data/experienceQuestions.ts
 * Author: Tanvi (Team Nirmit)
 * Date: 05-10-2026
 * Description: Fixed self-declaration questions. Same questions for every worker of a trade,
 *              so the answers can be compared fairly and used for NSQF pack mapping.
 */

export type Question = {
  id: string;
  text: string;
  type: "single" | "multi"; // single = pick one, multi = pick many
  options: string[];
};

// asked to every worker, whatever the trade
const commonQuestions: Question[] = [
  {
    id: "years",
    text: "How long have you been working in this field?",
    type: "single",
    options: ["Less than 1 year", "1 - 3 years", "3 - 5 years", "More than 5 years"],
  },
  {
    id: "workType",
    text: "What type of work do you do?",
    type: "single",
    options: ["Daily wage / Contract", "Self-employed", "With a company / Organisation", "Other"],
  },
  {
    id: "supervision",
    text: "How do you usually work?",
    type: "single",
    options: [
      "Under someone's guidance",
      "Alone on small jobs",
      "Alone on big jobs and I guide others",
    ],
  },
];

// extra questions for each trade (only Electrician for now)
const tradeQuestions: Record<string, Question[]> = {
  Electrician: [
    {
      id: "tasks",
      text: "Which of these jobs have you done? (select all that apply)",
      type: "multi",
      options: [
        "Install sockets, switches and wiring",
        "Find and fix faults in wiring",
        "Install or repair fans, lights and fittings",
        "Work with distribution board / MCB",
        "Earthing and safety checks",
        "Read simple electrical drawings",
      ],
    },
  ],
};

export function getQuestions(trade: string): Question[] {
  return [...commonQuestions, ...(tradeQuestions[trade] ?? [])];
}