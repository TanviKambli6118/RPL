// lib/evidenceStore.ts
// Metadata lives in localStorage (same key as before), actual files live in IndexedDB.

export type EvidenceItem = {
  id: string;
  fieldId: string;
  questionId: string;
  question: string;
  fileType: "image" | "video";
  fileName: string;
  notes: string;
  uploadedAt: string;
};

const DB_NAME = "rpl_evidence_files";
const STORE = "files";

const keyFor = (workerId: string) => `rpl_evidence_${workerId}`;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putFile(id: string, file: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFile(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function loadEvidence(workerId: string): EvidenceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyFor(workerId));
    return raw ? (JSON.parse(raw) as EvidenceItem[]) : [];
  } catch (error) {
    console.error("Could not load evidence", error);
    return [];
  }
}

export function saveEvidence(workerId: string, items: EvidenceItem[]): void {
  try {
    window.localStorage.setItem(keyFor(workerId), JSON.stringify(items));
  } catch (error) {
    console.error("Could not save evidence", error);
  }
}