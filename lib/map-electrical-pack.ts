// lib/map-electrical-pack.ts
// Offline keyword fallback mapper for worker free-text self-declarations.

import { packs, type Pack } from "@/data/electrical-packs";

export type ElectricalMappingResult = {
  pack: Pack;
  confidence: number;
  reason: string;
  matchedKeywords: string[];
  mappingMethod: "offline-keywords";
};

const KEYWORDS: Record<string, string[]> = {
  "assistant-electrician-domestic-industrial": [
    "helper",
    "assist",
    "assisting",
    "carry tools",
    "cable routing",
    "switch fitting",
    "light fitting",
    "basic fitting",
    "basic electrical",
    "electrician helper",
  ],

  "electrician-domestic-solutions": [
    "house wiring",
    "home wiring",
    "domestic wiring",
    "fan",
    "light",
    "socket",
    "switch",
    "appliance",
    "household",
    "electrical repair",
    "fault repair",
    "maintenance",
    "troubleshooting",
    "repair",
  ],

  "electrician-level-4": [
    "mcb",
    "distribution board",
    "db board",
    "earthing",
    "earth continuity",
    "testing",
    "multimeter",
    "megger",
    "insulation test",
    "fault finding",
    "fault diagnosis",
    "install",
    "installation",
    "commissioning",
    "calibration",
    "electrical panel",
    "three phase",
  ],
};

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapElectricalPackOffline(
  declaration: string
): ElectricalMappingResult {
  const text = normalise(declaration);

  const electricalPacks = packs.filter(
    (pack) => pack.trade.trim().toLowerCase() === "electrician"
  );

  const availablePacks = electricalPacks.length > 0 ? electricalPacks : packs;

  const ranked = availablePacks
    .map((pack) => {
      const keywords = KEYWORDS[pack.id] ?? [];

      const matchedKeywords = keywords.filter((keyword) =>
        text.includes(normalise(keyword))
      );

      return {
        pack,
        matchedKeywords,
        score: matchedKeywords.length,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score === 0) {
    return {
      pack: availablePacks[0],
      confidence: 0.35,
      reason:
        "The declaration contains limited trade details. Assistant Electrician is suggested for assessor confirmation.",
      matchedKeywords: [],
      mappingMethod: "offline-keywords",
    };
  }

  const confidence = Math.min(0.92, 0.45 + best.score * 0.1);

  return {
    pack: best.pack,
    confidence,
    reason: `Matched from work-experience keywords: ${best.matchedKeywords.join(
      ", "
    )}. Final qualification decision requires practical assessment and assessor confirmation.`,
    matchedKeywords: best.matchedKeywords,
    mappingMethod: "offline-keywords",
  };
}