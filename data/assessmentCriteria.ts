export type AssessmentCriterion = {
  id: string;
  code: string;
  title: string;
  description: string;
  maxScore: number;
  type: "practical" | "observation" | "viva" | "theory";
};

export const fieldTechnicianCriteria: AssessmentCriterion[] = [
  {
    id: "criterion-001",
    code: "PC1",
    title: "Identify tools and equipment",
    description:
      "The worker identifies the tools and equipment required for the assigned task.",
    maxScore: 10,
    type: "practical",
  },
  {
    id: "criterion-002",
    code: "PC2",
    title: "Follow workplace safety procedures",
    description:
      "The worker follows applicable workplace health and safety procedures.",
    maxScore: 10,
    type: "observation",
  },
  {
    id: "criterion-003",
    code: "PC3",
    title: "Perform the assigned task",
    description:
      "The worker completes the practical task according to the required process.",
    maxScore: 20,
    type: "practical",
  },
  {
    id: "criterion-004",
    code: "PC4",
    title: "Troubleshoot common problems",
    description:
      "The worker identifies and resolves common problems related to the task.",
    maxScore: 20,
    type: "practical",
  },
  {
    id: "criterion-005",
    code: "PC5",
    title: "Explain the completed work",
    description:
      "The worker explains the process, result, and precautions taken.",
    maxScore: 10,
    type: "viva",
  },
];