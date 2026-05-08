import { DelegationStatus } from "@prisma/client";

import { updateDelegationStatus } from "@/app/app/delegations/actions";

type DelegationStatusActionsProps = {
  delegationId: string;
  status: DelegationStatus;
};

export function DelegationStatusActions({ delegationId, status }: DelegationStatusActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {status === DelegationStatus.OPEN ? (
        <>
          <form
            action={async () => {
              "use server";
              await updateDelegationStatus(delegationId, DelegationStatus.IN_PROGRESS);
            }}
          >
            <button
              type="submit"
              className="inline-flex rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/30 hover:text-white"
            >
              iniciar
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await updateDelegationStatus(delegationId, DelegationStatus.DONE);
            }}
          >
            <button
              type="submit"
              className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/15"
            >
              aprovar
            </button>
          </form>
        </>
      ) : null}

      {status === DelegationStatus.IN_PROGRESS ? (
        <form
          action={async () => {
            "use server";
            await updateDelegationStatus(delegationId, DelegationStatus.DONE);
          }}
        >
          <button
            type="submit"
            className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:bg-emerald-300/15"
          >
            concluir
          </button>
        </form>
      ) : null}
    </div>
  );
}
