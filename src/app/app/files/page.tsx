import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { verifySession } from "@/lib/auth/dal";
import { getArtifactNoticeForWorkspace, listArtifactsForWorkspace } from "@/lib/queries/agents-lab-artifacts";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

type FilesPageProps = {
  searchParams: Promise<{ artifact?: string }>;
};

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const user = await verifySession();
  const { artifact: artifactId } = await searchParams;
  const artifacts = await listArtifactsForWorkspace(user.workspaceSlug);
  const currentArtifact = artifacts.find((artifact) => artifact.id === artifactId) ?? artifacts[0] ?? null;
  const artifactNotice = getArtifactNoticeForWorkspace(artifacts);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arquivos"
        title="Handoff de materiais"
        description="Integração inicial com outputs do agents-lab, vinculando artefatos externos às offers do workspace atual."
      />

      <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-400">
          Artifacts lidos da persistência central do RoiMax Enterprise e da ingestão remota compartilhada.
        </div>

        {artifactNotice ? (
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {artifactNotice}
          </div>
        ) : null}

        {currentArtifact ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2 text-sm text-slate-300">
                <p className="text-lg font-semibold text-white">{currentArtifact.title}</p>
                <p>Offer: {currentArtifact.offerTitle ?? "Sem offer vinculada"}</p>
                <p>Categoria: {currentArtifact.artifactType}</p>
                <p>Tipo: {currentArtifact.fileType}</p>
                <p>Origem: {currentArtifact.sourceSystem} · {currentArtifact.sourcePath}</p>
                <p>Atualizado: {formatDate(currentArtifact.updatedAt)}</p>
                {currentArtifact.preview ? <p className="leading-7 text-slate-400">{currentArtifact.preview}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/app/inbox?artifact=${currentArtifact.id}`}
                  className="inline-flex rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/30 hover:text-white"
                >
                  ver no inbox
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
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {artifacts.length ? (
            artifacts.map((artifact) => {
              const isCurrent = artifact.id === currentArtifact?.id;

              return (
                <article
                  key={artifact.id}
                  className={`rounded-3xl border p-5 transition ${
                    isCurrent
                      ? "border-amber-300/30 bg-amber-300/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <p className="text-base font-semibold text-white">{artifact.title}</p>
                  <p className="mt-3 text-sm text-slate-300">Offer: {artifact.offerTitle ?? "Sem offer vinculada"}</p>
                  <p className="mt-1 text-sm text-slate-300">Categoria: {artifact.artifactType}</p>
                  <p className="mt-1 text-sm text-slate-300">Tipo: {artifact.fileType}</p>
                  <p className="mt-1 text-sm text-slate-300">Origem: {artifact.sourceSystem} · {artifact.sourcePath}</p>
                  <p className="mt-1 text-sm text-slate-300">Atualizado: {formatDate(artifact.updatedAt)}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/app/files?artifact=${artifact.id}`}
                    className="inline-flex text-sm text-slate-200 underline-offset-4 hover:underline"
                  >
                    ver detalhe
                  </Link>
                  <Link
                    href={`/app/inbox?artifact=${artifact.id}`}
                    className="inline-flex text-sm text-slate-200 underline-offset-4 hover:underline"
                  >
                    abrir no inbox
                  </Link>
                  {artifact.publicUrl ? (
                    <a
                      href={artifact.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm text-amber-200 underline-offset-4 hover:underline"
                    >
                      abrir artifact remoto
                    </a>
                  ) : null}
                  </div>
                  {artifact.preview ? (
                    <p className="mt-4 text-sm leading-7 text-slate-400">{artifact.preview}</p>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400 lg:col-span-3">
              Nenhum output do agents-lab foi vinculado às offers deste workspace ainda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
