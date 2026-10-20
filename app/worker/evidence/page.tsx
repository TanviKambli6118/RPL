"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import Logo from "@/components/logo";
import { assessmentFields, type EvidenceType } from "@/lib/assessment";

type Session = {
  role?: "worker" | "assessor";
  userId?: string;
  name?: string;
};

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
  description: string;
  fileType: EvidenceType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export default function WorkerEvidencePage() {
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = readObject("sahayak-session") as Session;

    const worker = {
      ...readObject("rpl_worker"),
      ...readObject("sahayak-worker-profile"),
    } as WorkerProfile;

    const currentWorkerId =
      worker.id || session.userId || "";

    if (!currentWorkerId) {
      setMessage(
        "Worker profile not found. Please complete registration or log in as a worker."
      );
      return;
    }

    setWorkerId(currentWorkerId);
    setWorkerName(worker.name || session.name || "Worker");

    const raw = window.localStorage.getItem(
      `rpl_evidence_${currentWorkerId}`
    );

    setEvidence(raw ? JSON.parse(raw) : []);
  }, []);

  function uploadEvidence(
    fieldId: string,
    questionId: string,
    question: string,
    file: File,
    description: string
  ) {
    if (!workerId) {
      setMessage("Worker ID is missing. Please refresh or log in again.");
      return;
    }

    const fileType: EvidenceType = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
      ? "image"
      : "document";

    const newItem: EvidenceItem = {
      id: `${Date.now()}-${questionId}`,
      workerId,
      fieldId,
      questionId,
      question,
      description,
      fileType,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    setEvidence((currentEvidence) => {
      const updated = [...currentEvidence, newItem];

      window.localStorage.setItem(
        `rpl_evidence_${workerId}`,
        JSON.stringify(updated)
      );

      return updated;
    });

    setMessage("Evidence uploaded successfully.");
  }

  function removeEvidence(id: string) {
    if (!workerId) return;

    setEvidence((currentEvidence) => {
      const updated = currentEvidence.filter((item) => item.id !== id);

      window.localStorage.setItem(
        `rpl_evidence_${workerId}`,
        JSON.stringify(updated)
      );

      return updated;
    });

    setMessage("Evidence removed.");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to worker dashboard
          </Link>

          <Logo />
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f26b1d]">
            Assessment evidence
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0b2a5b] sm:text-3xl">
            Upload work evidence
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Logged-in worker: <b>{workerName || "Loading..."}</b>
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Upload a photo or video for each practical question. Example: if
            asked to show puncture repair, upload a video of you repairing it.
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

                        <EvidenceUploadForm
                          onUpload={(file, description) =>
                            uploadEvidence(
                              field.id,
                              question.id,
                              question.question,
                              file,
                              description
                            )
                          }
                        />

                        {questionEvidence.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Uploaded evidence
                            </p>

                            {questionEvidence.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-slate-200 bg-white p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {item.fileName}
                                    </p>

                                    <p className="text-xs capitalize text-slate-500">
                                      {item.fileType}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeEvidence(item.id)}
                                    className="text-xs font-semibold text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>

                                {item.description && (
                                  <p className="mt-2 text-xs text-slate-600">
                                    {item.description}
                                  </p>
                                )}

                                {item.fileType === "image" && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.fileUrl}
                                    alt={item.fileName}
                                    className="mt-3 max-h-48 w-full rounded-lg object-contain"
                                  />
                                )}

                                {item.fileType === "video" && (
                                  <video
                                    src={item.fileUrl}
                                    controls
                                    className="mt-3 max-h-48 w-full rounded-lg"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EvidenceUploadForm({
  onUpload,
}: {
  onUpload: (file: File, description: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-slate-700">
          Upload photo or video
        </span>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
          }}
          className="block w-full text-sm"
        />
      </label>

      <label className="mt-3 grid gap-1.5">
        <span className="text-xs font-semibold text-slate-700">
          Describe this work
        </span>

        <textarea
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: Repaired a puncture and tested the tyre."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      <button
        type="button"
        disabled={!file}
        onClick={() => {
          if (!file) return;

          onUpload(file, description);

          setFile(null);
          setDescription("");
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f26b1d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Upload size={16} />
        Upload evidence
      </button>

      {file && (
        <p className="mt-2 text-xs text-slate-500">
          Selected: {file.name}
        </p>
      )}
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