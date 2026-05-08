import { UserRole } from "@prisma/client";

import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export { isAdminRole };

export async function listWorkspaceUsers(workspaceSlug: string) {
  return prisma.user.findMany({
    where: {
      workspaceSlug,
    },
    orderBy: {
      displayName: "asc",
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      disabledAt: true,
      createdAt: true,
      _count: {
        select: {
          sessions: true,
          ownedOffers: true,
          assignedDelegations: true,
          createdDelegations: true,
        },
      },
    },
  });
}

export async function getWorkspaceUserById(userId: string, workspaceSlug: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      workspaceSlug,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      workspaceSlug: true,
      disabledAt: true,
    },
  });
}

export async function usernameExistsInWorkspace(username: string, workspaceSlug: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
      workspaceSlug,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
}

export function getRoleOptions() {
  return Object.values(UserRole);
}
