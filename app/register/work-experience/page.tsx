"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/logo";
import Stepper from "@/components/Stepper";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceInput from "@/components/VoiceInput";
import { useLanguage } from "@/hooks/useLanguage";

type ExperienceForm = {
  yearsOfExperience: string;
  currentWorkplace: string;
  workDescription: string;
};

const emptyForm: ExperienceForm = {
  yearsOfExperience: "",
  currentWorkplace: "",
  workDescription: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

export default function WorkExperiencePage() {
  const router = useRouter();
  const { language, text } = useLanguage();

  const [form, setForm] = useState<ExperienceForm>(emptyForm);

  useEffect(() => {
    const savedExperience = localStorage.getItem("rpl_experience");

    if (!savedExperience) {
      return;
    }

    try {
      const saved = JSON.parse(savedExperience) as Partial<ExperienceForm>;

      setForm({
        yearsOfExperience: saved.yearsOfExperience ?? "",
        currentWorkplace: saved.currentWorkplace ?? "",
        workDescription: saved.workDescription ?? "",
      });
    } catch {
      localStorage.removeItem("rpl_experience");
      setForm(emptyForm);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem("rpl_experience", JSON.stringify(form));
    router.push("/register/skills");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <Logo />
          <LanguageSelector />
        </header>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <Stepper current={2} />

          <h1 className="mb-2 text-lg font-bold text-[#0f4c5c]">
            {text("workExperience")}
          </h1>

          <p className="mb-6 text-sm text-slate-500">
            Add details about your previous work.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="yearsOfExperience" className={labelClass}>
                {text("yearsExperience")} *
              </label>

              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="60"
                value={form.yearsOfExperience}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    yearsOfExperience: event.target.value,
                  }))
                }
                required
                placeholder="Example: 5"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="currentWorkplace" className={labelClass}>
                {text("workplace")} *
              </label>

              <input
                id="currentWorkplace"
                value={form.currentWorkplace}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    currentWorkplace: event.target.value,
                  }))
                }
                required
                placeholder="Example: ABC Electrical Services"
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="workDescription" className={labelClass}>
                  {text("workDescription")} *
                </label>

                <VoiceInput
                  language={language}
                  onResult={(value) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      workDescription: previousForm.workDescription
                        ? `${previousForm.workDescription} ${value}`
                        : value,
                    }))
                  }
                />
              </div>

              <textarea
                id="workDescription"
                value={form.workDescription}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    workDescription: event.target.value,
                  }))
                }
                required
                rows={5}
                placeholder="Describe the type of work you have done..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/register"
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