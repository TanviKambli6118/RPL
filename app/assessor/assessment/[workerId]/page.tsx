// File: app/assessor/assessment/[workerId]/page.tsx
// Description: Field-wise practical assessment page for an allocated worker.
// Uses localStorage only. Colours updated for strong, readable contrast.

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  FileImage,
  FileText,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/logo";
import { issueCertificate } from "@/lib/certificate";
import {
  assessmentFields,
  getMaxTotalScore,
  type EvidenceType,
} from "@/lib/assessment";

type WorkerProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  role?: string;
  trade?: string;
  registeredAt?: string;
};

type AssessorProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  sector?: string;
  jobRole?: string;
  experienceYears?: number;
  nsqfLevels?: number[];
};

type Assignment = {
  assignmentId?: string;
  workerId?: string;
  workerName?: string;
  assessorId?: string;
  assessorName?: string;
  role?: string;
  recommendedNsqfLevel?: number;
  status?: string;
  assignedAt?: string;
};

type EvidenceItem = {
  id: string;
  workerId: string;
  fieldId: string;
  questionId: string;
  title: string;
  description: string;
  fileType: EvidenceType;
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
};

type QuestionInput = {
  score: string;
  decision: string;
  notes: string;
};

type AccessState =
  | "loading"
  | "ready"
  | "not-assigned"
  | "worker-not-found"
  | "not-assessor";

const emptyQuestionInput: QuestionInput = {
  score: "",
  decision: "",
  notes: "",
};

// Shared style for every input, select and textarea.
// Explicit text + background colours so dark-mode/global CSS can't wash them out.
const inputClass =
  "w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200";

// Sample evidence shown when the worker has not uploaded anything yet
const staticEvidence: EvidenceItem[] = [
  {
    id: "static-1",
    workerId: "demo",
    fieldId: "",
    questionId: "",
    title: "Switch board installation",
    description: "Photo of a completed switch board with colour-coded wires.",
    fileType: "image",
    fileName: "switch-board-installation.jpg",
    uploadedAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "static-2",
    workerId: "demo",
    fieldId: "",
    questionId: "",
    title: "Safety precautions",
    description:
      "Video showing power isolation, tester check and use of insulated gloves.",
    fileType: "video",
    fileName: "safety-precautions.mp4",
    uploadedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "static-3",
    workerId: "demo",
    fieldId: "",
    questionId: "",
    title: "DB earthing connection",
    description: "Photo of the earthing wire connected to the DB earth bar.",
    fileType: "image",
    fileName: "db-earthing.jpg",
    uploadedAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "static-4",
    workerId: "demo",
    fieldId: "",
    questionId: "",
    title: "Multimeter testing",
    description:
      "Video of continuity and voltage testing on a lighting circuit.",
    fileType: "video",
    fileName: "multimeter-testing.mp4",
    uploadedAt: "2026-10-04T10:00:00.000Z",
  },
  {
    id: "static-5",
    workerId: "demo",
    fieldId: "",
    questionId: "",
    title: "Residential wiring job card",
    description: "Job card from a residential wiring project, Mumbai.",
    fileType: "document",
    fileName: "job-card-residential-wiring.pdf",
    uploadedAt: "2026-10-05T10:00:00.000Z",
  },
];

