"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import { createUser } from "@/app/app/users/actions";

const initialState = {
  error: "",
};

const roles = Object.values(UserRole);

export function UserCreateForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="grid gap-4 lg:grid-cols-4 lg:items-end">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Usuário</span>
          <input
            name="username"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Ex.: maria"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Nome</span>
          <input
            name="displayName"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Ex.: Maria"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Senha inicial</span>
          <input
            name="password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Senha inicial"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Role</span>
          <select
            name="role"
            defaultValue={UserRole.OPERATOR}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {state.error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {state.error}
          </div>
        ) : <div />}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-[50px] items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Criando..." : "Criar usuário"}
        </button>
      </div>
    </form>
  );
}
