"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import { clearSession, rotateSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  error: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!username || !password) {
    return {
      error: "Preencha usuário e senha.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.disabledAt) {
    return {
      error: "Usuário ou senha inválidos.",
    };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return {
      error: "Usuário ou senha inválidos.",
    };
  }

  await rotateSession(user.id);
  redirect("/app/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
