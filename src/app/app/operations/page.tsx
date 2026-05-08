import Link from "next/link";

import { DelegationStatusActions } from "@/app/app/delegations/status-actions";
import { OperationForm } from "@/app/app/operations/operation-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { verifyOperationalSession } from "@/lib/auth/dal";
import { getOperationsOverview } from "@/lib/queries/operations";

function formatDate(value: Date | null) {
  if (!value) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

export default async function OperationsPage() {
  const user = await verifyOperationalSession();
  const { week, approvals, inProgress } = await getOperationsOverview(user.workspaceSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Blocos operacionais"
        description="Agenda executiva persistida por workspace, pronta para evoluir depois para board e drag-and-drop."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Fila de aprovações</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Delegações abertas que ainda aguardam decisão ou aceite operacional.
                </p>
              </div>
              <Link
                href="/app/delegations"
                className="inline-flex rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/30 hover:text-white"
              >
                abrir delegações
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {approvals.length ? (
                approvals.map((delegation) => (
                  <div key={delegation.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">{delegation.title}</p>
                    <p className="mt-2">Responsável: {delegation.assignee.displayName}</p>
                    <p>Oferta: {delegation.offer?.title ?? "Não vinculada"}</p>
                    <p>Prazo: {formatDate(delegation.dueDate)}</p>
                    <DelegationStatusActions delegationId={delegation.id} status={delegation.status} />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                  Nenhuma aprovação pendente neste workspace.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Execuções em andamento</h2>
            <div className="mt-5 space-y-3">
              {inProgress.length ? (
                inProgress.map((delegation) => (
                  <div key={delegation.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">{delegation.title}</p>
                    <p className="mt-2">Responsável: {delegation.assignee.displayName}</p>
                    <p>Oferta: {delegation.offer?.title ?? "Não vinculada"}</p>
                    <p>Prazo: {formatDate(delegation.dueDate)}</p>
                    <DelegationStatusActions delegationId={delegation.id} status={delegation.status} />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                  Nenhuma execução em andamento neste momento.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OperationForm />

          <section className="grid gap-4 xl:grid-cols-5">
            {week.map((day) => (
              <div key={day.value} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{day.label}</p>
                <div className="mt-4 space-y-3">
                  {day.blocks.length ? (
                    day.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm leading-6 text-slate-300"
                      >
                        {block.title}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-3 text-sm text-slate-500">
                      Nenhum bloco neste dia.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
