// File: components/worker-certificate-card.tsx
// Description: Drop-in card for the worker page. Shows the verified certificate
// once issued, otherwise the current assessment status.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, BadgeCheck, Clock, Info } from "lucide-react";
import {
  findCertificateForWorker,
  formatIssueDate,
  verifyCertificate,
  type Certificate,
} from "@/lib/certificate";

type Props = {
  // Optional. If omitted, the id/name is read from the saved worker profile.
  workerId?: string;
  workerName?: string;
};

type CardState =
  | { kind: "loading" }
  | { kind: "issued"; certificate: Certificate; valid: boolean }
  | { kind: "not-competent" }
  | { kind: "pending" };

function readJson(key: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function WorkerCertificateCard({ workerId, workerName }: Props) {
  const [state, setState] = useState<CardState>({ kind: "loading" });

  useEffect(() => {
    const profile = {
      ...readJson("rpl_worker"),
      ...readJson("sahayak-worker-profile"),
    } as { id?: string; name?: string };

    const id = workerId || profile.id || "";
    const name = workerName || profile.name || "";

    const certificate = findCertificateForWorker(id, name);

    if (certificate) {
      const valid = verifyCertificate(certificate.certificateId).state === "valid";
      setState({ kind: "issued", certificate, valid });
      return;
    }

    // Assessment finished but outcome was not "competent"
    const assessment = readJson(`sahayak-assessment-${id}`) as {
      status?: string;
      finalOutcome?: string;
    };

    if (assessment.status === "completed" && assessment.finalOutcome !== "competent") {
      setState({ kind: "not-competent" });
      return;
    }

    setState({ kind: "pending" });
  }, [workerId, workerName]);

  if (state.kind === "loading") {
    return (
      <section className="rounded-2xl border border-slate-300 bg-white p-5 text-sm text-slate-700">
        Loading certificate...
      </section>
    );
  }

  if (state.kind === "issued") {
    const { certificate, valid } = state;

    return (
      <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <BadgeCheck size={28} className="mt-0.5 shrink-0 text-emerald-700" />

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-emerald-950">
              {valid ? "Your verified certificate" : "Certificate needs review"}
            </h2>

            <p className="mt-1 text-sm text-slate-800">
              {certificate.trade} · NSQF Level {certificate.nsqfLevel} · Issued{" "}
              {formatIssueDate(certificate.issuedAt)}
            </p>

            <p className="mt-2 text-xs text-slate-700">Certificate ID</p>
            <p className="font-mono text-sm font-bold text-slate-900">
              {certificate.certificateId}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/certificate/${certificate.workerId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b2a5b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#071d40]"
              >
                <Award size={17} />
                View and download
              </Link>

              <Link
                href={`/verify?id=${certificate.certificateId}`}
                className="inline-flex items-center rounded-lg border border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Verification page
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (state.kind === "not-competent") {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info size={22} className="mt-0.5 shrink-0 text-amber-800" />
          <div>
            <h2 className="text-base font-bold text-amber-950">
              Assessment completed
            </h2>
            <p className="mt-1 text-sm text-amber-950">
              A certificate is issued when the assessor marks you as competent.
              Talk to your assessor about the next steps.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Clock size={22} className="mt-0.5 shrink-0 text-slate-700" />
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Certificate pending
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Your verified certificate appears here after the assessor completes
            your assessment.
          </p>
        </div>
      </div>
    </section>
  );
}