import { UserRole } from "@prisma/client";

import { toggleUserAccess, updateUserRole } from "@/app/app/users/actions";
import { getRoleOptions } from "@/lib/queries/users";

type UserAdminActionsProps = {
  userId: string;
  currentRole: UserRole;
  isDisabled: boolean;
};

const roles = getRoleOptions();

export function UserAdminActions({ userId, currentRole, isDisabled }: UserAdminActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateUserRole(userId, String(formData.get("role") ?? "") as UserRole);
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <select
          name="role"
          defaultValue={currentRole}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100 outline-none transition focus:border-amber-300/40"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/30 hover:text-white"
        >
          atualizar role
        </button>
      </form>

      <form
        action={async () => {
          "use server";
          await toggleUserAccess(userId);
        }}
      >
        <button
          type="submit"
          className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
            isDisabled
              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
              : "border border-rose-400/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15"
          }`}
        >
          {isDisabled ? "reativar usuário" : "desativar usuário"}
        </button>
      </form>
    </div>
  );
}
