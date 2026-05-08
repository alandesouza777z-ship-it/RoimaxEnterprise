import { OfferForm } from "@/app/app/offers/offer-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { verifyOperationalSession } from "@/lib/auth/dal";
import { listOffers } from "@/lib/queries/offers";

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

export default async function OffersPage() {
  const user = await verifyOperationalSession();
  const offers = await listOffers(user.workspaceSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ofertas"
        title="Central de ofertas"
        description="Visão estrutural das ofertas ativas e futuras, agora alimentada por dados reais do banco local do RoiMax Enterprise."
      />

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Status</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Prioridade</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Responsável</span>
          </div>
        </div>

        <div className="mt-6">
          <OfferForm />
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40">
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="px-4 py-4">{offer.title}</td>
                  <td className="px-4 py-4">{offer.status}</td>
                  <td className="px-4 py-4">{offer.owner.displayName}</td>
                  <td className="px-4 py-4">{offer.priority}</td>
                  <td className="px-4 py-4">{formatDate(offer.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
