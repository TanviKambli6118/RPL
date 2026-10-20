"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Logo from "@/components/logo";
import { electricianRubric, totalRubricScore } from "@/lib/electricianRubric";

type AssessmentResult = {
  workerId: string;
  scores: Record<string, number>;
  totalScore: number;
  percentage: number;
  recommendation: string;
  remarks: string;
  assessedAt: string;
};

export default function AssessorResultPage() {
  const params = useParams();
  const workerId = String(params.workerId);

  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`rpl_assessment_${workerId}`);

    if (!saved) return;

    try {
      setResult(JSON.parse(saved) as AssessmentResult);
    } catch {
      setResult(null);
    }
  }, [workerId]);

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-lg font-bold text-[#0f4c5c]">
            No assessment found
          </h1>

          <Link
            href="/assessor"
            className="mt-4 inline-block rounded-lg bg-[#e8871e] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <Logo />
          <span className="text-xs font-semibold text-slate-500">
            Assessment result
          </span>
        </header>

        <div className="p-4 sm:p-8">
          <h1 className="text-lg font-bold text-[#0f4c5c]">
            Competency profile
          </h1>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Total score: {result.totalScore}/{totalRubricScore}
            </p>
            <p className="text-sm text-slate-500">
              Competency: {result.percentage}%
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0f4c5c]">
              {result.recommendation}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {electricianRubric.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <span className="text-sm text-slate-700">{item.task}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {result.scores[item.id] ?? 0}/{item.maxScore}
                </span>
              </div>
            ))}
          </div>

          {result.remarks && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-semibold text-slate-600">
                Assessor remarks
              </p>
              <p className="mt-1 text-sm text-slate-700">{result.remarks}</p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/assessor"
              className="inline-block rounded-lg bg-[#e8871e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d4790f]"
            >
              Back to assessor dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}