// File: components/certificate-button.tsx
// Description: Button for the worker page. Opens the certificate when issued,
// otherwise shows a disabled "Certificate pending" state.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Clock } from "lucide-react";
import { findCertificateForWorker } from "@/lib/certificate";

type Props = {
  workerId?: string;
  workerName?: string;
};

function readJson(key: string): { id?: string; name?: string } {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function CertificateButton({ workerId, workerName }: Props) {
  const [certWorkerId, setCertWorkerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = {
      ...readJson("rpl_worker"),
      ...readJson("sahayak-worker-profile"),
    };

    const certificate = findCertificateForWorker(
      workerId || profile.id || "",
      workerName || profile.name || ""
    );

    setCertWorkerId(certificate ? certificate.workerId : null);
    setReady(true);
  }, [workerId, workerName]);

  if (!ready) return null;

  if (!certWorkerId) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600">
        <Clock size={17} />
        Certificate pending
      </span>
    );
  }

  return (
    <Link
      href={`/certificate/${certWorkerId}`}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
    >
      <Award size={17} />
      View my certificate
    </Link>
  );
}