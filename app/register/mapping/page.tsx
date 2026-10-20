"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";

import Logo from "@/components/logo";
import { mapPack, type MappingResult } from "@/lib/mapPack";

const TRADE_FIELDS = [
  "trade",
  "selectedTrade",
  "primaryTrade",
  "tradeName",
  "jobRole",
  "role",
  "skill",
  "primarySkill",
];

function parseObject(raw: string | null): Record<string, unknown> {
  try {
    const v = JSON.parse(raw ?? "{}");
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function readObject(key: string): Record<string, unknown> {
  return parseObject(localStorage.getItem(key));
}

function pickText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function findTradeIn(obj: Record<string, unknown>, depth = 0): string {
  for (const field of TRADE_FIELDS) {
    const t = pickText(obj[field]);
    if (t) return t;
  }
  if (depth < 1) {
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const t = findTradeIn(v as Record<string, unknown>, depth + 1);
        if (t) return t;
      }
    }
  }
  return "";
}

// Look in the known keys first, then in every other localStorage key
function findTrade(): string {
  const known = ["rpl_worker", "sahayak-worker-profile", "rpl_skills"];
  for (const key of known) {
    const t = findTradeIn(readObject(key));
    if (t) return t;
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === "sahayak-workers" || key === "sahayak-assessors") continue;
    const t = findTradeIn(readObject(key));
    if (t) return t;
  }
  return "";
}

function readWorker(): Record<string, unknown> {
  return {
    ...readObject("rpl_worker"),
    ...readObject("sahayak-worker-profile"),
  };
}

// "Electrician – Domestic Solutions" -> "Electrician"
function tradeLabel(packName: string): string {
  return packName.split(/\s[–-]\s/)[0].trim();
}

export default function MappingPage() {
  const router = useRouter();

  const [result, setResult] = useState<MappingResult | null>(null);
  const [trade, setTrade] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const workerTrade = findTrade();
    const experience = readObject("rpl_experience");

    if (workerTrade) {
      localStorage.setItem(
        "rpl_worker",
        JSON.stringify({ ...readWorker(), trade: workerTrade })
      );
    }

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }

    setKeys(allKeys);
    setTrade(workerTrade);
    setResult(mapPack(workerTrade, experience));
    setLoaded(true);
  }, []);

  const handleContinue = () => {
    const best = result?.best;
    if (!best || !result) return;

    const worker = readWorker();
    const workerId =
      (typeof worker.id === "string" && worker.id) || `worker-${Date.now()}`;

    const level = Number(best.nsqfLevel);
    const canonicalTrade = tradeLabel(best.name);

    const updatedWorker = {
      ...worker,
      id: workerId,
      trade: canonicalTrade,
      suggestedNsqfLevel: level,
      suggestedQualification: best.name,
      suggestedQpCode: best.qpCode,
    };

    localStorage.setItem("rpl_worker", JSON.stringify(updatedWorker));

    try {
      const parsed = JSON.parse(localStorage.getItem("sahayak-workers") ?? "[]");
      const list: Array<{ id?: string }> = Array.isArray(parsed) ? parsed : [];
      localStorage.setItem(
        "sahayak-workers",
        JSON.stringify([...list.filter((w) => w.id !== workerId), updatedWorker])
      );
    } catch {
      localStorage.setItem("sahayak-workers", JSON.stringify([updatedWorker]));
    }

    localStorage.setItem(
      "rpl_mapping",
      JSON.stringify({
        workerId,
        trade: canonicalTrade,
        packName: best.name,
        qpCode: best.qpCode,
        nsqfLevel: level,
        sector: best.sector,
      })
    );

    router.push("/register/allocation");
  };

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading mapping...</p>
      </main>
    );
  }

  const best = result?.best;

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-lg">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <Logo />
          <span className="text-[11px] text-slate-500 sm:text-xs">
            Qualification Mapping
          </span>
        </header>

        <div className="p-4 sm:p-8">
          <Link
            href="/register/documents"
            className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0b2a5b]"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          {!best ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                No qualification pack is available for{" "}
                <b>{trade || "this trade"}</b>.
              </div>

              {!trade && (
                <details className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <summary className="cursor-pointer font-semibold">
                    Debug: no trade found in browser storage
                  </summary>
                  <p className="mt-2">Keys present: {keys.join(", ") || "none"}</p>
                  <p className="mt-1">
                    The Skills &amp; Trade step is not saving the trade. Fix that
                    page to write <code>trade</code> into <code>rpl_worker</code>.
                  </p>
                </details>
              )}

              <Link
                href="/register/skills"
                className="inline-flex rounded-md bg-[#f26b1d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95a10]"
              >
                Change Trade
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-[#0b2a5b]">
                Your Matched Qualification
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                {result?.explanation}
              </p>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-orange-100 text-[#f26b1d]">
                    <Award size={24} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-[#0b2a5b]">
                        {best.name}
                      </h2>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Best Match
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-600">{best.note}</p>

                    <div className="mt-3 space-y-1 text-xs text-gray-700">
                      <p>
                        Sector: <b>{best.sector}</b>
                      </p>
                      <p>
                        NSQF Level:{" "}
                        <b className="text-[#0b2a5b]">{best.nsqfLevel}</b>
                      </p>
                      <p>
                        QP Code: <b className="break-all">{best.qpCode}</b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-md bg-[#f26b1d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d95a10]"
                >
                  Find My Assessor →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}