// File: lib/useWorkerCertificate.ts
// Description: Dashboard hook. Returns the worker's certificate (if issued)
// and whether the assessor has completed the sign-off.

"use client";

import { useEffect, useState } from "react";
import { findCertificateForWorker, type Certificate } from "@/lib/certificate";

type Result = {
  ready: boolean;
  certificate: Certificate | null;
  signOffDone: boolean; // assessor submitted the assessment (any outcome)
  certificateIssued: boolean; // outcome was competent and certificate exists
};

function readJson(key: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function useWorkerCertificate(
  workerId?: string,
  workerName?: string
): Result {
  const [result, setResult] = useState<Result>({
    ready: false,
    certificate: null,
    signOffDone: false,
    certificateIssued: false,
  });

  useEffect(() => {
    const profile = {
      ...readJson("rpl_worker"),
      ...readJson("sahayak-worker-profile"),
    } as { id?: string; name?: string };

    const id = workerId || profile.id || "";
    const name = workerName || profile.name || "";

    const certificate = findCertificateForWorker(id, name);
    const assessment = readJson(`sahayak-assessment-${id}`) as {
      status?: string;
    };

    setResult({
      ready: true,
      certificate,
      signOffDone: assessment.status === "completed" || Boolean(certificate),
      certificateIssued: Boolean(certificate),
    });
  }, [workerId, workerName]);

  return result;
}