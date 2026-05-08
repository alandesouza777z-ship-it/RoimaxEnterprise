import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { SummaryCard } from "@/components/app-shell/summary-card";
import { WORKSPACES } from "@/components/app-shell/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getWorkspaceOverview } from "@/lib/queries/workspace";

type WorkspacePageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: Date | null) {
  if (!value) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const user = await verifySession();
  const { slug } = await params;

  if (slug !== user.workspaceSlug) {
    redirect(`/app/workspace/${user.workspaceSlug}`);
  }

  const workspace = WORKSPACES.find((item) => item.slug === slug);

  if (!workspace) {
    notFound();
  }

  const { summary, offers, delegations, week, artifacts } = await getWorkspaceOverview(slug);
  const daysWithBlocks = week.filter((day) => day.blocks.length);
  const firstArtifact = artifacts[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title={workspace.name}
        description={`${workspace.role}. ${workspace.focus}`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/app/offers"
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10"
        >
          <p className="font-semibold text-white">Ir para ofertas</p>
          <p className="mt-2">{offers.length} ofertas com contexto real deste workspace.</p>
        </Link>
        <Link
          href="/app/delegations"
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10"
        >
          <p className="font-semibold text-white">Ir para delegações</p>
          <p className="mt-2">{delegations.length} delegações conectadas à operação atual.</p>
        </Link>
        <Link
          href="/app/operations"
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10"
        >
          <p className="font-semibold text-white">Ir para operação</p>
          <p className="mt-2">{daysWithBlocks.length} dias com blocos operacionais planejados.</p>
        </Link>
        <Link
          href={firstArtifact ? `/app/inbox?artifact=${firstArtifact.id}` : "/app/inbox"}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10"
        >
          <p className="font-semibold text-white">Abrir inbox</p>
          <p className="mt-2">Handoffs e mensagens reais sincronizados do agents-lab.</p>
        </Link>
        <Link
          href={firstArtifact ? `/app/files?artifact=${firstArtifact.id}` : "/app/files"}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10"
        >
          <p className="font-semibold text-white">Abrir arquivos</p>
          <p className="mt-2">Artifacts recentes com navegação direta por item.</p>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-lg font-semibold text-white">Ofertas prioritárias</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {offers.length ? (
                offers.map((offer) => (
                  <article key={offer.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-base font-semibold text-white">{offer.title}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      <p>Status: {offer.status}</p>
                      <p>Prioridade: {offer.priority}</p>
                      <p>Responsável: {offer.owner.displayName}</p>
                      <p>Prazo: {formatDate(offer.dueDate)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400 lg:col-span-2">
                  Nenhuma oferta cadastrada neste workspace ainda.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-lg font-semibold text-white">Delegações recentes</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {delegations.length ? (
                delegations.map((delegation) => (
                  <article key={delegation.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-base font-semibold text-white">{delegation.title}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      <p>Status: {delegation.status}</p>
                      <p>Prioridade: {delegation.priority}</p>
                      <p>Responsável: {delegation.assignee.displayName}</p>
                      <p>Oferta: {delegation.offer?.title ?? "Não vinculada"}</p>
                      <p>Prazo: {formatDate(delegation.dueDate)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400 lg:col-span-2">
                  Nenhuma delegação registrada neste workspace.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Agenda operacional</h2>
            <div className="mt-5 space-y-3">
              {daysWithBlocks.length ? (
                daysWithBlocks.map((day) => (
                  <div key={day.value} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm font-semibold text-white">{day.label}</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      {day.blocks.map((block) => (
                        <p key={block.id}>{block.title}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                  Nenhum bloco operacional planejado ainda.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Artifacts recentes</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              {artifacts.length ? (
                artifacts.map((artifact) => (
                  <div key={artifact.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="font-medium text-white">{artifact.title}</p>
                    <p className="mt-1">{artifact.artifactType}</p>
                    <p className="mt-1 text-slate-400">{artifact.offerTitle ?? "Sem offer vinculada"}</p>
                    {artifact.publicUrl ? (
                      <a
                        href={artifact.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-amber-200 underline-offset-4 hover:underline"
                      >
                        abrir artifact remoto
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                  Nenhum artifact recente para este workspace.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
