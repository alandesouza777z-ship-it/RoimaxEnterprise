"use client";

import { DelegationPriority } from "@prisma/client";
import { useActionState } from "react";

import { createDelegation } from "@/app/app/delegations/actions";

type Option = {
  id: string;
  label: string;
};

type DelegationFormProps = {
  assignees: Option[];
  offers: Option[];
};

const initialState = {
  error: "",
};

const priorities = Object.values(DelegationPriority);

export function DelegationForm({ assignees, offers }: DelegationFormProps) {
  const [state, formAction, isPending] = useActionState(createDelegation, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="grid gap-4 lg:grid-cols-5 lg:items-end">
        <label className="block space-y-2 text-sm text-slate-200 lg:col-span-2">
          <span>Título da delegação</span>
          <input
            name="title"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Ex.: Revisar nova abertura da VSL"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Responsável</span>
          <select
            name="assigneeId"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Selecionar
            </option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Prioridade</span>
          <select
            name="priority"
            defaultValue={DelegationPriority.MEDIUM}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-[50px] items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Criando..." : "Nova delegação"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Prazo</span>
          <input
            name="dueDate"
            type="date"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Oferta vinculada</span>
          <select
            name="offerId"
            defaultValue=""
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          >
            <option value="">Não vincular</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}
