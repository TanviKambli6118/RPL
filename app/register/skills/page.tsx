"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/logo";
import Stepper from "@/components/Stepper";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceInput from "@/components/VoiceInput";
import { useLanguage } from "@/hooks/useLanguage";

type SkillsForm = {
  trade: string;
  primarySkill: string;
  experienceLevel: string;
  description: string;
};

const emptyForm: SkillsForm = {
  trade: "",
  primarySkill: "",
  experienceLevel: "",
  description: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

const skillOptions = [
  "Electrical wiring",
  "Electrical installation",
  "Electrical maintenance",
  "Plumbing repair",
  "Welding",
  "Carpentry",
  "Masonry",
  "Painting",
  "Machine operation",
];

export default function SkillsPage() {
  const router = useRouter();
  const { language, text } = useLanguage();

  const [form, setForm] = useState<SkillsForm>(emptyForm);

  useEffect(() => {
    const savedSkills = localStorage.getItem("rpl_skills");

    if (!savedSkills) {
      return;
    }

    try {
      const saved = JSON.parse(savedSkills) as Partial<SkillsForm>;

      setForm({
        trade: saved.trade ?? "",
        primarySkill: saved.primarySkill ?? "",
        experienceLevel: saved.experienceLevel ?? "",
        description: saved.description ?? "",
      });
    } catch {
      localStorage.removeItem("rpl_skills");
      setForm(emptyForm);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let worker: Record<string, unknown> = {};

    try {
      const savedWorker = localStorage.getItem("rpl_worker");
      worker = savedWorker ? JSON.parse(savedWorker) : {};
    } catch {
      worker = {};
    }

    localStorage.setItem(
      "rpl_worker",
      JSON.stringify({
        ...worker,
        trade: form.trade,
      })
    );

    localStorage.setItem("rpl_skills", JSON.stringify(form));
    router.push("/register/documents");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <Logo />
          <LanguageSelector />
        </header>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <Stepper current={3} />

          <h1 className="mb-2 text-lg font-bold text-[#0f4c5c]">
            {text("skillsTrade")}
          </h1>

          <p className="mb-6 text-sm text-slate-500">
            Select your trade and tell us about your skills.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="trade" className={labelClass}>
                {text("trade")} *
              </label>

              <select
                id="trade"
                value={form.trade}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    trade: event.target.value,
                  }))
                }
                required
                className={inputClass}
              >
                <option value="">Select your trade</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Welder">Welder</option>
                <option value="Fitter">Fitter</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Mason">Mason</option>
              </select>
            </div>

            <div>
              <label htmlFor="primarySkill" className={labelClass}>
                {text("primarySkill")} *
              </label>

              <select
                id="primarySkill"
                value={form.primarySkill}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    primarySkill: event.target.value,
                  }))
                }
                required
                className={inputClass}
              >
                <option value="">Select your main skill</option>

                {skillOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="experienceLevel" className={labelClass}>
                {text("experienceLevel")} *
              </label>

              <select
                id="experienceLevel"
                value={form.experienceLevel}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    experienceLevel: event.target.value,
                  }))
                }
                required
                className={inputClass}
              >
                <option value="">Select experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="description" className={labelClass}>
                  {text("skillDescription")}
                </label>

                <VoiceInput
                  language={language}
                  onResult={(value) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      description: previousForm.description
                        ? `${previousForm.description} ${value}`
                        : value,
                    }))
                  }
                />
              </div>

              <textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    description: event.target.value,
                  }))
                }
                rows={5}
                placeholder="Describe your skills..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/register/work-experience"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              ← {text("back")}
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-[#e8871e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d4790f]"
            >
              {text("next")} →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}