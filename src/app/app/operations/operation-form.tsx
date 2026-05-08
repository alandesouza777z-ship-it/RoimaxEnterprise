"use client";

import { OperationWeekday } from "@prisma/client";
import { useActionState } from "react";

import { createOperationBlock } from "@/app/app/operations/actions";

const initialState = {
  error: "",
};

const weekdays: Array<{ value: OperationWeekday; label: string }> = [
  { value: OperationWeekday.MONDAY, label: "Segunda" },
  { value: OperationWeekday.TUESDAY, label: "Terça" },
  { value: OperationWeekday.WEDNESDAY, label: "Quarta" },
  { value: OperationWeekday.THURSDAY, label: "Quinta" },
  { value: OperationWeekday.FRIDAY, label: "Sexta" },
];

export function OperationForm() {
  const [state, formAction, isPending] = useActionState(createOperationBlock, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr_auto] lg:items-end">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Bloco operacional</span>
          <input
            name="title"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Ex.: Aprovar criativos da oferta"
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Dia</span>
          <select
            name="weekday"
            defaultValue={OperationWeekday.MONDAY}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
          >
            {weekdays.map((weekday) => (
              <option key={weekday.value} value={weekday.value}>
                {weekday.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-[50px] items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Criando..." : "Novo bloco"}
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
