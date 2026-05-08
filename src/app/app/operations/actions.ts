"use server";

import { OperationWeekday } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { verifyOperationalSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

type CreateOperationBlockState = {
  error: string;
};

function createSlug(value: string) {
  return `${value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
}

export async function createOperationBlock(
  _prevState: CreateOperationBlockState,
  formData: FormData,
): Promise<CreateOperationBlockState> {
  const user = await verifyOperationalSession();

  const title = String(formData.get("title") ?? "").trim();
  const weekday = String(formData.get("weekday") ?? "") as OperationWeekday;

  if (!title) {
    return {
      error: "Informe o título do bloco operacional.",
    };
  }

  if (!Object.values(OperationWeekday).includes(weekday)) {
    return {
      error: "Selecione um dia válido da semana.",
    };
  }

  await prisma.operationBlock.create({
    data: {
      slug: createSlug(title),
      title,
      weekday,
      workspaceSlug: user.workspaceSlug,
      createdById: user.id,
    },
  });

  revalidatePath("/app/operations");
  revalidatePath("/app/dashboard");

  return {
    error: "",
  };
}
