"use client";

import { useEffect, useState } from "react";
import { type EvidenceItem, getFile, loadEvidence } from "@/lib/evidenceStore";

export default function AssessorEvidenceList({ workerId }: { workerId: string }) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];

    const list = loadEvidence(workerId);
    setItems(list);

    (async () => {
      const map: Record<string, string> = {};
      for (const item of list) {
        try {
          const blob = await getFile(item.id);
          if (blob) {
            const url = URL.createObjectURL(blob);
            created.push(url);
            map[item.id] = url;
          }
        } catch (error) {
          console.error("Could not read file", error);
        }
      }
      if (!cancelled) {
        setUrls(map);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [workerId]);

  // Group by question
  const grouped = items.reduce<Record<string, EvidenceItem[]>>((acc, item) => {
    const key = `${item.fieldId}:${item.questionId}`;
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold">
        Worker evidence ({items.length})
      </h2>

      {loading && <p className="mt-3 text-sm text-gray-500">Loading evidence...</p>}

      {!loading && items.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          This worker has not uploaded any evidence yet.
        </p>
      )}

      <div className="mt-4 space-y-6">
        {Object.entries(grouped).map(([key, group]) => (
          <div key={key} className="rounded-lg border border-gray-200 p-4">
            <p className="font-medium">{group[0].question}</p>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {group.map((item) => {
                const url = urls[item.id];
                return (
                  <figure key={item.id} className="space-y-2">
                    {url ? (
                      item.fileType === "video" ? (
                        <video
                          src={url}
                          controls
                          className="w-full rounded-md bg-black"
                        />
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt={item.fileName}
                            className="w-full rounded-md object-cover"
                          />
                        </a>
                      )
                    ) : (
                      <div className="rounded-md bg-gray-100 p-4 text-sm text-gray-500">
                        File not available in this browser.
                      </div>
                    )}
                    <figcaption className="text-sm">
                      <span className="font-medium">{item.fileName}</span>
                      {item.notes && (
                        <p className="text-gray-600">{item.notes}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(item.uploadedAt).toLocaleString()}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}