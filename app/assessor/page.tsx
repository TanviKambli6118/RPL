"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileImage, FileText, PlayCircle } from "lucide-react";
import Logo from "@/components/logo";

type Session = {
  role?: "worker" | "assessor";
  userId?: string;
  name?: string;
};

type AssessorProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  sector?: string;
  experienceYears?: number;
  certificationNumber?: string;
  nsqfLevels?: number[];
};

type WorkerProfile = {
  id?: string;
  name?: string;
  trade?: string;
  location?: string;
  phone?: string;
  email?: string;
};

type Assignment = {
  workerId?: string;
  workerName?: string;
  assessorId?: string;
  assessorName?: string;
  recommendedNsqfLevel?: number;
  status?: string;
};

type EvidenceItem = {
  id: string;
  workerId: string;
  fieldId: string;
  questionId: string;
  question: string;
  description: string;
  fileType: "image" | "video" | "document";
  fileName: string;
  fileUrl?: string;
};

type AssessmentResult = {
  finalOutcome?: string;
  finalNsqfLevel?: number;
  totalAwardedScore?: number;
  maxTotalScore?: number;
  status?: string;
};

const staticEvidence: EvidenceItem[] = [
  {
    id: "static-1",
    workerId: "demo",
    fieldId: "wiring",
    questionId: "q1",
    question: "Show how you install a switch board with proper wiring.",
    description: "Photo of a completed switch board with colour-coded wires.",
    fileType: "image",
    fileName: "switch-board-installation.jpg",
  },
  {
    id: "static-2",
    workerId: "demo",
    fieldId: "safety",
    questionId: "q2",
    question: "Demonstrate the safety steps before starting electrical work.",
    description:
      "Video showing power isolation, tester check and use of insulated gloves.",
    fileType: "video",
    fileName: "safety-precautions.mp4",
  },
  {
    id: "static-3",
    workerId: "demo",
    fieldId: "earthing",
    questionId: "q3",
    question: "Show the earthing connection of a distribution board.",
    description: "Photo of the earthing wire connected to the DB earth bar.",
    fileType: "image",
    fileName: "db-earthing.jpg",
  },
  {
    id: "static-4",
    workerId: "demo",
    fieldId: "testing",
    questionId: "q4",
    question: "Test a circuit using a multimeter.",
    description:
      "Video of continuity and voltage testing on a lighting circuit.",
    fileType: "video",
    fileName: "multimeter-testing.mp4",
  },
  {
    id: "static-5",
    workerId: "demo",
    fieldId: "documents",
    questionId: "q5",
    question: "Upload a past work certificate or job card.",
    description: "Job card from a residential wiring project, Mumbai.",
    fileType: "document",
    fileName: "job-card-residential-wiring.pdf",
  },
];

export default function AssessorDashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [assessor, setAssessor] = useState<AssessorProfile | null>(null);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const displayEvidence = evidence.length > 0 ? evidence : staticEvidence;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = readObject("sahayak-session") as Session;
    const assessorProfile = readObject(
      "sahayak-assessor-profile"
    ) as AssessorProfile;

    setAssessor(assessorProfile);

    const workerProfile = {
      ...readObject("rpl_worker"),
      ...readObject("sahayak-worker-profile"),
    } as WorkerProfile;

    const storedAssignment = readObject(
      "sahayak-assignment"
    ) as Assignment;

    const workerId = workerProfile.id || storedAssignment.workerId || "";

    if (workerId) {
      setWorker(workerProfile);

      const rawEvidence = window.localStorage.getItem(
        `rpl_evidence_${workerId}`
      );

      setEvidence(rawEvidence ? JSON.parse(rawEvidence) : []);

      const rawAnswers = window.localStorage.getItem(
        `rpl_assessment_answers_${workerId}`
      );

      setAnswers(rawAnswers ? JSON.parse(rawAnswers) : {});

      const assessment = readObject(
        `sahayak-assessment-${workerId}`
      ) as AssessmentResult;

      setResult(assessment.finalOutcome ? assessment : null);
    }

    if (storedAssignment.workerId) {
      setAssignment(storedAssignment);
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading assessor dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to profile
          </Link>

          <Logo />
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f26b1d]">
            Assessor dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0b2a5b] sm:text-3xl">
            Welcome, {assessor?.name || "Assessor"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Review allocated workers, their answers, uploaded evidence, and
            complete the assessment.
          </p>
        </section>

        {!worker ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-950">
              No worker allocated yet
            </p>

            <p className="mt-1 text-sm text-amber-900">
              Allocate a worker from the worker allocation page to begin
              assessment.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#f26b1d]">
                  Allocated worker
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#0b2a5b]">
                  {worker.name || assignment?.workerName || "Worker"}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {worker.trade || "Trade not provided"} ·{" "}
                  {worker.location || "Location not provided"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {worker.email || "Email not provided"} ·{" "}
                  {worker.phone || "Phone not provided"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-right">
                <p className="text-xs text-slate-500">Evidence files</p>

                <p className="text-lg font-bold text-slate-900">
                  {evidence.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {Object.keys(answers).length} answers submitted
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Info
                label="Recommended level"
                value={
                  assignment?.recommendedNsqfLevel
                    ? `NSQF Level ${assignment.recommendedNsqfLevel}`
                    : "Not available"
                }
              />

              <Info
                label="Assessment status"
                value={result?.status || assignment?.status || "Pending"}
              />

              <Info
                label="Final result"
                value={
                  result?.finalOutcome
                    ? `${result.finalOutcome} · Level ${result.finalNsqfLevel}`
                    : "Not signed off"
                }
              />
            </div>

            <div className="mt-5">
              <Link
                href={`/assessor/assessment/${worker.id}`}
                className="inline-flex rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123c7a]"
              >
                Review answers & give marks
              </Link>
            </div>
          </section>
        )}

        {worker && displayEvidence.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Latest worker evidence
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayEvidence.slice(-6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-2">
                    {item.fileType === "video" ? (
                      <PlayCircle size={18} className="text-indigo-700" />
                    ) : item.fileType === "image" ? (
                      <FileImage size={18} className="text-indigo-700" />
                    ) : (
                      <FileText size={18} className="text-indigo-700" />
                    )}

                    <p className="text-sm font-semibold text-slate-900">
                      {item.fileName}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    {item.question}
                  </p>

                  {item.description && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function readObject(key: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(key);

  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}