import Link from "next/link";

const nextSteps = [
  "Workspaces executivos compartilhados para Alan, Pedro e Lucas.",
  "Módulos de ofertas, operação, delegação, inbox e arquivos com dados centrais.",
  "Bootstrap compartilhado via PostgreSQL, ingestão remota e credenciais geridas por ambiente.",
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-6xl gap-10 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_120px_rgba(15,23,42,0.55)] backdrop-blur xl:grid-cols-[1.2fr_0.8fr] xl:p-12">
        <section className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              RoiMax Enterprise
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white xl:text-6xl">
              Centro executivo para ofertas, operação e delegação.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 xl:text-lg">
              O sistema central do RoiMax Enterprise já parte de uma base separada do agents-lab,
              com estrutura pronta para evoluir em workspaces compartilhados, módulos operacionais
              e integrações remotas entre os três sócios.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Entrar no sistema
            </Link>
            <Link
              href="/app/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
            >
              Ver shell executivo
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Próxima onda
          </p>
          <div className="mt-6 space-y-4">
            {nextSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Etapa {index + 1}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
