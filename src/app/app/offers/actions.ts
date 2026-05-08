"use server";

import { OfferPriority, OfferStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { verifyOperationalSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

type CreateOfferState = {
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

export async function createOffer(
  _prevState: CreateOfferState,
  formData: FormData,
): Promise<CreateOfferState> {
  const user = await verifyOperationalSession();

  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "MEDIUM") as OfferPriority;
  const dueDateValue = String(formData.get("dueDate") ?? "").trim();

  if (!title) {
    return {
      error: "Informe o título da oferta.",
    };
  }

  await prisma.offer.create({
    data: {
      slug: createSlug(title),
      title,
      status: OfferStatus.DRAFT,
      priority,
      dueDate: dueDateValue ? new Date(`${dueDateValue}T12:00:00.000Z`) : null,
      ownerId: user.id,
    },
  });

  revalidatePath("/app/offers");
  revalidatePath("/app/dashboard");

  return {
    error: "",
  };
}
