"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block space-y-2 text-sm text-slate-200">
        <span>Usuário</span>
        <input
          name="username"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
          placeholder="Digite seu usuário"
          autoComplete="username"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Senha</span>
        <input
          name="password"
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
