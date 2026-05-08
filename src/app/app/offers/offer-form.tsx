"use client";

import { OfferPriority } from "@prisma/client";
import { useActionState } from "react";

import { createOffer } from "@/app/app/offers/actions";

const initialState = {
  error: "",
};

const priorities = Object.values(OfferPriority);

export function OfferForm() {
  const [state, formAction, isPending] = useActionState(createOffer, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.8fr_0.8fr_auto] lg:items-end">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Título da oferta</span>
          <input
            name="title"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Ex.: Nova VSL executiva"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Prioridade</span>
          <select
            name="priority"
            defaultValue={OfferPriority.MEDIUM}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Prazo</span>
          <input
            name="dueDate"
            type="date"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-[50px] items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Criando..." : "Nova oferta"}
        </button>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}
