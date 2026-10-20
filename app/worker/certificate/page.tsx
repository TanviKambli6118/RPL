// File: app/worker/certificate/page.tsx
// Description: The logged-in worker's certificate.
// Shows the real verified certificate once issued. Until then it shows a
// clearly marked SAMPLE preview so the worker can see what they will receive.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BadgeCheck, Info, Printer } from "lucide-react";
import {
  findCertificateForWorker,
  formatIssueDate,
  formatOutcome,
  verifyCertificate,
  type Certificate,
} from "@/lib/certificate";

type LoadState = "loading" | "valid" | "tampered" | "sample";

function readJson(key: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function buildSample(): Certificate {
  const profile = {
    ...readJson("rpl_worker"),
    ...readJson("sahayak-worker-profile"),
  };
  const assignment = readJson("sahayak-assignment");

  return {
    certificateId: "SAMPLE-NOT-VALID",
    workerId: str(profile.id) || "sample",
    workerName: str(profile.name) || "Worker name",
    trade: str(profile.trade) || str(profile.jobRole) || str(profile.role) || "Electrician",
    location: str(profile.location) || "Mumbai",
    nsqfLevel:
      typeof profile.suggestedNsqfLevel === "number" ? profile.suggestedNsqfLevel : 3,
    outcome: "competent",
    totalAwardedScore: 0,
    maxTotalScore: 0,
    assessorName: str(assignment.assessorName) || "Assigned assessor",
    assessmentId: "sample",
    issuedAt: new Date().toISOString(),
    status: "verified",
    verificationHash: "SAMPLE",
  };
}

export default function WorkerCertificatePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const profile = {
      ...readJson("rpl_worker"),
      ...readJson("sahayak-worker-profile"),
    };

    const found = findCertificateForWorker(str(profile.id), str(profile.name));

    if (!found) {
      setCertificate(buildSample());
      setState("sample");
      return;
    }

    const result = verifyCertificate(found.certificateId);
    setCertificate(found);
    setState(result.state === "valid" ? "valid" : "tampered");
  }, []);

  if (state === "loading" || !certificate) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <p className="text-sm text-slate-700">Loading certificate...</p>
      </main>
    );
  }

  const isSample = state === "sample";
  const verifyPath = `/verify?id=${certificate.certificateId}`;

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl">
        {/* Toolbar: hidden when printing */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b2a5b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#071d40]"
          >
            <Printer size={17} />
            Download / print PDF
          </button>
        </div>

        {isSample && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 print:hidden">
            <Info size={20} className="mt-0.5 shrink-0 text-amber-800" />
            <p className="text-sm leading-6">
              <strong>Sample preview.</strong> This is how your certificate will
              look. Your real verified certificate, with its own ID, replaces
              this once the assessor completes your assessment and marks you as
              competent.
            </p>
          </div>
        )}

        {state === "tampered" && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 print:hidden">
            <AlertCircle size={20} className="shrink-0" />
            This certificate record does not match its verification code and
            cannot be treated as verified.
          </div>
        )}

        {/* Certificate */}
        <section className="relative overflow-hidden rounded-sm border-[10px] border-double border-[#0b2a5b] bg-white p-3 shadow-md print:break-inside-avoid print:shadow-none">
          {isSample && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="-rotate-12 select-none text-7xl font-black tracking-widest text-slate-300/60 sm:text-9xl">
                SAMPLE
              </span>
            </div>
          )}

          <div className="relative border-2 border-[#c2410c] px-6 py-10 text-center sm:px-12">
            <p className="text-sm font-semibold tracking-wide text-[#c2410c]">
              Recognition of Prior Learning
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold text-[#0b2a5b] sm:text-5xl">
              Certificate of Competency
            </h1>

            <p className="mt-8 text-sm text-slate-700">This is to certify that</p>

            <p className="mt-3 border-b border-slate-400 pb-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              {certificate.workerName}
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-800 sm:text-base">
              has been assessed through practical evidence, observation and viva
              and is declared{" "}
              <strong className="text-slate-900">
                {formatOutcome(certificate.outcome)}
              </strong>{" "}
              as a{" "}
              <strong className="text-slate-900">{certificate.trade}</strong> at{" "}
              <strong className="text-slate-900">
                NSQF Level {certificate.nsqfLevel}
              </strong>
              .
            </p>

            <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
              <Detail
                label="Score"
                value={
                  isSample
                    ? "Awarded after assessment"
                    : `${certificate.totalAwardedScore}/${certificate.maxTotalScore}`
                }
              />
              <Detail label="Location" value={certificate.location} />
              <Detail
                label="Date of issue"
                value={isSample ? "On sign-off" : formatIssueDate(certificate.issuedAt)}
              />
            </div>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-6 text-left">
              <div>
                <p className="border-t border-slate-500 pt-1 text-sm font-semibold text-slate-900">
                  {certificate.assessorName}
                </p>
                <p className="text-xs text-slate-700">Assessor</p>
              </div>

              <div className="flex flex-col items-center">
                <BadgeCheck
                  size={56}
                  className={isSample ? "text-slate-400" : "text-emerald-700"}
                />
                <p
                  className={`mt-1 text-xs font-bold ${
                    isSample ? "text-slate-600" : "text-emerald-800"
                  }`}
                >
                  {isSample ? "Not yet verified" : "Verified"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-700">Certificate ID</p>
                <p className="font-mono text-sm font-bold text-slate-900">
                  {isSample ? "Issued after sign-off" : certificate.certificateId}
                </p>
                {!isSample && (
                  <p className="mt-1 text-xs text-slate-700">
                    Verification code {certificate.verificationHash}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {!isSample && (
          <p className="mt-4 text-center text-sm text-slate-700 print:hidden">
            Employers can check this certificate at{" "}
            <Link
              href={verifyPath}
              className="font-semibold text-indigo-800 underline"
            >
              {verifyPath}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 print:bg-white">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}