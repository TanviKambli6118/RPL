export type Pack = {
  id: string;
  trade: string;
  name: string;
  code: string;
  nsqfLevel: number;
  minScore: number;
  description: string;
  officialSourceUrl: string;
  sourceLabel: string;
};

export const packs: Pack[] = [
  {
    id: "assistant-electrician-domestic-industrial",
    trade: "Electrical",
    name: "Assistant Electrician (Domestic cum Industrial)",
    code: "QG-03-PW-02422-2024-V1-MSME",
    nsqfLevel: 3,
    minScore: 0,
    description:
      "Entry-level electrical installation and maintenance support in domestic and industrial settings.",
    officialSourceUrl:
      "https://www.nqr.gov.in/qualification/file/Assistant%20Electrician%20(Domestic%20cum%20Industrial)_%20QF.pdf",
    sourceLabel:
      "NQR public qualification reference — Assistant Electrician (Domestic cum Industrial), NSQF Level 3",
  },
  {
    id: "electrician-domestic-solutions",
    trade: "Electrical",
    name: "Electrician - Domestic Solutions",
    code: "PSS/Q6001",
    nsqfLevel: 3,
    minScore: 3,
    description:
      "Domestic wiring maintenance, electrical repair, troubleshooting and fault repair.",
    officialSourceUrl:
      "https://nqr.gov.in/sites/default/files/Q-File-Electrician%20-%20Domestic%20Solutions_0.pdf",
    sourceLabel:
      "NQR public qualification reference — Electrician - Domestic Solutions, NSQF Level 3",
  },
  {
    id: "electrician-level-4",
    trade: "Electrical",
    name: "Electrician",
    code: "DGT/1001",
    nsqfLevel: 4,
    minScore: 7,
    description:
      "Electrical installation, testing, measurement, error verification and fault diagnosis.",
    officialSourceUrl:
      "https://www.nqr.gov.in/sites/default/files/QF_Electrician_CTS2.0_NSQF-4.pdf",
    sourceLabel:
      "NQR public qualification reference — Electrician, DGT/1001, NSQF Level 4",
  },
];