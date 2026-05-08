import { DelegationStatus, OperationWeekday } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const WEEKDAYS: Array<{ value: OperationWeekday; label: string }> = [
  { value: OperationWeekday.MONDAY, label: "Segunda" },
  { value: OperationWeekday.TUESDAY, label: "Terça" },
  { value: OperationWeekday.WEDNESDAY, label: "Quarta" },
  { value: OperationWeekday.THURSDAY, label: "Quinta" },
  { value: OperationWeekday.FRIDAY, label: "Sexta" },
];

export async function listOperationBlocks(workspaceSlug: string) {
  const blocks = await prisma.operationBlock.findMany({
    where: {
      workspaceSlug,
    },
    orderBy: [
      {
        weekday: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });

  return WEEKDAYS.map((day) => ({
    ...day,
    blocks: blocks.filter((block) => block.weekday === day.value),
  }));
}

export async function getOperationsOverview(workspaceSlug: string) {
  const [week, approvals, inProgress] = await Promise.all([
    listOperationBlocks(workspaceSlug),
    prisma.delegation.findMany({
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
      take: 5,
    }),
    prisma.delegation.findMany({
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
      take: 5,
    }),
  ]);

  return {
    week,
    approvals,
    inProgress,
  };
}
