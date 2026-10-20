"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AssessorProfile = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  sector?: string;
  jobRole?: string;
  experienceYears?: number;
  nsqfLevels?: number[];
  certificationNumber?: string;
  agency?: string;
  rating?: number;
  completedAssessments?: number;
  status?: string;
};

const emptyProfile: AssessorProfile = {};

export default function ProfilePage() {
  const [assessor, setAssessor] =
    useState<AssessorProfile>(emptyProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "sahayak-assessor-profile"
    );

    if (savedProfile) {
      try {
        setAssessor(JSON.parse(savedProfile) as AssessorProfile);
      } catch {
        setAssessor({});
      }
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (!assessor.name) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            No assessor profile found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Register as an assessor first. The profile will appear here after
            registration.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Go to registration
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/assessor" className="text-sm font-medium text-indigo-600">
          ← Back to assessor dashboard
        </Link>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {getInitials(assessor.name)}
            </div>

            <div>
              <p className="text-sm font-medium text-emerald-600">
                Assessor profile
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {assessor.name}
              </h1>
              <p className="mt-1 text-slate-600">
                {assessor.jobRole || "Assessor"} ·{" "}
                {assessor.location || "Location not provided"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ProfileItem
              label="Email"
              value={assessor.email || "Not provided"}
            />
            <ProfileItem
              label="Phone"
              value={assessor.phone || "Not provided"}
            />
            <ProfileItem
              label="Sector"
              value={assessor.sector || "Not provided"}
            />
            <ProfileItem
              label="Location"
              value={assessor.location || "Not provided"}
            />
            <ProfileItem
              label="Experience"
              value={
                typeof assessor.experienceYears === "number"
                  ? `${assessor.experienceYears} years`
                  : "Not provided"
              }
            />
            <ProfileItem
              label="Assessment agency"
              value={assessor.agency || "Not provided"}
            />
            <ProfileItem
              label="Certification number"
              value={assessor.certificationNumber || "Not provided"}
            />
            <ProfileItem
              label="Status"
              value={formatStatus(assessor.status || "registered")}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-slate-900">
              Qualified NSQF levels
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {assessor.nsqfLevels?.length ? (
                assessor.nsqfLevels.map((level) => (
                  <span
                    key={level}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700"
                  >
                    Level {level}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No levels saved.
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "A";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(status: string) {
  return status
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}