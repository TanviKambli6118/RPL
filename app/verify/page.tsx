// File: app/verify/page.tsx
// Description: Check a certificate ID. Reads /verify?id=... or manual entry.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldAlert, SearchX } from "lucide-react";
import {
  formatIssueDate,
  formatOutcome,
  verifyCertificate,
  type VerifyResult,
} from "@/lib/certificate";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);

  function check(id: string) {
    if (!id.trim()) return;
    setResult(verifyCertificate(id));
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setCode(id);
      setResult(verifyCertificate(id));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-[#0b2a5b]">
          Verify a certificate
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Enter the certificate ID printed on the certificate.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check(code)}
            placeholder="SAH-2026-ABC123"
            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="button"
            onClick={() => check(code)}
            className="rounded-lg bg-[#0b2a5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#071d40]"
          >
            Verify
          </button>
        </div>

        {result?.state === "valid" && (
          <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-900">
              <BadgeCheck size={22} />
              <p className="font-bold">Valid certificate</p>
            </div>
            <dl className="mt-3 grid gap-2 text-sm text-slate-900 sm:grid-cols-2">
              <Row label="Name" value={result.certificate.workerName} />
              <Row label="Trade" value={result.certificate.trade} />
              <Row label="NSQF level" value={`Level ${result.certificate.nsqfLevel}`} />
              <Row label="Outcome" value={formatOutcome(result.certificate.outcome)} />
              <Row label="Assessor" value={result.certificate.assessorName} />
              <Row label="Issued" value={formatIssueDate(result.certificate.issuedAt)} />
            </dl>
          </div>
        )}

        {result?.state === "tampered" && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
            <ShieldAlert size={22} className="shrink-0" />
            <p className="text-sm font-medium">
              This certificate ID exists, but its details do not match the
              verification code. Do not accept it.
            </p>
          </div>
        )}

        {result?.state === "not-found" && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <SearchX size={22} className="shrink-0" />
            <p className="text-sm font-medium">
              No certificate found with this ID. Check the code and try again.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-600">
          Demo note: certificates are stored in this browser, so verification
          works on the same device that issued them. A real deployment needs a
          backend database.
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}