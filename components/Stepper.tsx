type StepperProps = {
  current: number;
};

const steps = [
  "Basic Details",
  "Work Experience",
  "Skills & Trade",
  "Documents",
];

export default function Stepper({ current }: StepperProps) {
  return (
    <div className="mb-8 grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= current;

        return (
          <div key={step} className="text-center">
            <div
              className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                isActive
                  ? "bg-[#0f4c5c] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {stepNumber}
            </div>

            <p
              className={`mt-1 text-[10px] sm:text-xs ${
                isActive ? "font-semibold text-[#0f4c5c]" : "text-slate-400"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}