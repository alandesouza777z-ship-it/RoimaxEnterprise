type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.25)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </article>
  );
}
