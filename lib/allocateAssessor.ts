// lib/allocateAssessor.ts
import { assessors as seedAssessors, type Assessor } from "@/lib/assessors";

export type WorkerForAllocation = {
  id?: string;
  name?: string;
  trade?: string;
  city?: string;
  language?: string;
  suggestedNsqfLevel?: number;
};

export type AllocationReason = {
  label: string;
  points: number;
};

export type RankedAssessor = {
  assessor: Assessor;
  totalScore: number;
  reasons: AllocationReason[];
};

export type AllocationResult = {
  assessor: Assessor | null; // best match
  totalScore: number;
  reasons: AllocationReason[];
  eligibleAssessors: Assessor[];
  ranked: RankedAssessor[]; // all matches, best first
};

const norm = (s: string) => s.trim().toLowerCase();

const EMPTY: AllocationResult = {
  assessor: null,
  totalScore: 0,
  reasons: [],
  eligibleAssessors: [],
  ranked: [],
};

export function allocateAssessor(
  worker: WorkerForAllocation,
  pool: Assessor[] = seedAssessors
): AllocationResult {
  // No silent defaults: without trade and level there is no valid match.
  if (!worker.trade || !worker.suggestedNsqfLevel) return EMPTY;

  const trade = norm(worker.trade);
  const level = worker.suggestedNsqfLevel;

  // Hard eligibility filter
  const eligible = pool.filter(
    (a) =>
      norm(a.trade) === trade &&
      a.isAvailable &&
      a.authorizedNsqfLevels.includes(level) &&
      a.activeCases < 5
  );

  if (eligible.length === 0) return EMPTY;

  const ranked: RankedAssessor[] = eligible
    .map((a) => {
      const reasons: AllocationReason[] = [
        { label: `Same trade: ${a.trade}`, points: 40 },
        { label: `Authorized for NSQF Level ${level}`, points: 20 },
      ];

      if (worker.city && norm(a.city) === norm(worker.city)) {
        reasons.push({ label: `Same city: ${a.city}`, points: 15 });
      } else {
        reasons.push({
          label: `Different city: ${a.city || "n/a"}`,
          points: 5,
        });
      }

      if (worker.language && a.languages.includes(worker.language)) {
        reasons.push({ label: `Speaks ${worker.language}`, points: 10 });
      }

      reasons.push({
        label: `Workload: ${a.activeCases} active cases`,
        points: Math.max(0, 10 - a.activeCases * 2),
      });

      reasons.push({
        label: `Consistency: ${a.consistencyScore}/100`,
        points: Math.round(a.consistencyScore / 20),
      });

      const totalScore = reasons.reduce((sum, r) => sum + r.points, 0);
      return { assessor: a, totalScore, reasons };
    })
    .sort((x, y) => y.totalScore - x.totalScore);

  return {
    assessor: ranked[0].assessor,
    totalScore: ranked[0].totalScore,
    reasons: ranked[0].reasons,
    eligibleAssessors: eligible,
    ranked,
  };
}