type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur">
      {eyebrow ? (
        <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </div>
  );
}
