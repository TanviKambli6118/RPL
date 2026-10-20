// File: app/dashboard/page.tsx
// Description: Worker dashboard with certificate connected to the journey.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Clock } from "lucide-react";

import Logo from "@/components/logo";
import WorkerCertificateCard from "@/components/worker-certificate-card";
import { getAssignmentForWorker, type Assignment } from "@/lib/assignments";
import { findCertificateForWorker, type Certificate } from "@/lib/certificate";

type WorkerView = {
  id: string;
  name: string;
  trade: string;
  location: string;
  suggestedNsqfLevel: number | null;
  suggestedQualification: string;
  suggestedQpCode: string;
};

type Step = {
  title: string;
  desc: string;
  done: boolean;
  href?: string;
  doneHref?: string;
  doneLabel?: string;
};

function readObject(key: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};

  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "{}");

    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

function loadWorker(): WorkerView | null {
  if (typeof window === "undefined") return null;

  const raw = {
    ...readObject("rpl_worker"),
    ...readObject("sahayak-worker-profile"),
  };

  const id = text(raw.id);

  if (!id) return null;

  return {
    id,
    name: text(raw.name) || "Worker",
    trade: text(raw.trade) || text(raw.jobRole) || text(raw.role),
    location: text(raw.location),
    suggestedNsqfLevel:
      typeof raw.suggestedNsqfLevel === "number"
        ? raw.suggestedNsqfLevel
        : null,
    suggestedQualification: text(raw.suggestedQualification),
    suggestedQpCode: text(raw.suggestedQpCode),
  };
}

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [worker, setWorker] = useState<WorkerView | null>(null);
  const [assignment, setAssignment] = useState<Assignment | undefined>();
  const [hasExperience, setHasExperience] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [hasAssessmentAnswers, setHasAssessmentAnswers] = useState(false);
  const [signOffDone, setSignOffDone] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const loadedWorker = loadWorker();

    setWorker(loadedWorker);

    if (!loadedWorker) {
      setLoaded(true);
      return;
    }

    setAssignment(getAssignmentForWorker(loadedWorker.id));

    setHasExperience(Object.keys(readObject("rpl_experience")).length > 0);

    setHasEvidence(
      window.localStorage.getItem(`rpl_evidence_${loadedWorker.id}`) !== null
    );

    setHasAssessmentAnswers(
      window.localStorage.getItem(
        `rpl_assessment_answers_${loadedWorker.id}`
      ) !== null
    );

    const assessment = readObject(`sahayak-assessment-${loadedWorker.id}`);
    const issued = findCertificateForWorker(
      loadedWorker.id,
      loadedWorker.name
    );

    setCertificate(issued);
    setSignOffDone(
      Boolean(assessment.finalOutcome) ||
        assessment.status === "completed" ||
        Boolean(issued)
    );

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-100">
        <p className="text-sm text-gray-700">Loading dashboard...</p>
      </main>
    );
  }

  if (!worker) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-800">
            No worker profile found. Please register first.
          </p>

          <Link
            href="/register"
            className="mt-4 inline-flex rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white"
          >
            Register
          </Link>
        </div>
      </main>
    );
  }

  const mapped = worker.suggestedNsqfLevel !== null;
  const certificateIssued = Boolean(certificate);

  const steps: Step[] = [
    {
      title: "Registration",
      desc: "Your worker profile has been created.",
      done: true,
    },
    {
      title: "Experience declared",
      desc: "Your previous work experience has been submitted.",
      done: hasExperience,
      href: hasExperience ? undefined : "/register/work-experience",
    },
    {
      title: "Qualification pack matched",
      desc: "Your experience is compared with the qualification pack.",
      done: mapped,
      href: mapped ? undefined : "/register/mapping",
    },
    {
      title: "Assessor assigned",
      desc: assignment
        ? `Assigned to ${assignment.assessorName}.`
        : "Choose an assessor to review your evidence.",
      done: Boolean(assignment),
      href: assignment ? undefined : "/register/allocation",
    },
    {
      title: "Evidence submitted",
      desc: "Upload photos, videos, and documents for assessor review.",
      done: hasEvidence,
      href: hasEvidence ? undefined : "/worker/evidence",
    },
    {
      title: "Practical skill tasks",
      desc: "Answer assessor questions and upload work evidence.",
      done: hasAssessmentAnswers || signOffDone,
      href: "/worker/assessment",
    },
    {
      title: "Assessor sign-off",
      desc: "The assessor reviews your answers and evidence, then gives the final decision.",
      done: signOffDone,
      href: assignment ? "/worker/assessment" : undefined,
    },
    {
      title: "Certificate issued",
      desc: certificateIssued
        ? `Your verified certificate ${certificate?.certificateId} is ready.`
        : signOffDone
        ? "A certificate is issued when the assessor marks you as competent."
        : "Your verified certificate appears after a successful sign-off.",
      done: certificateIssued,
      doneHref: "/worker/certificate",
      doneLabel: "View certificate",
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  const assessmentStatus = certificateIssued
    ? "Certified"
    : signOffDone
    ? "Completed"
    : assignment
    ? "Assigned"
    : "Awaiting assessor";

  return (
    <main className="min-h-screen bg-gray-100 p-3 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow">
          <Logo />

          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#0b2a5b] hover:underline"
          >
            Profile
          </Link>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm font-semibold text-[#c2410c]">
            Worker dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0b2a5b]">
            Welcome, {worker.name}
          </h1>

          <p className="mt-1 text-sm text-gray-700">
            Track your registration, qualification mapping, assessor
            allocation, assessment progress, and certificate.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/worker/evidence"
              className="rounded-lg bg-[#c2410c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a3412]"
            >
              Upload evidence
            </Link>

            <Link
              href="/worker/assessment"
              className="rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123c7a]"
            >
              View assessment
            </Link>

            <Link
              href="/register/allocation"
              className="rounded-lg border border-[#0b2a5b] px-4 py-2 text-sm font-semibold text-[#0b2a5b] hover:bg-blue-50"
            >
              View allocation
            </Link>

            {certificateIssued && (
              <Link
                href="/worker/certificate"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Award size={16} />
                My certificate
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Info label="Trade" value={worker.trade || "Not provided"} />

            <Info
              label="Location"
              value={worker.location || "Not provided"}
            />

            <Info label="Assessment status" value={assessmentStatus} />
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-800">
                Your progress
              </span>

              <span className="font-semibold text-[#0b2a5b]">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#c2410c]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-1 text-xs text-gray-700">
              {completed} of {steps.length} steps completed.
            </p>
          </div>
        </section>

        <WorkerCertificateCard workerId={worker.id} workerName={worker.name} />

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-[#c2410c]">
              Suggested qualification pack
            </p>

            {mapped ? (
              <>
                <h2 className="mt-2 text-lg font-bold text-[#0b2a5b]">
                  {worker.suggestedQualification}
                </h2>

                <p className="mt-1 text-sm text-gray-700">
                  NSQF Level: <b>{worker.suggestedNsqfLevel}</b>
                  {worker.suggestedQpCode && (
                    <>
                      {" "}
                      · QP Code: <b>{worker.suggestedQpCode}</b>
                    </>
                  )}
                </p>

                <p className="mt-3 text-xs text-gray-700">
                  This is a recommendation only. The final level is decided by
                  the qualified assessor after reviewing your evidence and
                  practical assessment.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-700">
                Qualification mapping not completed yet.
              </p>
            )}

            <Link
              href="/register/mapping"
              className="mt-4 inline-flex text-sm font-semibold text-[#0b2a5b] hover:underline"
            >
              Review qualification mapping
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-[#c2410c]">
              Assessor assigned
            </p>

            {assignment ? (
              <>
                <h2 className="mt-2 text-lg font-bold text-[#0b2a5b]">
                  {assignment.assessorName}
                </h2>

                <p className="mt-1 text-sm text-gray-700">
                  Your answers and evidence will be reviewed by your assigned
                  assessor.
                </p>

                <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {certificateIssued
                    ? "Certified"
                    : signOffDone
                    ? "Assessment completed"
                    : "Assigned"}
                </span>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/worker/assessment"
                    className="inline-flex rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123c7a]"
                  >
                    View assessment
                  </Link>

                  <Link
                    href="/worker/evidence"
                    className="inline-flex rounded-lg border border-[#0b2a5b] px-4 py-2 text-sm font-semibold text-[#0b2a5b] hover:bg-blue-50"
                  >
                    Upload evidence
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-700">
                  No assessor has been assigned yet.
                </p>

                <Link
                  href="/register/allocation"
                  className="mt-4 inline-flex rounded-lg bg-[#c2410c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a3412]"
                >
                  Find my assessor
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-[#0b2a5b]">
            Your assessment journey
          </h2>

          <p className="mt-1 text-xs text-gray-700">
            Complete each step to move toward assessor sign-off and
            certificate issue.
          </p>

          <ol className="mt-5 space-y-5">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.done
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {step.done ? "✓" : index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h3>

                    {step.href && !step.done && (
                      <Link
                        href={step.href}
                        className="text-xs font-semibold text-[#c2410c] hover:underline"
                      >
                        Continue
                      </Link>
                    )}

                    {step.done && step.doneHref && (
                      <Link
                        href={step.doneHref}
                        className="text-xs font-semibold text-emerald-800 hover:underline"
                      >
                        {step.doneLabel || "View"}
                      </Link>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-700">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/worker/assessment"
              className="rounded-lg bg-[#0b2a5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123c7a]"
            >
              View assessment
            </Link>

            <Link
              href="/worker/evidence"
              className="rounded-lg border border-[#0b2a5b] px-4 py-2 text-sm font-semibold text-[#0b2a5b] hover:bg-blue-50"
            >
              Upload evidence
            </Link>

            <Link
              href="/worker/skills-review"
              className="rounded-lg border border-[#0b2a5b] px-4 py-2 text-sm font-semibold text-[#0b2a5b] hover:bg-blue-50"
            >
              Review skills
            </Link>

            {certificateIssued ? (
              <Link
                href="/worker/certificate"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Award size={16} />
                View certificate
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                <Clock size={16} />
                Certificate pending
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-700">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-[#0b2a5b]">
        {value}
      </p>
    </div>
  );
}