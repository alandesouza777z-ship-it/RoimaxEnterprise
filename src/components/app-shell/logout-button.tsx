"use client";

import { useTransition } from "react";

import { logout } from "@/app/login/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void logout())}
      disabled={isPending}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Saindo..." : "Sair"}
    </button>
  );
}
