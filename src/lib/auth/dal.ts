import { UserRole } from "@prisma/client";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";

import { OPERATIONAL_ROLES, isAdminRole } from "@/lib/auth/roles";
import { deleteExpiredSessions, getSessionToken, touchSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  await deleteExpiredSessions();

  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date() || session.user.disabledAt) {
    return null;
  }

  await touchSession(token);
  return session.user;
});

export async function verifySession() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function verifyRole(roles: UserRole[]) {
  const user = await verifySession();

  if (!roles.includes(user.role)) {
    forbidden();
  }

  return user;
}

export async function verifyAdminSession() {
  const user = await verifySession();

  if (!isAdminRole(user.role)) {
    forbidden();
  }

  return user;
}

export async function verifyOperationalSession() {
  return verifyRole(OPERATIONAL_ROLES);
}
