"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, TrendingUp } from "lucide-react";
import Logo from "@/components/logo";

type WorkerProfile = {
  id?: string;
  name?: string;
  trade?: string;
  location?: string;
};

type SkillReview = {
  currentLevel: number;
  currentSkills: string[];
  missingSkills: string[];
  nextLevelSkills: string[];
  recommendation: string;
};

const skillMap: Record<
  string,
  Record<3 | 4, { current: string[]; next: string[] }>
> = {
  electrician: {
    3: {
      current: [
        "Domestic wiring",
        "Switchboard installation",
        "Basic fault finding",
        "Electrical safety",
      ],
      next: [
        "Industrial wiring",
        "Motor control circuits",
        "Electrical drawings",
        "Advanced troubleshooting",
      ],
    },
    4: {
      current: [
        "Industrial wiring",
        "Motor control circuits",
        "Electrical drawings",
        "Advanced troubleshooting",
      ],
      next: [
        "PLC basics",
        "Automation systems",
        "Solar installation",
        "Team supervision",
      ],
    },
  },
};

export default function SkillsReviewPage() {
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [review, setReview] = useState<SkillReview | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedWorker = {
      ...readObject("rpl_worker"),
      ...readObject("sahayak-worker-profile"),
    } as WorkerProfile;

    setWorker(storedWorker);

    const trade = (storedWorker.trade || "electrician").toLowerCase();
    const mapped = skillMap[trade] || skillMap.electrician;

    setReview({
      currentLevel: 3,
      currentSkills: mapped[3].current,
      missingSkills: mapped[3].next,
      nextLevelSkills: mapped[4].next,
      recommendation:
        "Complete the missing skills and upload strong practical evidence to become eligible for NSQF Level 4.",
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
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
          <div className="flex items-center gap-3">
            <Brain className="text-[#f26b1d]" size={24} />

            <div>
              <h1 className="text-2xl font-bold text-[#0b2a5b]">
                AI Skill Review
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Based on your trade, experience, and assessment evidence.
              </p>
            </div>
          </div>

          {review && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Current qualification level
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  NSQF Level {review.currentLevel}
                </p>
              </div>

              <SkillList
                title="Your current skills"
                skills={review.currentSkills}
                icon={<CheckCircle2 size={16} className="text-emerald-600" />}
              />

              <SkillList
                title="Skills to learn for Level 4"
                skills={review.missingSkills}
                icon={<TrendingUp size={16} className="text-amber-600" />}
              />

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  AI recommendation
                </p>

                <p className="mt-1 text-sm text-indigo-800">
                  {review.recommendation}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SkillList({
  title,
  skills,
  icon,
}: {
  title: string;
  skills: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>

      <ul className="mt-3 space-y-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            {icon}
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckCircle2({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
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