import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { verifySession } from "@/lib/auth/dal";
import { getArtifactNoticeForWorkspace, listArtifactsForWorkspace } from "@/lib/queries/agents-lab-artifacts";

type InboxPageProps = {
  searchParams: Promise<{ artifact?: string }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const user = await verifySession();
  const { artifact: artifactId } = await searchParams;
  const artifacts = await listArtifactsForWorkspace(user.workspaceSlug);
  const currentArtifact = artifacts.find((artifact) => artifact.id === artifactId) ?? artifacts[0] ?? null;
  const artifactNotice = getArtifactNoticeForWorkspace(artifacts);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Mensagens e handoffs"
        description="Handoffs reais do agents-lab sincronizados para o workspace atual."
      />

      {artifactNotice ? (
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {artifactNotice}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="space-y-3">
            {artifacts.length ? (
              artifacts.map((artifact) => {
                const isCurrent = artifact.id === currentArtifact?.id;

                return (
                  <Link
                    key={artifact.id}
                    href={`/app/inbox?artifact=${artifact.id}`}
                    className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                      isCurrent
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                        : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-white/20 hover:bg-slate-950"
                    }`}
                  >
                    <p className="font-medium text-white">{artifact.title}</p>
                    <p className="mt-1 text-slate-400">{artifact.offerTitle ?? "Sem offer vinculada"}</p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-500">
                Nenhum handoff externo sincronizado ainda.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          {currentArtifact ? (
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p className="text-base font-semibold text-white">{currentArtifact.title}</p>
              <p>Offer: {currentArtifact.offerTitle ?? "Sem offer vinculada"}</p>
              <p>Categoria: {currentArtifact.artifactType}</p>
              <p>Origem: {currentArtifact.sourceSystem} · {currentArtifact.sourcePath}</p>
              {currentArtifact.publicUrl ? (
                <a
                  href={currentArtifact.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-amber-200 underline-offset-4 hover:underline"
                >
                  abrir artifact remoto
                </a>
              ) : null}
              {currentArtifact.preview ? <p>{currentArtifact.preview}</p> : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/app/files?artifact=${currentArtifact.id}`}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/30 hover:text-white"
                >
                  ver no files
                </Link>
                {currentArtifact.publicUrl ? (
                  <a
                    href={currentArtifact.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/15"
                  >
                    abrir remoto
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Nenhum detalhe disponível.</div>
          )}

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-500">
            próximos handoffs do agents-lab aparecerão aqui
          </div>
        </div>
      </section>
    </div>
  );
}
