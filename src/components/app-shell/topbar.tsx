import { LogoutButton } from "@/components/app-shell/logout-button";
import { type AppShellRole } from "@/components/app-shell/navigation";
import { WorkspaceSwitcher } from "@/components/app-shell/workspace-switcher";

type TopbarProps = {
  displayName: string;
  workspaceSlug: string;
  role: AppShellRole;
};

export function Topbar({ displayName, workspaceSlug, role }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur xl:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
            RoiMax Enterprise
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Executive Operating System
          </h2>
        </div>

        <div className="flex flex-col gap-4 xl:items-end">
          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
            <div className="flex min-w-[240px] items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              Buscar no ambiente compartilhado
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <span>Notificações</span>
              <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-xs font-semibold text-amber-200">
                07
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {displayName} · {role}
            </div>
            <LogoutButton />
          </div>
          <WorkspaceSwitcher currentWorkspaceSlug={workspaceSlug} />
        </div>
      </div>
    </header>
  );
}
