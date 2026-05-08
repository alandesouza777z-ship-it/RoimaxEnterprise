"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { verifyAdminSession } from "@/lib/auth/dal";
import { hashPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceUserById, usernameExistsInWorkspace } from "@/lib/queries/users";

type UserAdminState = {
  error: string;
};

const initialState: UserAdminState = {
  error: "",
};

function revalidateUserSurfaces() {
  revalidatePath("/app/users");
}

export async function createUser(
  _prevState: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  const admin = await verifyAdminSession();

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!username || !displayName || !password) {
    return { error: "Preencha usuário, nome e senha." };
  }

  if (!Object.values(UserRole).includes(role)) {
    return { error: "Selecione um role válido." };
  }

  if (await usernameExistsInWorkspace(username, admin.workspaceSlug)) {
    return { error: "Já existe um usuário com esse username neste workspace." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      username,
      displayName,
      passwordHash,
      role,
      workspaceSlug: admin.workspaceSlug,
    },
  });

  revalidateUserSurfaces();
  return initialState;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await verifyAdminSession();

  if (!Object.values(UserRole).includes(role)) {
    return;
  }

  const targetUser = await getWorkspaceUserById(userId, admin.workspaceSlug);

  if (!targetUser) {
    return;
  }

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      role,
    },
  });

  revalidateUserSurfaces();
}

export async function toggleUserAccess(userId: string) {
  const admin = await verifyAdminSession();
  const targetUser = await getWorkspaceUserById(userId, admin.workspaceSlug);

  if (!targetUser) {
    return;
  }

  const disabledAt = targetUser.disabledAt ? null : new Date();

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      disabledAt,
    },
  });

  if (disabledAt) {
    await revokeUserSessions(targetUser.id);
  }

  revalidateUserSurfaces();
}
