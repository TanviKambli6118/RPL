"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAllAssessors } from "@/lib/assessors";
import {
  allocateAssessor,
  type RankedAssessor,
} from "@/lib/allocateAssessor";
import {
  getAssignmentForWorker,
  saveAssignment,
  type Assignment,
} from "@/lib/assignments";

type WorkerProfile = {
  id: string;
  name: string;
  location: string;
  trade: string;
  suggestedNsqfLevel: number;
  suggestedQualification: string;
};

function loadWorker(): WorkerProfile | null {
  try {
    const w = JSON.parse(localStorage.getItem("rpl_worker") ?? "{}");
    if (
      typeof w.id !== "string" ||
      typeof w.trade !== "string" ||
      typeof w.suggestedNsqfLevel !== "number"
    ) {
      return null; // mapping not completed
    }
    return {
      id: w.id,
      name: typeof w.name === "string" ? w.name : "Worker",
      location: typeof w.location === "string" ? w.location : "",
      trade: w.trade,
      suggestedNsqfLevel: w.suggestedNsqfLevel,
      suggestedQualification:
        typeof w.suggestedQualification === "string"
          ? w.suggestedQualification
          : "",
    };
  } catch {
    return null;
  }
}

export default function AllocationPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [ranked, setRanked] = useState<RankedAssessor[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assignment, setAssignment] = useState<Assignment | undefined>();

  useEffect(() => {
    const w = loadWorker();
    setWorker(w);

    if (w) {
      const result = allocateAssessor(
        {
          id: w.id,
          trade: w.trade,
          suggestedNsqfLevel: w.suggestedNsqfLevel,
          city: w.location.split(",")[0].trim(),
        },
        getAllAssessors()
      );
      setRanked(result.ranked);
      setSelectedId(result.assessor?.id ?? "");
      setAssignment(getAssignmentForWorker(w.id));
    }

    setLoaded(true);
  }, []);

  function confirm() {
    const chosen = ranked.find((r) => r.assessor.id === selectedId);
    if (!worker || !chosen) return;

    const a: Assignment = {
      assignmentId: `assignment-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerLocation: worker.location,
      trade: worker.trade,
      suggestedNsqfLevel: worker.suggestedNsqfLevel,
      assessorId: chosen.assessor.id,
      assessorName: chosen.assessor.name,
      status: "assigned",
      assignedAt: new Date().toISOString(),
    };

    saveAssignment(a);
    setAssignment(a);
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-sm text-gray-500">Loading allocation details...</p>
      </main>
    );
  }

  if (!worker) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-700">
            No qualification mapping found. Complete the mapping step first.
          </p>
          <Link
            href="/register/mapping"
            className="mt-4 inline-flex rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to mapping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-semibold text-[#f26b1d]">
            Worker assessment journey
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#0b2a5b]">
            Assessor allocation
          </h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-[#0b2a5b]">{worker.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Info label="Trade" value={worker.trade} />
            <Info
              label="Recommended level"
              value={`NSQF Level ${worker.suggestedNsqfLevel}`}
            />
            <Info label="Location" value={worker.location || "Not provided"} />
          </div>
          {worker.suggestedQualification && (
            <p className="mt-3 text-xs text-gray-500">
              Matched qualification: {worker.suggestedQualification}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-[#0b2a5b]">
            Matching assessors
          </h2>

          {ranked.length === 0 ? (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
              No matching assessor available for {worker.trade} at NSQF Level{" "}
              {worker.suggestedNsqfLevel}.
              <div className="mt-3">
                <Link
                  href="/register?role=assessor"
                  className="inline-flex rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white"
                >
                  Register assessor
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {ranked.map((r, i) => {
                const a = r.assessor;
                const selected = a.id === selectedId;
                return (
                  <label
                    key={a.id}
                    className={`block cursor-pointer rounded-xl border p-4 ${
                      selected
                        ? "border-[#f26b1d] bg-orange-50"
                        : "border-gray-200 bg-white"
                    } ${assignment ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="assessor"
                        className="mt-1"
                        checked={selected}
                        onChange={() => setSelectedId(a.id)}
                        disabled={Boolean(assignment)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#0b2a5b]">
                            {a.name}
                          </span>
                          {i === 0 && (
                            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                              Best match
                            </span>
                          )}
                          <span className="ml-auto text-xs text-gray-500">
                            Score {r.totalScore}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          {a.trade} · {a.city || "City n/a"} · Levels{" "}
                          {a.authorizedNsqfLevels.join(", ")}
                        </p>
                        <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
                          {r.reasons.map((reason) => (
                            <li key={reason.label}>
                              +{reason.points} {reason.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {ranked.length > 0 && !assignment && (
            <button
              type="button"
              onClick={confirm}
              disabled={!selectedId}
              className="mt-5 w-full rounded-lg bg-[#f26b1d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d95a10] disabled:bg-gray-300"
            >
              Confirm assessor allocation
            </button>
          )}

          {assignment && (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">
                Assigned to {assignment.assessorName}.
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-lg bg-[#0b2a5b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#123c7a]"
              >
                Go to worker dashboard
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#0b2a5b]">
        {value}
      </p>
    </div>
  );
}