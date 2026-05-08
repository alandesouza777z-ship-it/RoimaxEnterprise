import { DelegationStatus, OfferStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { listRecentArtifactsForWorkspace } from "@/lib/queries/agents-lab-artifacts";

export async function getDashboardData(workspaceSlug: string) {
  const [activeOffers, draftOffers, openDelegations, inProgressDelegations, recentOffers, recentDelegations, recentArtifacts] =
    await Promise.all([
      prisma.offer.count({
        where: {
          status: OfferStatus.ACTIVE,
          owner: {
            workspaceSlug,
          },
        },
      }),
      prisma.offer.count({
        where: {
          status: OfferStatus.DRAFT,
          owner: {
            workspaceSlug,
          },
        },
      }),
      prisma.delegation.count({
        where: {
          status: DelegationStatus.OPEN,
          OR: [
            {
              assignee: {
                workspaceSlug,
              },
            },
            {
              createdBy: {
                workspaceSlug,
              },
            },
            {
              offer: {
                owner: {
                  workspaceSlug,
                },
              },
            },
          ],
        },
      }),
      prisma.delegation.count({
        where: {
          status: DelegationStatus.IN_PROGRESS,
          OR: [
            {
              assignee: {
                workspaceSlug,
              },
            },
            {
              createdBy: {
                workspaceSlug,
              },
            },
            {
              offer: {
                owner: {
                  workspaceSlug,
                },
              },
            },
          ],
        },
      }),
      prisma.offer.findMany({
        where: {
          owner: {
            workspaceSlug,
          },
        },
        include: {
          owner: {
            select: {
              displayName: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 3,
      }),
      prisma.delegation.findMany({
        where: {
          OR: [
            {
              assignee: {
                workspaceSlug,
              },
            },
            {
              createdBy: {
                workspaceSlug,
              },
            },
            {
              offer: {
                owner: {
                  workspaceSlug,
                },
              },
            },
          ],
        },
        include: {
          assignee: {
            select: {
              displayName: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 3,
      }),
      listRecentArtifactsForWorkspace(workspaceSlug),
    ]);

  return {
    summary: [
      {
        label: "Ofertas ativas",
        value: String(activeOffers).padStart(2, "0"),
        detail: "Quantidade real de ofertas em execução dentro da base local.",
      },
      {
        label: "Ofertas draft",
        value: String(draftOffers).padStart(2, "0"),
        detail: "Estruturas ainda em fase de preparação estratégica ou criativa.",
      },
      {
        label: "Delegações abertas",
        value: String(openDelegations).padStart(2, "0"),
        detail: "Demandas que ainda aguardam execução ou aceite operacional.",
      },
      {
        label: "Delegações em andamento",
        value: String(inProgressDelegations).padStart(2, "0"),
        detail: "Demandas já assumidas e em progresso na operação executiva.",
      },
    ],
    feed: [
      ...recentOffers.map((offer) => `${offer.owner.displayName} atualizou a oferta ${offer.title}.`),
      ...recentDelegations.map(
        (delegation) => `${delegation.assignee.displayName} está vinculado à delegação ${delegation.title}.`,
      ),
      ...recentArtifacts.map((artifact) => `Novo handoff externo: ${artifact.title}.`),
    ].slice(0, 6),
    artifacts: recentArtifacts,
  };
}
