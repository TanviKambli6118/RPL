// File: lib/certificate.ts
// Description: Issue, store and verify RPL certificates (localStorage only).

export type Certificate = {
  certificateId: string;
  workerId: string;
  workerName: string;
  trade: string;
  location: string;
  nsqfLevel: number;
  outcome: string;
  totalAwardedScore: number;
  maxTotalScore: number;
  assessorName: string;
  assessmentId: string;
  issuedAt: string;
  status: "verified";
  verificationHash: string;
};

export type VerifyResult =
  | { state: "valid"; certificate: Certificate }
  | { state: "tampered"; certificate: Certificate }
  | { state: "not-found" };

const REGISTRY_KEY = "sahayak-certificates";

export function certificateKey(workerId: string) {
  return `sahayak-certificate-${workerId}`;
}

// Small deterministic hash. Good enough to detect edited records in this demo;
// replace with a server-side signature for production.
function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0");
}

function buildHash(c: Omit<Certificate, "verificationHash">): string {
  return hashString(
    [
      c.certificateId,
      c.workerId,
      c.workerName,
      c.trade,
      c.nsqfLevel,
      c.outcome,
      c.totalAwardedScore,
      c.maxTotalScore,
      c.assessorName,
      c.issuedAt,
    ].join("|")
  );
}

function generateCertificateId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SAH-${new Date().getFullYear()}-${code}`;
}

function readRegistry(): Certificate[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REGISTRY_KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as Certificate[]) : [];
  } catch {
    return [];
  }
}

export type IssueInput = {
  workerId: string;
  workerName: string;
  trade: string;
  location: string;
  nsqfLevel: number;
  outcome: string;
  totalAwardedScore: number;
  maxTotalScore: number;
  assessorName: string;
  assessmentId: string;
};

export function issueCertificate(input: IssueInput): Certificate {
  const base: Omit<Certificate, "verificationHash"> = {
    ...input,
    certificateId: generateCertificateId(),
    issuedAt: new Date().toISOString(),
    status: "verified",
  };

  const certificate: Certificate = {
    ...base,
    verificationHash: buildHash(base),
  };

  // Keep one certificate per worker in the registry (latest wins)
  const registry = readRegistry().filter((c) => c.workerId !== input.workerId);
  registry.push(certificate);

  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  window.localStorage.setItem(
    certificateKey(input.workerId),
    JSON.stringify(certificate)
  );

  return certificate;
}

export function getCertificateForWorker(workerId: string): Certificate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(certificateKey(workerId));
    return raw ? (JSON.parse(raw) as Certificate) : null;
  } catch {
    return null;
  }
}

export function verifyCertificate(certificateId: string): VerifyResult {
  const id = certificateId.trim().toUpperCase();
  const certificate = readRegistry().find(
    (c) => c.certificateId.toUpperCase() === id
  );

  if (!certificate) return { state: "not-found" };

  const { verificationHash, ...rest } = certificate;
  return buildHash(rest) === verificationHash
    ? { state: "valid", certificate }
    : { state: "tampered", certificate };
}

export function formatOutcome(outcome: string): string {
  switch (outcome) {
    case "competent":
      return "Competent";
    case "partially-competent":
      return "Partially competent";
    case "not-yet-competent":
      return "Not yet competent";
    default:
      return outcome;
  }
}

export function formatIssueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Finds a worker's certificate by id first, then falls back to matching name.
// Used by the worker page so the card still appears if profile ids differ.
export function findCertificateForWorker(
  workerId: string,
  workerName?: string
): Certificate | null {
  const direct = workerId ? getCertificateForWorker(workerId) : null;
  if (direct) return direct;

  if (!workerName) return null;

  const matches = readRegistry().filter(
    (c) => c.workerName.trim().toLowerCase() === workerName.trim().toLowerCase()
  );
  return matches.length > 0 ? matches[matches.length - 1] : null;
}