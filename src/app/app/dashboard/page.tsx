import { PageHeader } from "@/components/app-shell/page-header";
import { SummaryCard } from "@/components/app-shell/summary-card";
import { verifySession } from "@/lib/auth/dal";
import { getDashboardData } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const user = await verifySession();
  const { summary, feed, artifacts } = await getDashboardData(user.workspaceSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Visão executiva consolidada"
        description="Painel inicial do RoiMax Enterprise agora abastecido por ofertas e delegações reais vindas do banco local."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
          <div className="mt-5 space-y-4">
            {feed.map((entry) => (
              <div
                key={entry}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300"
              >
                {entry}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Artefatos recentes</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
            {artifacts.length ? (
              artifacts.map((artifact) => (
                <div key={artifact.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="font-medium text-white">{artifact.title}</p>
                  <p className="text-slate-300">{artifact.offerTitle ?? "Sem offer vinculada"}</p>
                  <p className="text-slate-400">{artifact.artifactType}</p>
                  {artifact.publicUrl ? (
                    <a
                      href={artifact.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-amber-200 underline-offset-4 hover:underline"
                    >
                      abrir artifact remoto
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-slate-400">Nenhum artefato sincronizado para este workspace.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
