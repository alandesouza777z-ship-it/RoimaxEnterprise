"use client";

import { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavItems } from "@/components/app-shell/navigation";

type SidebarProps = {
  workspaceSlug: string;
  role: UserRole;
};

export function Sidebar({ workspaceSlug, role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(workspaceSlug, role);

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-slate-950/85 px-5 py-6 backdrop-blur xl:min-h-screen xl:w-72 xl:border-b-0 xl:border-r">
      <div className="mb-8 space-y-3">
        <div className="inline-flex w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
          RoiMax
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Enterprise</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Operação executiva compartilhada com autenticação por usuário, workspaces e dados centrais.
          </p>
        </div>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border border-amber-300/20 bg-amber-300/10 text-amber-100"
                  : "border border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Fase atual</p>
        <p className="mt-2 leading-6">
          Ambiente shared-first em evolução: PostgreSQL central, ingestão remota de artifacts e operação colaborativa.
        </p>
      </div>
    </aside>
  );
}
