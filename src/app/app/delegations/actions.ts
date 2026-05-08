"use server";

import { DelegationPriority, DelegationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { verifyOperationalSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

type CreateDelegationState = {
  error: string;
};

const STATUS_TRANSITIONS: Record<DelegationStatus, DelegationStatus[]> = {
  OPEN: [DelegationStatus.IN_PROGRESS, DelegationStatus.DONE],
  IN_PROGRESS: [DelegationStatus.DONE],
  DONE: [],
  CANCELLED: [],
};

function isWorkspaceDelegationWhere(workspaceSlug: string) {
  return {
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
  };
}

function revalidateDelegationSurfaces(workspaceSlug: string) {
  revalidatePath("/app/delegations");
  revalidatePath("/app/operations");
  revalidatePath("/app/dashboard");
  revalidatePath(`/app/workspace/${workspaceSlug}`);
}

function canTransitionDelegationStatus(currentStatus: DelegationStatus, nextStatus: DelegationStatus) {
  return STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export async function updateDelegationStatus(delegationId: string, nextStatus: DelegationStatus) {
  const user = await verifyOperationalSession();

  if (!Object.values(DelegationStatus).includes(nextStatus)) {
    return;
  }

  const delegation = await prisma.delegation.findFirst({
    where: {
      id: delegationId,
      ...isWorkspaceDelegationWhere(user.workspaceSlug),
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!delegation || !canTransitionDelegationStatus(delegation.status, nextStatus)) {
    return;
  }

  await prisma.delegation.update({
    where: {
      id: delegation.id,
    },
    data: {
      status: nextStatus,
    },
  });

  revalidateDelegationSurfaces(user.workspaceSlug);
}

function createSlug(value: string) {
  return `${value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
}

export async function createDelegation(
  _prevState: CreateDelegationState,
  formData: FormData,
): Promise<CreateDelegationState> {
  const user = await verifyOperationalSession();

  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "MEDIUM") as DelegationPriority;
  const dueDateValue = String(formData.get("dueDate") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "").trim();
  const offerId = String(formData.get("offerId") ?? "").trim();

  if (!title) {
    return {
      error: "Informe o título da delegação.",
    };
  }

  if (!assigneeId) {
    return {
      error: "Selecione um responsável.",
    };
  }

  const assignee = await prisma.user.findFirst({
    where: {
      id: assigneeId,
      workspaceSlug: user.workspaceSlug,
    },
    select: {
      id: true,
    },
  });

  if (!assignee) {
    return {
      error: "Responsável inválido para o workspace atual.",
    };
  }

  if (offerId) {
    const offer = await prisma.offer.findFirst({
      where: {
        id: offerId,
        owner: {
          workspaceSlug: user.workspaceSlug,
        },
      },
      select: {
        id: true,
      },
    });

    if (!offer) {
      return {
        error: "Oferta inválida para o workspace atual.",
      };
    }
  }

  await prisma.delegation.create({
    data: {
      slug: createSlug(title),
      title,
      status: DelegationStatus.OPEN,
      priority,
      dueDate: dueDateValue ? new Date(`${dueDateValue}T12:00:00.000Z`) : null,
      assigneeId,
      createdById: user.id,
      offerId: offerId || null,
    },
  });

  revalidateDelegationSurfaces(user.workspaceSlug);

  return {
    error: "",
  };
}
