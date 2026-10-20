// lib/assessors.ts

export type Assessor = {
  id: string;
  name: string;
  trade: string;
  authorizedNsqfLevels: number[];
  city: string;
  languages: string[];
  isAvailable: boolean;
  activeCases: number;
  experienceYears: number;
  consistencyScore: number; // 0-100
};

// Seed assessors so the demo works before anyone registers
export const assessors: Assessor[] = [
  {
    id: "assessor-electrical-1",
    name: "Sunil Deshmukh",
    trade: "Electrician",
    authorizedNsqfLevels: [3, 4],
    city: "Mumbai",
    languages: ["Marathi", "Hindi", "English"],
    isAvailable: true,
    activeCases: 1,
    experienceYears: 9,
    consistencyScore: 88,
  },
  {
    id: "assessor-electrical-2",
    name: "Pravin Kadam",
    trade: "Electrician",
    authorizedNsqfLevels: [3, 4],
    city: "Thane",
    languages: ["Marathi", "Hindi"],
    isAvailable: true,
    activeCases: 0,
    experienceYears: 6,
    consistencyScore: 82,
  },
  {
    id: "assessor-electrical-3",
    name: "Rahul Sharma",
    trade: "Electrician",
    authorizedNsqfLevels: [4],
    city: "Mumbai",
    languages: ["Hindi", "English"],
    isAvailable: false,
    activeCases: 3,
    experienceYears: 12,
    consistencyScore: 91,
  },
  {
    id: "assessor-plumbing-1",
    name: "Imran Shaikh",
    trade: "Plumber",
    authorizedNsqfLevels: [3, 4],
    city: "Mumbai",
    languages: ["Hindi", "Marathi", "English"],
    isAvailable: true,
    activeCases: 2,
    experienceYears: 8,
    consistencyScore: 85,
  },
];

// ---------- Registered assessors (localStorage) ----------

export const ASSESSORS_KEY = "sahayak-assessors";

function normalizeAssessor(raw: Record<string, unknown>): Assessor | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  const name = typeof raw.name === "string" ? raw.name : "";
  const trade =
    (typeof raw.trade === "string" && raw.trade) ||
    (typeof raw.jobRole === "string" && raw.jobRole) ||
    "";
  const levelsSrc = raw.authorizedNsqfLevels ?? raw.nsqfLevels;
  const levels = Array.isArray(levelsSrc)
    ? levelsSrc.filter((n): n is number => typeof n === "number")
    : [];

  if (!id || !name || !trade) return null;

  const location = typeof raw.location === "string" ? raw.location : "";
  const city =
    (typeof raw.city === "string" && raw.city) || location.split(",")[0].trim();

  return {
    id,
    name,
    trade,
    authorizedNsqfLevels: levels,
    city,
    languages: Array.isArray(raw.languages) ? (raw.languages as string[]) : [],
    isAvailable: raw.isAvailable !== false && raw.status !== "unavailable",
    activeCases: typeof raw.activeCases === "number" ? raw.activeCases : 0,
    experienceYears:
      typeof raw.experienceYears === "number" ? raw.experienceYears : 0,
    consistencyScore:
      typeof raw.consistencyScore === "number" ? raw.consistencyScore : 70,
  };
}

/** Registered assessors (localStorage) + seed assessors. Client-side only. */
export function getAllAssessors(): Assessor[] {
  if (typeof window === "undefined") return assessors;

  let registered: Assessor[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(ASSESSORS_KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      registered = parsed
        .map((r) => normalizeAssessor(r as Record<string, unknown>))
        .filter((a): a is Assessor => a !== null);
    }
  } catch {
    registered = [];
  }

  const ids = new Set(registered.map((a) => a.id));
  return [...registered, ...assessors.filter((a) => !ids.has(a.id))];
}