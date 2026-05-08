import Link from "next/link";

import { WORKSPACES } from "@/components/app-shell/navigation";

type WorkspaceSwitcherProps = {
  currentWorkspaceSlug: string;
};

export function WorkspaceSwitcher({ currentWorkspaceSlug }: WorkspaceSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {WORKSPACES.map((workspace) => {
        const isCurrent = workspace.slug === currentWorkspaceSlug;

        return (
          <Link
            key={workspace.slug}
            href={`/app/workspace/${workspace.slug}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isCurrent
                ? "border border-amber-300/30 bg-amber-300/15 text-amber-100"
                : "border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40 hover:bg-white/10"
            }`}
          >
            {workspace.name}
          </Link>
        );
      })}
    </div>
  );
}
