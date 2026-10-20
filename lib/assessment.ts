// File: lib/assessment.ts
// Description: Field-wise practical assessment structure for RPL trades.

export type EvidenceType = "image" | "video" | "document";

export type AssessmentQuestion = {
  id: string;
  code: string;
  type: "practical" | "observation" | "viva";
  question: string;
  guidance: string;
  evidenceType: EvidenceType;
  maxScore: number;
};

export type AssessmentField = {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
};

export const assessmentFields: AssessmentField[] = [
  {
    id: "tools_safety",
    title: "Tools, Equipment & Safety",
    description:
      "Assess whether the worker selects correct tools and follows safe working practices.",
    questions: [
      {
        id: "tools_identification",
        code: "PC1",
        type: "practical",
        question:
          "Can the worker identify and select the correct tools and equipment for the task?",
        guidance:
          "Ask the worker to name the tools and explain their use. Review uploaded photos or videos.",
        evidenceType: "either",
        maxScore: 10,
      },
      {
        id: "safety_practices",
        code: "PC2",
        type: "observation",
        question:
          "Does the worker follow workplace safety procedures during electrical work?",
        guidance:
          "Check use of insulated tools, gloves, safe isolation, testing before touch, and warning signs.",
        evidenceType: "either",
        maxScore: 10,
      },
    ],
  },
  {
    id: "installation_wiring",
    title: "Installation & Wiring",
    description:
      "Assess practical wiring, installation, and termination skills.",
    questions: [
      {
        id: "wiring_installation",
        code: "PC3",
        type: "practical",
        question:
          "Can the worker install or repair domestic electrical wiring correctly?",
        guidance:
          "Review wiring photos/videos. Check routing, fixing, connections, insulation, and neatness.",
        evidenceType: "either",
        maxScore: 20,
      },
      {
        id: "switchboard_installation",
        code: "PC4",
        type: "practical",
        question:
          "Can the worker install or connect a switchboard, MCB, or distribution board?",
        guidance:
          "Check correct termination, labelling, protective devices, and safe arrangement.",
        evidenceType: "either",
        maxScore: 20,
      },
    ],
  },
  {
    id: "maintenance_troubleshooting",
    title: "Maintenance & Troubleshooting",
    description:
      "Assess fault finding, repair, and explanation of completed work.",
    questions: [
      {
        id: "fault_finding",
        code: "PC5",
        type: "practical",
        question:
          "Can the worker identify and resolve common electrical faults?",
        guidance:
          "Ask for a real maintenance example. Review before/after evidence if available.",
        evidenceType: "either",
        maxScore: 20,
      },
      {
        id: "work_explanation",
        code: "PC6",
        type: "viva",
        question:
          "Can the worker explain the completed work, result, and precautions taken?",
        guidance:
          "Conduct a short viva. Ask what was done, why, and which safety steps were followed.",
        evidenceType: "document",
        maxScore: 10,
      },
    ],
  },
];

export const allAssessmentQuestions: AssessmentQuestion[] =
  assessmentFields.flatMap((field) => field.questions);

export function getQuestionById(questionId: string) {
  return allAssessmentQuestions.find((question) => question.id === questionId);
}

export function getMaxTotalScore() {
  return allAssessmentQuestions.reduce(
    (total, question) => total + question.maxScore,
    0
  );
}