/**
 * File: app/login/page.tsx
 * Author: Tanvi (Team Nirmit)
 * Date: 05-10-2026
 * Description: Login page. Worker logs in with the mobile number used at registration.
 *              Works offline by checking the details saved on the device.
 */
"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";

const input =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0b2a5b] focus:ring-1 focus:ring-[#0b2a5b]";
const label = "mb-1 block text-xs font-medium text-gray-700";

export default function Login() {
  const router = useRouter();
  const [mobile, setMobile] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // read the worker saved on this device during registration
    const saved = localStorage.getItem("rpl_worker");
    if (!saved) {
      setError("No account found on this device. Please register first.");
      return;
    }

    const worker = JSON.parse(saved);
    if (worker.mobile !== mobile) {
      setError("This mobile number is not registered. Please check it or register.");
      return;
    }

    // mark the worker as logged in
    localStorage.setItem("rpl_session", JSON.stringify({ mobile, loggedInAt: Date.now() }));
    router.push("/dashboard"); // worker dashboard (we build later)
  };

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white shadow">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <Logo />
          <p className="text-[11px] text-gray-500 sm:text-xs">
            New here?{" "}
            <Link href="/register" className="font-semibold text-[#0b2a5b]">
              Register
            </Link>
          </p>
        </header>

        <form onSubmit={submit} className="p-4 sm:p-8">
          <h2 className="text-lg font-bold text-[#0b2a5b]">Welcome back</h2>
          <p className="mt-1 text-xs text-gray-500">Login with your mobile number to continue.</p>

          <div className="mt-6">
            <label className={label}>Mobile Number *</label>
            <div className="flex gap-2">
              <span className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600">+91</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                placeholder="Enter mobile number"
                className={input}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-[#f26b1d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d95a10]"
          >
            Login
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#0b2a5b]">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}