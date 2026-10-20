// File: app/certificate/[workerId]/page.tsx
// Description: Verified RPL certificate for a worker. Print / save as PDF supported.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Printer, AlertCircle } from "lucide-react";
import {
  findCertificateForWorker,
  formatIssueDate,
  formatOutcome,
  verifyCertificate,
  type Certificate,
} from "@/lib/certificate";

type LoadState = "loading" | "missing" | "valid" | "tampered";

function readJson(key: string): { id?: string; name?: string } {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function CertificatePage() {
  const params = useParams<{ workerId: string }>();
  const workerId = typeof params.workerId === "string" ? params.workerId : "";

  const [state, setState] = useState<LoadState>("loading");
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const profile = {
      ...readJson("rpl_worker"),
      ...readJson("sahayak-worker-profile"),
    };

    // Look up by route id first, then fall back to the saved worker name
    const stored = findCertificateForWorker(workerId, profile.name || "");

    if (!stored) {
      setState("missing");
      return;
    }

    const result = verifyCertificate(stored.certificateId);
    setCertificate(stored);
    setState(result.state === "valid" ? "valid" : "tampered");
  }, [workerId]);

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <p className="text-sm text-slate-700">Loading certificate...</p>
      </main>
    );
  }

  if (state === "missing" || !certificate) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-800" />
              <div>
                <h1 className="text-base font-bold text-amber-950">
                  Certificate not issued yet
                </h1>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  Your certificate appears here once an assessor completes your
                  assessment and marks you as competent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

        {state === "tampered" && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 print:hidden">
            <AlertCircle size={20} className="shrink-0" />
            This certificate record does not match its verification code and
            cannot be treated as verified.
          </div>
        )}

        {/* Certificate */}
        <section className="rounded-sm border-[10px] border-double border-[#0b2a5b] bg-white p-3 shadow-md print:break-inside-avoid print:shadow-none">
          <div className="border-2 border-[#c2410c] px-6 py-10 text-center sm:px-12">
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
                value={`${certificate.totalAwardedScore}/${certificate.maxTotalScore}`}
              />
              <Detail label="Location" value={certificate.location} />
              <Detail
                label="Date of issue"
                value={formatIssueDate(certificate.issuedAt)}
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
                <BadgeCheck size={56} className="text-emerald-700" />
                <p className="mt-1 text-xs font-bold text-emerald-800">
                  Verified
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-700">Certificate ID</p>
                <p className="font-mono text-sm font-bold text-slate-900">
                  {certificate.certificateId}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  Verification code {certificate.verificationHash}
                </p>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-sm text-slate-700 print:hidden">
          Employers can check this certificate at{" "}
          <Link
            href={verifyPath}
            className="font-semibold text-indigo-800 underline"
          >
            {verifyPath}
          </Link>
        </p>
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