export default function AssessmentPage() {
  const params = useParams<{ workerId: string }>();

  const routeWorkerId =
    typeof params.workerId === "string" ? params.workerId : "";

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [assessor, setAssessor] = useState<AssessorProfile | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [questionInputs, setQuestionInputs] = useState<
    Record<string, QuestionInput>
  >({});
  const [finalOutcome, setFinalOutcome] = useState("");
  const [finalNsqfLevel, setFinalNsqfLevel] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [certificateId, setCertificateId] = useState("");

  const displayEvidence = evidence.length > 0 ? evidence : staticEvidence;

  useEffect(() => {
    if (!routeWorkerId) {
      setAccessState("worker-not-found");
      return;
    }

    loadAssessmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeWorkerId]);

  function loadAssessmentData() {
    if (typeof window === "undefined") return;

    // Static mode: no access checks. Stored data is used if present,
    // otherwise default values are shown so the page always opens.
    const assessorProfile = readStorageObject(
      "sahayak-assessor-profile"
    ) as AssessorProfile;
    const storedAssignment = readStorageObject(
      "sahayak-assignment"
    ) as Assignment;
    const storedWorker = {
      ...readStorageObject("rpl_worker"),
      ...readStorageObject("sahayak-worker-profile"),
    } as WorkerProfile;

    const workerProfile: WorkerProfile = {
      ...storedWorker,
      id: routeWorkerId,
      name: storedWorker.name || storedAssignment.workerName || "Tanvi",
      trade: storedWorker.trade || storedWorker.role || "Electrician",
      location: storedWorker.location || "Mumbai",
    };

    const assessorData: AssessorProfile = {
      ...assessorProfile,
      id: assessorProfile.id || "assessor-demo",
      name: assessorProfile.name || storedAssignment.assessorName || "Mansi",
    };

    const assignmentData: Assignment = {
      ...storedAssignment,
      workerId: routeWorkerId,
      assessorId: assessorData.id,
      recommendedNsqfLevel: storedAssignment.recommendedNsqfLevel || 4,
      status: storedAssignment.status || "assigned",
    };

    setWorker(workerProfile);
    setAssessor(assessorData);
    setAssignment(assignmentData);
    setEvidence(readEvidenceFromStorage(routeWorkerId));

    setFinalNsqfLevel(String(assignmentData.recommendedNsqfLevel));

    setAccessState("ready");
  }

  const evidenceByField = useMemo(() => {
    return assessmentFields.map((field) => ({
      field,
      evidence: evidence.filter((item) => item.fieldId === field.id),
    }));
  }, [evidence]);

  const totalAwardedScore = useMemo(() => {
    return Object.values(questionInputs).reduce((total, input) => {
      const score = Number(input.score);
      return Number.isFinite(score) ? total + score : total;
    }, 0);
  }, [questionInputs]);

  const maxTotalScore = getMaxTotalScore();

  const completedQuestions = assessmentFields
    .flatMap((field) => field.questions)
    .filter((question) => {
      const input = questionInputs[question.id];
      return Boolean(input?.score && input?.decision);
    }).length;

  const totalQuestions = assessmentFields.reduce(
    (total, field) => total + field.questions.length,
    0
  );

  function updateQuestionInput(
    questionId: string,
    field: keyof QuestionInput,
    value: string
  ) {
    setQuestionInputs((current) => ({
      ...current,
      [questionId]: {
        ...emptyQuestionInput,
        ...current[questionId],
        [field]: value,
      },
    }));
  }

  function submitAssessment() {
    if (!worker || !assessor || !assignment) return;

    if (typeof window === "undefined") return;

    if (!finalOutcome || !finalNsqfLevel) {
      setSubmitMessage(
        "Please select the final outcome and recommended NSQF level."
      );
      return;
    }

    const incompleteQuestion = assessmentFields
      .flatMap((field) => field.questions)
      .some((question) => {
        const input = questionInputs[question.id];
        return !input?.score || !input?.decision;
      });

    if (incompleteQuestion) {
      setSubmitMessage(
        "Please enter a score and decision for every assessment question."
      );
      return;
    }

    const submittedAssessment = {
      assessmentId: `assessment-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name || "Worker",
      assessorId: assessor.id,
      assessorName: assessor.name || "Assessor",
      assignmentId: assignment.assignmentId || "",
      fieldWiseAssessment: assessmentFields.map((field) => ({
        fieldId: field.id,
        fieldTitle: field.title,
        questions: field.questions.map((question) => ({
          questionId: question.id,
          code: question.code,
          type: question.type,
          question: question.question,
          maxScore: question.maxScore,
          score: Number(questionInputs[question.id]?.score || 0),
          decision: questionInputs[question.id]?.decision || "",
          notes: questionInputs[question.id]?.notes || "",
        })),
      })),
      totalAwardedScore,
      maxTotalScore,
      finalOutcome,
      finalNsqfLevel: Number(finalNsqfLevel),
      status: "completed",
      submittedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      `sahayak-assessment-${worker.id}`,
      JSON.stringify(submittedAssessment)
    );

    window.localStorage.setItem(
      "sahayak-assignment",
      JSON.stringify({
        ...assignment,
        status: "completed",
      })
    );

    // Issue a verified certificate only when the worker is competent
    if (finalOutcome === "competent") {
      const certificate = issueCertificate({
        workerId: worker.id || routeWorkerId,
        workerName: worker.name || "Worker",
        trade: worker.trade || worker.role || assignment.role || "Worker",
        location: worker.location || "India",
        nsqfLevel: Number(finalNsqfLevel),
        outcome: finalOutcome,
        totalAwardedScore,
        maxTotalScore,
        assessorName: assessor.name || "Assessor",
        assessmentId: submittedAssessment.assessmentId,
      });

      setCertificateId(certificate.certificateId);
      setSubmitMessage(
        `Sign-off saved. Verified certificate ${certificate.certificateId} issued.`
      );
      return;
    }

    setCertificateId("");
    setSubmitMessage(
      "Sign-off saved. A certificate is issued only when the outcome is Competent."
    );
  }

  if (accessState === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">Loading assessment...</p>
        </div>
      </main>
    );
  }

  if (accessState !== "ready" || !worker || !assessor || !assignment) {
    const message =
      accessState === "not-assessor"
        ? "Please log in using an assessor account to open an assessment."
        : accessState === "not-assigned"
        ? "This worker is not allocated to the currently logged-in assessor."
        : "The worker for this assessment could not be found.";

    return (
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <Link
            href="/assessor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to assessor dashboard
          </Link>

          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-800"
              />

              <div>
                <h1 className="text-base font-bold text-amber-950">
                  Assessment unavailable
                </h1>

                <p className="mt-1 text-sm leading-6 text-amber-950">
                  {message}
                </p>

                <p className="mt-2 text-xs leading-5 text-amber-900">
                  Go to the worker allocation page, confirm that the worker is
                  assigned to this assessor account, then open the assessment
                  from the assessor dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const workerRole =
    worker.trade || worker.role || assignment.role || "Not selected";

  const recommendedLevel =
    assignment.recommendedNsqfLevel || Number(finalNsqfLevel) || 0;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link
            href="/assessor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to assessor dashboard
          </Link>

          <Logo />
        </header>

        <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
            Worker assessment
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0b2a5b] sm:text-3xl">
            {worker.name || "Worker"}
          </h1>

          <p className="mt-2 text-sm text-slate-700">
            {workerRole} · {worker.location || "Location not provided"}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard
              label="Assigned assessor"
              value={assessor.name || "Assessor"}
            />

            <InfoCard
              label="AI recommended level"
              value={
                recommendedLevel
                  ? `NSQF Level ${recommendedLevel}`
                  : "Not available"
              }
            />

            <InfoCard
              label="Evidence available"
              value={`${displayEvidence.length} file${
                displayEvidence.length === 1 ? "" : "s"
              }`}
            />
          </div>

          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-amber-800"
              />

              <div>
                <p className="text-sm font-semibold text-amber-950">
                  AI support, human decision
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-950">
                  Review each field-wise question and uploaded evidence. The
                  assessor makes the final NSQF decision.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Worker evidence</h2>

          <p className="mt-1 text-sm text-slate-700">
            Photos, videos and documents shared by the worker.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayEvidence.map((item) => (
              <EvidenceCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Field-wise assessment
              </h2>

              <p className="mt-1 text-sm text-slate-700">
                Score every question using evidence, observation, and viva
                answers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-right">
              <p className="text-xs font-medium text-slate-600">Completed</p>
              <p className="text-sm font-bold text-slate-900">
                {completedQuestions}/{totalQuestions} questions
              </p>

              <p className="mt-1 text-xs font-medium text-slate-700">
                Score: {totalAwardedScore}/{maxTotalScore}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-8">
            {evidenceByField.map(({ field, evidence: fieldEvidence }) => (
              <article
                key={field.id}
                className="rounded-2xl border border-slate-300 p-5"
              >
                <h3 className="text-base font-bold text-slate-900">
                  {field.title}
                </h3>

                <p className="mt-1 text-sm text-slate-700">
                  {field.description}
                </p>

                <div className="mt-5 space-y-4">
                  {field.questions.map((question) => {
                    const currentInput =
                      questionInputs[question.id] || emptyQuestionInput;

                    const questionEvidence = fieldEvidence.filter(
                      (item) => item.questionId === question.id
                    );

                    return (
                      <div
                        key={question.id}
                        className="rounded-xl border border-slate-300 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {question.code} · {question.type}
                        </p>

                        <h4 className="mt-1 text-sm font-bold text-slate-900">
                          {question.question}
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-700">
                          {question.guidance}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-600">
                          Maximum score: {question.maxScore}
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-800">
                              Score
                            </span>

                            <input
                              type="number"
                              min="0"
                              max={question.maxScore}
                              value={currentInput.score}
                              onChange={(event) =>
                                updateQuestionInput(
                                  question.id,
                                  "score",
                                  event.target.value
                                )
                              }
                              placeholder={`0 to ${question.maxScore}`}
                              className={inputClass}
                            />
                          </label>

                          <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-800">
                              Decision
                            </span>

                            <select
                              value={currentInput.decision}
                              onChange={(event) =>
                                updateQuestionInput(
                                  question.id,
                                  "decision",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                            >
                              <option value="" className="text-slate-900">
                                Select decision
                              </option>
                              <option
                                value="competent"
                                className="text-slate-900"
                              >
                                Competent
                              </option>
                              <option
                                value="partially-competent"
                                className="text-slate-900"
                              >
                                Partially competent
                              </option>
                              <option
                                value="not-yet-competent"
                                className="text-slate-900"
                              >
                                Not yet competent
                              </option>
                            </select>
                          </label>
                        </div>

                        <label className="mt-3 grid gap-1.5">
                          <span className="text-xs font-semibold text-slate-800">
                            Evidence-based notes
                          </span>

                          <textarea
                            rows={3}
                            value={currentInput.notes}
                            onChange={(event) =>
                              updateQuestionInput(
                                question.id,
                                "notes",
                                event.target.value
                              )
                            }
                            placeholder="Write what you observed and which evidence supports the score."
                            className={inputClass}
                          />
                        </label>

                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-800">
                            Worker evidence for this question
                          </p>

                          {questionEvidence.length === 0 ? (
                            <p className="mt-2 rounded-lg border border-dashed border-slate-400 bg-white px-3 py-3 text-xs text-slate-700">
                              No photo, video, or document uploaded for this
                              question yet.
                            </p>
                          ) : (
                            <div className="mt-2 grid gap-3 sm:grid-cols-2">
                              {questionEvidence.map((item) => (
                                <EvidenceCard key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">
            Final assessor decision
          </h2>

          <p className="mt-1 text-sm text-slate-700">
            This decision is stored locally in the current browser for this
            offline demo.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-slate-800">
                Final outcome
              </span>

              <select
                value={finalOutcome}
                onChange={(event) => setFinalOutcome(event.target.value)}
                className={`${inputClass} py-2.5`}
              >
                <option value="" className="text-slate-900">
                  Select final outcome
                </option>
                <option value="competent" className="text-slate-900">
                  Competent
                </option>
                <option value="partially-competent" className="text-slate-900">
                  Partially competent
                </option>
                <option value="not-yet-competent" className="text-slate-900">
                  Not yet competent
                </option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-slate-800">
                Recommended NSQF level
              </span>

              <select
                value={finalNsqfLevel}
                onChange={(event) => setFinalNsqfLevel(event.target.value)}
                className={`${inputClass} py-2.5`}
              >
                <option value="" className="text-slate-900">
                  Select level
                </option>
                <option value="2" className="text-slate-900">
                  NSQF Level 2
                </option>
                <option value="3" className="text-slate-900">
                  NSQF Level 3
                </option>
                <option value="4" className="text-slate-900">
                  NSQF Level 4
                </option>
                <option value="5" className="text-slate-900">
                  NSQF Level 5
                </option>
                <option value="6" className="text-slate-900">
                  NSQF Level 6
                </option>
              </select>
            </label>
          </div>

          {submitMessage && (
            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-medium text-indigo-950">
              {submitMessage}
            </div>
          )}

          {certificateId && (
            <Link
              href={`/certificate/${worker.id || routeWorkerId}`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <Award size={17} />
              View verified certificate
            </Link>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={submitAssessment}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b2a5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#071d40] focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <CheckCircle2 size={17} />
              Submit assessor sign-off
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function readStorageObject(key: string): Record<string, unknown> {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function readEvidenceFromStorage(workerId: string): EvidenceItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const evidenceKeys = [
    `rpl_evidence_${workerId}`,
    "rpl_documents",
    "rpl_evidence",
    "sahayak-evidence",
    "worker-evidence",
  ];

  const collected: EvidenceItem[] = [];

  for (const key of evidenceKeys) {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue);

      if (!Array.isArray(parsed)) continue;

      const usableEvidence = parsed
        .map((item, index) => {
          const record =
            item && typeof item === "object"
              ? (item as Record<string, unknown>)
              : {};

          const itemWorkerId =
            typeof record.workerId === "string" ? record.workerId : "";

          if (itemWorkerId && itemWorkerId !== workerId) {
            return null;
          }

          const title =
            typeof record.title === "string"
              ? record.title
              : typeof record.name === "string"
              ? record.name
              : typeof record.fileName === "string"
              ? record.fileName
              : `Evidence file ${index + 1}`;

          const rawType =
            typeof record.fileType === "string"
              ? record.fileType.toLowerCase()
              : typeof record.type === "string"
              ? record.type.toLowerCase()
              : "";

          const fileType: EvidenceType = rawType.includes("video")
            ? "video"
            : rawType.includes("image")
            ? "image"
            : "document";

          return {
            id:
              typeof record.id === "string"
                ? record.id
                : `${key}-${index}`,
            workerId: itemWorkerId || workerId,
            fieldId:
              typeof record.fieldId === "string" ? record.fieldId : "",
            questionId:
              typeof record.questionId === "string"
                ? record.questionId
                : "",
            title,
            description:
              typeof record.description === "string"
                ? record.description
                : typeof record.notes === "string" && record.notes
                ? record.notes
                : "Worker-uploaded evidence.",
            fileType,
            fileName:
              typeof record.fileName === "string"
                ? record.fileName
                : title,
            fileUrl:
              typeof record.fileUrl === "string" ? record.fileUrl : undefined,
            uploadedAt:
              typeof record.uploadedAt === "string"
                ? record.uploadedAt
                : new Date().toISOString(),
          } satisfies EvidenceItem;
        })
        .filter((item): item is EvidenceItem => item !== null);

      collected.push(...usableEvidence);
    } catch {
      continue;
    }
  }

  return collected;
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const Icon =
    item.fileType === "video"
      ? PlayCircle
      : item.fileType === "image"
      ? FileImage
      : FileText;

  return (
    <article className="rounded-xl border border-slate-300 bg-white p-4">
      <Icon size={20} className="text-indigo-800" />

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {item.title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-700">
        {item.description}
      </p>

      {item.fileUrl && item.fileType === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.fileUrl}
          alt={item.title}
          className="mt-3 max-h-48 w-full rounded-lg object-contain"
        />
      )}

      {item.fileUrl && item.fileType === "video" && (
        <video
          src={item.fileUrl}
          controls
          className="mt-3 max-h-48 w-full rounded-lg"
        />
      )}

      <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-900">
        {item.fileType}
      </span>
    </article>
  );
}