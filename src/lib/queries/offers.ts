import { prisma } from "@/lib/prisma";

export async function listOffers(workspaceSlug: string) {
  return prisma.offer.findMany({
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
