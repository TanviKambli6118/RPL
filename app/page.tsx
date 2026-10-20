import Link from "next/link";
import { Cpu, FileCheck2, Scale, type LucideIcon } from "lucide-react";
import Logo from "@/components/logo";

type Feature = {
  icon: LucideIcon;
  text: string;
};

const features: Feature[] = [
  { icon: Cpu, text: "AI-Powered Assessment" },
  { icon: FileCheck2, text: "NSQF Aligned Qualification Packs" },
  { icon: Scale, text: "Fair & Consistent Scoring" },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <section
        className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-between overflow-hidden rounded-2xl bg-[#0b2a5b] bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/worker.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2a5b] via-[#0b2a5b]/80 to-transparent" />

        <div className="relative z-10 p-5 sm:p-10">
          <Logo light />

          <p className="mt-1 text-[11px] text-white/70">
            Skill Today | Certified Tomorrow
          </p>

          <div className="mt-16 max-w-md sm:mt-24">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              Get Recognised <br /> for Your Skills
            </h1>

            <p className="mt-4 text-sm text-white/80 sm:text-base">
              RPL helps you get certified for the skills you already have
              through work experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-md bg-[#f26b1d] px-6 py-2.5 text-sm font-semibold hover:bg-[#d95a10]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-md border border-white/70 px-6 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-4 border-t border-white/20 bg-[#0b2a5b]/90 p-5 sm:grid-cols-3 sm:p-6">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 text-xs sm:text-sm"
            >
              <Icon size={22} className="shrink-0 text-white/80" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                Assessment partner portal
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Are you a certified assessor?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Login or register separately to manage assigned workers,
                review evidence, score field-wise criteria, and complete
                assessor sign-off.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/login?role=assessor"
                className="rounded-lg bg-[#0b2a5b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123c7a]"
              >
                Assessor login
              </Link>

              <Link
                href="/register?role=assessor"
                className="rounded-lg border border-[#0b2a5b] px-5 py-3 text-sm font-semibold text-[#0b2a5b] hover:bg-slate-50"
              >
                Assessor registration
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}