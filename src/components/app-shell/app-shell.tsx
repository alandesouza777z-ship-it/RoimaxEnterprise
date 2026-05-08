import type { ReactNode } from "react";

import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";

import { UserRole } from "@prisma/client";

type AppShellProps = {
  children: ReactNode;
  displayName: string;
  workspaceSlug: string;
  role: UserRole;
};

export function AppShell({ children, displayName, workspaceSlug, role }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] text-slate-100 xl:flex">
      <Sidebar workspaceSlug={workspaceSlug} role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar displayName={displayName} workspaceSlug={workspaceSlug} role={role} />
        <main className="flex-1 px-6 py-6 xl:px-8 xl:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
