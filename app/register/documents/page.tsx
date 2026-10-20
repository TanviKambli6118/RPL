"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/logo";
import Stepper from "@/components/Stepper";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceInput from "@/components/VoiceInput";
import { useLanguage } from "@/hooks/useLanguage";

type DocumentsForm = {
  aadhaarLastFour: string;
  documentType: string;
  documentNumber: string;
  consent: boolean;
};

const emptyForm: DocumentsForm = {
  aadhaarLastFour: "",
  documentType: "",
  documentNumber: "",
  consent: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

export default function DocumentsPage() {
  const router = useRouter();
  const { language, text } = useLanguage();

  const [form, setForm] = useState<DocumentsForm>(emptyForm);

  useEffect(() => {
    const savedDocuments = localStorage.getItem("rpl_documents");

    if (!savedDocuments) {
      return;
    }

    try {
      const saved = JSON.parse(savedDocuments) as Partial<DocumentsForm>;

      setForm({
        aadhaarLastFour: saved.aadhaarLastFour ?? "",
        documentType: saved.documentType ?? "",
        documentNumber: saved.documentNumber ?? "",
        consent: saved.consent ?? false,
      });
    } catch {
      localStorage.removeItem("rpl_documents");
      setForm(emptyForm);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem("rpl_documents", JSON.stringify(form));
    router.push("/register/mapping");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
        <header className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <Logo />
          <LanguageSelector />
        </header>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <Stepper current={4} />

          <h1 className="mb-2 text-lg font-bold text-[#0f4c5c]">
            {text("documents")}
          </h1>

          <p className="mb-6 text-sm text-slate-500">
            Add basic document information for verification.
          </p>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="aadhaarLastFour" className={labelClass}>
                  {text("aadhaarLastFour")} *
                </label>

                <VoiceInput
                  language={language}
                  onResult={(value) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      aadhaarLastFour: value
                        .replace(/\D/g, "")
                        .slice(-4),
                    }))
                  }
                />
              </div>

              <input
                id="aadhaarLastFour"
                value={form.aadhaarLastFour}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    aadhaarLastFour: event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4),
                  }))
                }
                required
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="Example: 1234"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="documentType" className={labelClass}>
                {text("documentType")} *
              </label>

              <select
                id="documentType"
                value={form.documentType}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    documentType: event.target.value,
                  }))
                }
                required
                className={inputClass}
              >
                <option value="">Select document</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving Licence">Driving Licence</option>
                <option value="PAN Card">PAN Card</option>
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="documentNumber" className={labelClass}>
                  {text("documentNumber")} *
                </label>

                <VoiceInput
                  language={language}
                  onResult={(value) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      documentNumber: value,
                    }))
                  }
                />
              </div>

              <input
                id="documentNumber"
                value={form.documentNumber}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    documentNumber: event.target.value,
                  }))
                }
                required
                placeholder="Enter document number"
                className={inputClass}
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    consent: event.target.checked,
                  }))
                }
                required
                className="mt-1"
              />

              <span>
                I confirm that the information provided is correct.
              </span>
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/register/skills"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              ← {text("back")}
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-[#e8871e] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-colors hover:bg-[#d4790f] focus:outline-none focus:ring-2 focus:ring-[#e8871e]/40"
            >
              {text("next")} →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}