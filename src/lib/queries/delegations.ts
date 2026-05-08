import { prisma } from "@/lib/prisma";

export async function listDelegations(workspaceSlug: string) {
  return prisma.delegation.findMany({
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
      offer: {
        select: {
          title: true,
        },
      },
    },
    orderBy: [
      {
        dueDate: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });
}
