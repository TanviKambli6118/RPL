// lib/assignments.ts

export type Assignment = {
  assignmentId: string;
  workerId: string;
  workerName: string;
  workerLocation: string;
  trade: string;
  suggestedNsqfLevel: number;
  assessorId: string;
  assessorName: string;
  status: "assigned";
  assignedAt: string;
};

export const ASSIGNMENTS_KEY = "sahayak-assignments";

export function getAssignments(): Assignment[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// One active assignment per worker: saving again replaces the old one
export function saveAssignment(a: Assignment) {
  const rest = getAssignments().filter((x) => x.workerId !== a.workerId);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify([...rest, a]));
}

export function getAssignmentForWorker(
  workerId: string
): Assignment | undefined {
  return getAssignments().find((a) => a.workerId === workerId);
}

export function getAssignmentsForAssessor(assessorId: string): Assignment[] {
  return getAssignments().filter((a) => a.assessorId === assessorId);
}