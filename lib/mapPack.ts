export type QualificationPack = {
  name: string;
  sector: string;
  qpCode: string;
  nsqfLevel: number | string;
  nqrUrl: string;
  source: "NQR";
  note: string;
};

export type MappingResult = {
  best: QualificationPack;
  alternatives: QualificationPack[];
  matchedTrade: string;
  explanation: string;
};

const qualificationPacks: QualificationPack[] = [
  {
    name: "Electrician – Domestic Solutions",
    sector: "Power",
    qpCode: "PSS/Q6001",
    nsqfLevel: 3,
    nqrUrl: "https://nqr.gov.in/qualifications/2783",
    source: "NQR",
    note: "Verify current version and validity on NQR before production use.",
  },
  {
    name: "Field Technician – Other Home Appliances",
    sector: "Electronics & HW",
    qpCode: "2022/EHW/ESSC/05111",
    nsqfLevel: 4,
    nqrUrl: "https://www.nqr.gov.in/qualifications/2270",
    source: "NQR",
    note: "Qualification page reports NSQF Level 4.",
  },
  {
    name: "Junior Cyber Security Associate",
    sector: "IT-ITeS",
    qpCode: "NIE/ITS/Q0902",
    nsqfLevel: 4,
    nqrUrl:
      "https://nqr.gov.in/qualification/document/Annexure_A%20Model%20curriculum.pdf",
    source: "NQR",
    note: "Check the NQR record for the current qualification version.",
  },
  {
    name: "Frontline Health Caregiving Assistant",
    sector: "Healthcare",
    qpCode: "QG-03-HE-01989-2024-V2-HSSC",
    nsqfLevel: 3,
    nqrUrl: "https://www.nqr.gov.in/qualifications/10281",
    source: "NQR",
    note: "The record includes elective areas; select the appropriate one.",
  },
  {
    name: "Retail Sales Associate",
    sector: "Retail",
    qpCode: "2021/RET/RASCI/04922",
    nsqfLevel: 3,
    nqrUrl: "https://nqr.gov.in/qualifications/2123",
    source: "NQR",
    note: "Verify current version and validity on NQR before production use.",
  },
  {
    name: "Chikankari & Zardosi Artisan",
    sector: "Apparel",
    qpCode: "NQR record 12399",
    nsqfLevel: 3,
    nqrUrl: "https://www.nqr.gov.in/qualifications/12399",
    source: "NQR",
    note: "Use the exact QP/NQR code shown on the qualification record.",
  },
  {
    name: "Assistant Beauty Therapist",
    sector: "Beauty & Wellness",
    qpCode: "NQR record 1890",
    nsqfLevel: 3,
    nqrUrl: "https://nqr.gov.in/qualifications/1890",
    source: "NQR",
    note: "Verify the current version and code on the NQR record.",
  },
];

const tradeAliases: Record<string, string[]> = {
  electrician: ["electrician", "electrical", "wireman"],
  "it-ites": [
    "it-ites",
    "it ites",
    "information technology",
    "cyber security",
    "computer",
    "data entry",
  ],
  healthcare: [
    "healthcare",
    "health care",
    "caregiver",
    "caregiving",
    "health assistant",
  ],
  automotive: [
    "automotive",
    "automobile",
    "vehicle",
    "automotive technician",
  ],
  construction: [
    "construction",
    "mason",
    "carpenter",
    "construction worker",
  ],
  logistics: [
    "logistics",
    "warehouse",
    "inventory",
    "supply chain",
  ],
  retail: [
    "retail",
    "sales associate",
    "retail sales",
    "customer service",
  ],
  apparel: [
    "apparel",
    "garment",
    "tailor",
    "sewing",
    "fashion",
    "embroidery",
    "chikankari",
  ],
  agriculture: [
    "agriculture",
    "agricultural",
    "farmer",
    "farm",
    "field crop",
  ],
  "beauty and wellness": [
    "beauty and wellness",
    "beauty",
    "wellness",
    "beauty therapist",
    "beautician",
    "salon",
  ],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectSector(trade: string): string | null {
  const normalizedTrade = normalize(trade);

  for (const [sector, aliases] of Object.entries(tradeAliases)) {
    const matches = aliases.some((alias) => {
      const normalizedAlias = normalize(alias);

      return (
        normalizedTrade === normalizedAlias ||
        normalizedTrade.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedTrade)
      );
    });

    if (matches) {
      if (sector === "electrician") return "Power";
      if (sector === "it-ites") return "IT-ITeS";
      if (sector === "healthcare") return "Healthcare";
      if (sector === "retail") return "Retail";
      if (sector === "apparel") return "Apparel";
      if (sector === "beauty and wellness") return "Beauty & Wellness";

      // These sectors are recognized, but need a role-specific,
      // verified NQR qualification before returning a level.
      if (
        sector === "automotive" ||
        sector === "construction" ||
        sector === "logistics" ||
        sector === "agriculture"
      ) {
        return sector;
      }
    }
  }

  return null;
}

export function mapPack(
  trade: unknown,
  _answers: Record<string, unknown> = {}
): MappingResult | null {
  if (typeof trade !== "string" || !trade.trim()) {
    return null;
  }

  const sector = detectSector(trade);

  if (!sector) {
    return null;
  }

  const matchingPacks = qualificationPacks.filter(
    (pack) => normalize(pack.sector) === normalize(sector)
  );

  if (matchingPacks.length === 0) {
    return null;
  }

  const best = matchingPacks[0];

  return {
    best,
    alternatives: matchingPacks.slice(1),
    matchedTrade: trade.trim(),
    explanation:
      "This is an NQR-linked qualification suggestion based on the selected trade. Confirm the exact job role and current qualification version before assessor review.",
  };
}