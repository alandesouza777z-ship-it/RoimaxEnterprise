import { DelegationStatus, OfferStatus } from "@prisma/client";

import { listRecentArtifactsForWorkspace } from "@/lib/queries/agents-lab-artifacts";
import { listDelegations } from "@/lib/queries/delegations";
import { listOffers } from "@/lib/queries/offers";
import { listOperationBlocks } from "@/lib/queries/operations";

export async function getWorkspaceOverview(workspaceSlug: string) {
  const [offers, delegations, week, artifacts] = await Promise.all([
    listOffers(workspaceSlug),
    listDelegations(workspaceSlug),
    listOperationBlocks(workspaceSlug),
    listRecentArtifactsForWorkspace(workspaceSlug, 4),
  ]);

  const activeOffers = offers.filter((offer) => offer.status === OfferStatus.ACTIVE);
  const openDelegations = delegations.filter((delegation) => delegation.status === DelegationStatus.OPEN);
  const inProgressDelegations = delegations.filter(
    (delegation) => delegation.status === DelegationStatus.IN_PROGRESS,
  );
  const scheduledBlocks = week.reduce((total, day) => total + day.blocks.length, 0);

  return {
    summary: [
      {
        label: "Ofertas ativas",
        value: String(activeOffers.length).padStart(2, "0"),
        detail: "Ofertas em execução dentro deste workspace.",
      },
      {
        label: "Delegações abertas",
        value: String(openDelegations.length).padStart(2, "0"),
        detail: "Demandas aguardando execução ou aceite.",
      },
      {
        label: "Delegações em andamento",
        value: String(inProgressDelegations.length).padStart(2, "0"),
        detail: "Demandas já em progresso na operação.",
      },
      {
        label: "Blocos da semana",
        value: String(scheduledBlocks).padStart(2, "0"),
        detail: "Blocos operacionais planejados no calendário atual.",
      },
    ],
    offers: offers.slice(0, 4),
    delegations: delegations.slice(0, 4),
    week,
    artifacts,
  };
}
