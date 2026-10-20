/**
 * File: lib/registerFlow.ts
 * Author: Tanvi (Team Nirmit)
 * Date: 06-10-2026
 * Description: Connects the 4 registration pages. Keeps the order of the
 *              steps in one place, and tells each page where Next and Back go.
 */
export type FlowStep = { label: string; href: string };

export const REGISTER_STEPS: FlowStep[] = [
  { label: "Basic Details", href: "/register" },
  { label: "Work Experience", href: "/register/work-experience" },
  { label: "Skills & Trade", href: "/register/skills" },
  { label: "Documents", href: "/register/documents" },
];

// shown after the last step, then the worker goes to the dashboard
export const RESULT_HREF = "/register/mapping";

// step number (1 to 4) of a page. Pages after the last step give 5 (all done).
export function stepNumber(path: string): number {
  const i = REGISTER_STEPS.findIndex((s) => s.href === path);
  return i === -1 ? REGISTER_STEPS.length + 1 : i + 1;
}

export function nextHref(path: string): string {
  const i = REGISTER_STEPS.findIndex((s) => s.href === path);
  if (i === -1 || i === REGISTER_STEPS.length - 1) return RESULT_HREF;
  return REGISTER_STEPS[i + 1].href;
}

export function prevHref(path: string): string {
  const i = REGISTER_STEPS.findIndex((s) => s.href === path);
  if (i <= 0) return "/";
  return REGISTER_STEPS[i - 1].href;
}