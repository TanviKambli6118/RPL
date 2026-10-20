export type RubricItem = {
  id: string;
  task: string;
  criterion: string;
  maxScore: number;
  guidance: string;
};

export const electricianRubric: RubricItem[] = [
  {
    id: "safety",
    task: "Site safety check",
    criterion: "Identifies hazards and uses appropriate PPE",
    maxScore: 10,
    guidance:
      "Full marks: identifies electrical shock, short-circuit and fall risks; uses insulated gloves, safety shoes and checks power isolation.",
  },
  {
    id: "wiring",
    task: "Single-phase wiring task",
    criterion: "Correctly connects switch, socket and load",
    maxScore: 25,
    guidance:
      "Full marks: correct wire selection, secure connections, correct polarity, proper earthing and functional testing.",
  },
  {
    id: "testing",
    task: "Testing and fault finding",
    criterion: "Uses tester/multimeter safely and identifies faults",
    maxScore: 25,
    guidance:
      "Full marks: safely tests supply, identifies open circuit, short circuit or earth fault, and explains the correction.",
  },
  {
    id: "installation",
    task: "Switchboard installation",
    criterion: "Installs MCB, earthing and distribution neatly",
    maxScore: 20,
    guidance:
      "Full marks: correct MCB rating, proper neutral/earth separation, tidy routing and safe termination.",
  },
  {
    id: "documentation",
    task: "Work explanation",
    criterion: "Explains work done and safety precautions",
    maxScore: 20,
    guidance:
      "Full marks: clearly explains procedure, tools, materials, risks and preventive measures.",
  },
];

export const totalRubricScore = electricianRubric.reduce(
  (total, item) => total + item.maxScore,
  0
);