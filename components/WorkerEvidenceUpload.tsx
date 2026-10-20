"use client";

import { useEffect, useState } from "react";
import { electricianAssessmentFields } from "@/lib/assessment";
import {
  type EvidenceItem,
  deleteFile,
  loadEvidence,
  putFile,
  saveEvidence,
} from "@/lib/evidenceStore";

export default function WorkerEvidenceUpload({ workerId }: { workerId: string }) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  useEffect(() => {
    setEvidence(loadEvidence(workerId));
  }, [workerId]);

  const update = (updater: (prev: EvidenceItem[]) => EvidenceItem[]) => {
    setEvidence((prev) => {
      const next = updater(prev);
      saveEvidence(workerId, next);
      return next;
    });
  };

  const handleUpload = async (
    fieldId: string,
    questionId: string,
    question: string,
    file: File,
    notes: string
  ) => {
    const id = crypto.randomUUID();

    // Store the real file so the assessor can open it later
    await putFile(id, file);

    const newItem: EvidenceItem = {
      id,
      fieldId,
      questionId,
      question,
      fileType: file.type.startsWith("video") ? "video" : "image",
      fileName: file.name,
      notes,
      uploadedAt: new Date().toISOString(),
    };

    update((prev) => [...prev, newItem]);
  };

  const handleRemove = async (item: EvidenceItem) => {
    await deleteFile(item.id);
    update((prev) => prev.filter((e) => e.id !== item.id));
  };

  return (
    <div className="space-y-8">
      {electricianAssessmentFields.map((field) => (
        <section
          key={field.id}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold">{field.title}</h2>

          <div className="mt-4 space-y-5">
            {field.questions.map((q) => {
              const uploaded = evidence.filter(
                (item) => item.fieldId === field.id && item.questionId === q.id
              );

              return (
                <div key={q.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1 text-sm text-gray-500">{q.guidance}</p>

                  <EvidenceRow
                    onUpload={(file, notes) =>
                      handleUpload(field.id, q.id, q.question, file, notes)
                    }
                  />

                  {uploaded.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {uploaded.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                        >
                          <span>
                            {item.fileType === "video" ? "🎥" : "🖼️"} {item.fileName}
                            {item.notes && (
                              <span className="ml-2 text-gray-500">– {item.notes}</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="text-red-600"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function EvidenceRow({
  onUpload,
}: {
  onUpload: (file: File, notes: string) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!file || busy) return;
    setBusy(true);
    try {
      await onUpload(file, notes);
      setFile(null);
      setNotes("");
      setInputKey((k) => k + 1);
      setStatus("Uploaded ✓");
    } catch (error) {
      console.error(error);
      setStatus("Upload failed");
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(""), 2500);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <input
        key={inputKey}
        type="file"
        accept="image/*,video/*"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setStatus("");
        }}
        className="block w-full text-sm"
      />

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Describe this work evidence"
        className="w-full rounded-md border border-gray-300 p-2 text-sm"
        rows={2}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!file || busy}
          onClick={handleClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload evidence"}
        </button>
        {status && <span className="text-sm text-green-600">{status}</span>}
      </div>
    </div>
  );
}