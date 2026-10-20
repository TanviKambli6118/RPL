"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AccountType = "worker" | "assessor";

type WorkerForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
};

type AssessorForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  sector: string;
  jobRole: string;
  experienceYears: string;
  nsqfLevels: string[];
  certificationNumber: string;
  agency: string;
};

const initialWorkerForm: WorkerForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  password: "",
};

const initialAssessorForm: AssessorForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  password: "",
  sector: "",
  jobRole: "",
  experienceYears: "",
  nsqfLevels: [],
  certificationNumber: "",
  agency: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("worker");

  const [workerForm, setWorkerForm] =
    useState<WorkerForm>(initialWorkerForm);

  const [assessorForm, setAssessorForm] =
    useState<AssessorForm>(initialAssessorForm);

  const [error, setError] = useState("");

  function updateWorkerField(
    field: keyof WorkerForm,
    value: string
  ) {
    setWorkerForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAssessorField(
    field: keyof AssessorForm,
    value: string
  ) {
    setAssessorForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleNsqfLevel(level: string) {
    setAssessorForm((current) => {
      const isSelected = current.nsqfLevels.includes(level);

      return {
        ...current,
        nsqfLevels: isSelected
          ? current.nsqfLevels.filter((item) => item !== level)
          : [...current.nsqfLevels, level],
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (accountType === "worker") {
      if (
        !workerForm.name.trim() ||
        !workerForm.email.trim() ||
        !workerForm.phone.trim() ||
        !workerForm.location.trim() ||
        !workerForm.password.trim()
      ) {
        setError("Please fill in all worker registration fields.");
        return;
      }

      const workerProfile = {
        id: `worker-${Date.now()}`,
        name: workerForm.name.trim(),
        email: workerForm.email.trim(),
        phone: workerForm.phone.trim(),
        location: workerForm.location.trim(),
        role: "Electrician",
        trade: "electrician",
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "sahayak-worker-profile",
        JSON.stringify(workerProfile)
      );

      localStorage.setItem(
        "rpl_worker",
        JSON.stringify(workerProfile)
      );

      localStorage.setItem(
        "sahayak-session",
        JSON.stringify({
          role: "worker",
          userId: workerProfile.id,
          email: workerProfile.email,
          name: workerProfile.name,
          loggedInAt: new Date().toISOString(),
        })
      );

      router.push("/register/work-experience");
      return;
    }

    // ----- ASSESSOR REGISTRATION -----
    if (
      !assessorForm.name.trim() ||
      !assessorForm.email.trim() ||
      !assessorForm.phone.trim() ||
      !assessorForm.location.trim() ||
      !assessorForm.password.trim() ||
      !assessorForm.sector.trim() ||
      !assessorForm.jobRole.trim() ||
      !assessorForm.experienceYears.trim() ||
      !assessorForm.certificationNumber.trim() ||
      !assessorForm.agency.trim() ||
      assessorForm.nsqfLevels.length === 0
    ) {
      setError("Please complete all assessor registration fields.");
      return;
    }

    // Clear old assessor/session data before saving new
    localStorage.removeItem("sahayak-assessor-profile");
    localStorage.removeItem("sahayak-session");
    // Optional: also clear worker data if you want a clean state
    // localStorage.removeItem("sahayak-worker-profile");
    // localStorage.removeItem("rpl_worker");

    const assessorProfile = {
      id: `assessor-${Date.now()}`,
      name: assessorForm.name.trim(),
      email: assessorForm.email.trim(),
      phone: assessorForm.phone.trim(),
      location: assessorForm.location.trim(),
      sector: assessorForm.sector.trim(),
      jobRole: assessorForm.jobRole.trim(),
      experienceYears: Number(assessorForm.experienceYears),
      nsqfLevels: assessorForm.nsqfLevels.map(Number),
      certificationNumber: assessorForm.certificationNumber.trim(),
      agency: assessorForm.agency.trim(),
      rating: 0,
      completedAssessments: 0,
      status: "pending-verification",
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "sahayak-assessor-profile",
      JSON.stringify(assessorProfile)
    );

    localStorage.setItem(
      "sahayak-session",
      JSON.stringify({
        role: "assessor",
        userId: assessorProfile.id,
        email: assessorProfile.email,
        name: assessorProfile.name, // name from the form
        loggedInAt: new Date().toISOString(),
      })
    );

    router.push("/assessor");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Nirmit SkillSetu
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Create your account
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Register as a worker to complete your competency assessment, or
            register as an assessor to review assigned workers.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAccountType("worker");
                setError("");
              }}
              className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                accountType === "worker"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Worker registration
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType("assessor");
                setError("");
              }}
              className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                accountType === "assessor"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Assessor registration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            {accountType === "worker" ? (
              <WorkerRegistrationForm
                form={workerForm}
                updateField={updateWorkerField}
              />
            ) : (
              <AssessorRegistrationForm
                form={assessorForm}
                updateField={updateAssessorField}
                toggleNsqfLevel={toggleNsqfLevel}
              />
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white hover:bg-indigo-700"
            >
              {accountType === "worker"
                ? "Continue worker registration"
                : "Create assessor profile"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Login here
          </button>
        </p>
      </div>
    </main>
  );
}

function WorkerRegistrationForm({
  form,
  updateField,
}: {
  form: WorkerForm;
  updateField: (field: keyof WorkerForm, value: string) => void;
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-semibold text-indigo-600">
          Worker account
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Tell us about yourself
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          You will complete your experience, skills, documents, and mapping
          details in the next steps.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          label="Full name"
          name="worker-name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter your full name"
          required
        />

        <InputField
          label="Email address"
          name="worker-email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="worker@example.com"
          required
        />

        <InputField
          label="Phone number"
          name="worker-phone"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="+91 98765 43210"
          required
        />

        <InputField
          label="Location"
          name="worker-location"
          value={form.location}
          onChange={(value) => updateField("location", value)}
          placeholder="Mumbai, Maharashtra"
          required
        />

        <InputField
          label="Password"
          name="worker-password"
          type="password"
          value={form.password}
          onChange={(value) => updateField("password", value)}
          placeholder="Create a password"
          required
        />
      </div>

      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-900">
          What happens next?
        </p>

        <p className="mt-2 text-sm leading-6 text-indigo-800">
          You will complete your self-declaration, work experience, skills,
          documents, NSQF mapping, and assessor allocation.
        </p>
      </div>
    </section>
  );
}

function AssessorRegistrationForm({
  form,
  updateField,
  toggleNsqfLevel,
}: {
  form: AssessorForm;
  updateField: (field: keyof AssessorForm, value: string) => void;
  toggleNsqfLevel: (level: string) => void;
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-semibold text-indigo-600">
          Assessor account
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Create your assessor profile
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Add your sector, experience, qualification levels, and certification
          details.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          label="Full name"
          name="assessor-name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Anita Sharma"
          required
        />

        <InputField
          label="Email address"
          name="assessor-email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="assessor@example.com"
          required
        />

        <InputField
          label="Phone number"
          name="assessor-phone"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="+91 98765 43210"
          required
        />

        <InputField
          label="Location"
          name="assessor-location"
          value={form.location}
          onChange={(value) => updateField("location", value)}
          placeholder="Mumbai, Maharashtra"
          required
        />

        <InputField
          label="Password"
          name="assessor-password"
          type="password"
          value={form.password}
          onChange={(value) => updateField("password", value)}
          placeholder="Create a password"
          required
        />

        <SelectField
          label="Sector"
          name="assessor-sector"
          value={form.sector}
          onChange={(value) => updateField("sector", value)}
          options={[
            "IT-ITeS",
            "Electronics",
            "Healthcare",
            "Construction",
            "Automotive",
            "Logistics",
            "Retail",
            "Apparel",
            "Agriculture",
            "Beauty and Wellness",
          ]}
          placeholder="Select sector"
        />

        <InputField
          label="Primary job role"
          name="assessor-job-role"
          value={form.jobRole}
          onChange={(value) => updateField("jobRole", value)}
          placeholder="Field Technician"
          required
        />

        <InputField
          label="Years of experience"
          name="assessor-experience"
          type="number"
          value={form.experienceYears}
          onChange={(value) => updateField("experienceYears", value)}
          placeholder="8"
          required
        />

        <InputField
          label="Certification number"
          name="assessor-certification"
          value={form.certificationNumber}
          onChange={(value) =>
            updateField("certificationNumber", value)
          }
          placeholder="TOA-XXXX-XXXX"
          required
        />

        <InputField
          label="Assessment agency"
          name="assessor-agency"
          value={form.agency}
          onChange={(value) => updateField("agency", value)}
          placeholder="Enter assessment agency"
          required
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700">
          Qualified NSQF levels
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {["2", "3", "4", "5", "6"].map((level) => {
            const selected = form.nsqfLevels.includes(level);

            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleNsqfLevel(level)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  selected
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                }`}
              >
                NSQF Level {level}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Select every NSQF level you are qualified to assess.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Assessor responsibility
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          AI can organize evidence and suggest competency mappings, but the
          qualified assessor remains responsible for reviewing criteria and
          making the final assessment decision.
        </p>
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        id={name}
        name={name}
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}