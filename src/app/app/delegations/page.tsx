import { DelegationForm } from "@/app/app/delegations/delegation-form";
import { DelegationStatusActions } from "@/app/app/delegations/status-actions";
import { PageHeader } from "@/components/app-shell/page-header";
import { verifyOperationalSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { listDelegations } from "@/lib/queries/delegations";

function formatDate(value: Date | null) {
  if (!value) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

export default async function DelegationsPage() {
  const user = await verifyOperationalSession();

  const [delegations, users, offers] = await Promise.all([
    listDelegations(user.workspaceSlug),
    prisma.user.findMany({
      where: {
        workspaceSlug: user.workspaceSlug,
      },
      select: {
        id: true,
        displayName: true,
      },
      orderBy: {
        displayName: "asc",
      },
    }),
    prisma.offer.findMany({
      where: {
        owner: {
          workspaceSlug: user.workspaceSlug,
        },
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Delegação"
        title="Distribuição da operação"
        description="Demandas, responsáveis e vínculos operacionais agora conectados ao banco local da aplicação."
      />

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Status</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Prioridade</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Responsável</span>
          </div>
        </div>

        <div className="mt-6">
          <DelegationForm
            assignees={users.map((user) => ({ id: user.id, label: user.displayName }))}
            offers={offers.map((offer) => ({ id: offer.id, label: offer.title }))}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {delegations.map((delegation) => (
            <article key={delegation.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-semibold text-white">{delegation.title}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Status: {delegation.status}</p>
                <p>Responsável: {delegation.assignee.displayName}</p>
                <p>Prioridade: {delegation.priority}</p>
                <p>Prazo: {formatDate(delegation.dueDate)}</p>
                <p>Oferta: {delegation.offer?.title ?? "Não vinculada"}</p>
              </div>
              <DelegationStatusActions delegationId={delegation.id} status={delegation.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
