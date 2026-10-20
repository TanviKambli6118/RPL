type LogoProps = {
  light?: boolean;
};

export default function Logo({ light = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-[#f26b1d] font-bold text-white">R</div>
      <span className={`text-xl font-bold ${light ? "text-white" : "text-[#0b2a5b]"}`}>RPL</span>
    </div>
  );
}