import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell/app-shell";
import { verifySession } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await verifySession();

  return (
    <AppShell displayName={user.displayName} workspaceSlug={user.workspaceSlug} role={user.role}>
      {children}
    </AppShell>
  );
}
