"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Upload } from "lucide-react";
import Logo from "@/components/logo";
import { assessmentFields, type EvidenceType } from "@/lib/assessment";

type WorkerProfile = {
  id?: string;
  name?: string;
  trade?: string;
  location?: string;
};

type EvidenceItem = {
  id: string;
  workerId: string;
  fieldId: string;
  questionId: string;
  question: string;
  answer: string;
  fileType: EvidenceType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export default function WorkerAssessmentPage() {
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedWorker = {
      ...readObject("rpl_worker"),
      ...readObject("sahayak-worker-profile"),
    } as WorkerProfile;

    const workerId = storedWorker.id || "";

    if (!workerId) {
      setMessage("Worker profile not found. Please complete registration.");
      return;
    }

    setWorker(storedWorker);

    const rawEvidence = window.localStorage.getItem(
      `rpl_evidence_${workerId}`
    );

    setEvidence(rawEvidence ? JSON.parse(rawEvidence) : []);

    const rawAnswers = window.localStorage.getItem(
      `rpl_assessment_answers_${workerId}`
    );

    setAnswers(rawAnswers ? JSON.parse(rawAnswers) : {});
  }, []);

  function saveAnswer(questionId: string, answer: string) {
    if (!worker?.id) return;

    const updated = {
      ...answers,
      [questionId]: answer,
    };

    setAnswers(updated);

    window.localStorage.setItem(
      `rpl_assessment_answers_${worker.id}`,
      JSON.stringify(updated)
    );
  }

  function uploadEvidence(
    fieldId: string,
    questionId: string,
    question: string,
    file: File
  ) {
    if (!worker?.id) return;

    const fileType: EvidenceType = file.type.startsWith("video")
      ? "video"
      : "image";

    const newItem: EvidenceItem = {
      id: `${Date.now()}-${questionId}`,
      workerId: worker.id,
      fieldId,
      questionId,
      question,
      answer: answers[questionId] || "",
      fileType,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    const updated = [...evidence, newItem];

    setEvidence(updated);

    window.localStorage.setItem(
      `rpl_evidence_${worker.id}`,
      JSON.stringify(updated)
    );

    setMessage("Evidence uploaded successfully.");
  }

  const workerId = worker?.id || "";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to profile
          </Link>

          <Logo />
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f26b1d]">
            Practical assessment
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0b2a5b] sm:text-3xl">
            Answer questions & upload evidence
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            For every task, write your answer and upload a photo or video of
            your actual work. Example: if asked to show puncture repair, upload
            a video of you repairing it.
          </p>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
              {message}
            </div>
          )}
        </section>

        {!workerId ? (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-950">
              Worker profile not found
            </p>
          </section>
        ) : (
          <div className="mt-6 space-y-8">
            {assessmentFields.map((field) => (
              <section
                key={field.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <h2 className="text-lg font-bold text-slate-900">
                  {field.title}
                </h2>

                <div className="mt-5 space-y-5">
                  {field.questions.map((question) => {
                    const questionEvidence = evidence.filter(
                      (item) => item.questionId === question.id
                    );

                    return (
                      <article
                        key={question.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {question.code} · {question.type}
                        </p>

                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {question.question}
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                          {question.guidance}
                        </p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="grid gap-1.5">
                              <span className="text-xs font-semibold text-slate-700">
                                Your answer
                              </span>

                              <textarea
                                rows={4}
                                value={answers[question.id] || ""}
                                onChange={(event) =>
                                  saveAnswer(
                                    question.id,
                                    event.target.value
                                  )
                                }
                                placeholder="Explain how you completed this work."
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              />
                            </label>
                          </div>

                          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
                            <p className="text-xs font-semibold text-slate-700">
                              Upload work evidence
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Photo or video of your work.
                            </p>

                            <EvidenceUpload
                              onUpload={(file) =>
                                uploadEvidence(
                                  field.id,
                                  question.id,
                                  question.question,
                                  file
                                )
                              }
                            />

                            {questionEvidence.length > 0 && (
                              <div className="mt-3 space-y-3">
                                {questionEvidence.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-lg border border-slate-200 p-3"
                                  >
                                    <div className="flex justify-between">
                                      <p className="text-xs font-medium">
                                        {item.fileName}
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = evidence.filter(
                                            (existing) =>
                                              existing.id !== item.id
                                          );

                                          setEvidence(updated);

                                          window.localStorage.setItem(
                                            `rpl_evidence_${workerId}`,
                                            JSON.stringify(updated)
                                          );
                                        }}
                                        className="text-xs text-red-600"
                                      >
                                        Remove
                                      </button>
                                    </div>

                                    {item.fileType === "image" && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.fileUrl}
                                        alt={item.fileName}
                                        className="mt-2 max-h-40 w-full rounded-lg object-contain"
                                      />
                                    )}

                                    {item.fileType === "video" && (
                                      <video
                                        src={item.fileUrl}
                                        controls
                                        className="mt-2 max-h-40 w-full rounded-lg"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Submit for assessor review
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Your answers and evidence will be reviewed by your assigned
                    assessor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!workerId) return;

                    window.localStorage.setItem(
                      `rpl_assessment_submitted_${workerId}`,
                      JSON.stringify({
                        submittedAt: new Date().toISOString(),
                      })
                    );

                    setMessage("Assessment submitted for assessor review.");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0b2a5b] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <CheckCircle2 size={17} />
                  Submit assessment
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function EvidenceUpload({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="mt-3">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />

      <button
        type="button"
        disabled={!file}
        onClick={() => {
          if (!file) return;
          onUpload(file);
          setFile(null);
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f26b1d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Upload size={16} />
        Upload
      </button>
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