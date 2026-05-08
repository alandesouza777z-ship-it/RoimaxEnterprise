import { UserRole } from "@prisma/client";

import { isAdminRole, isOperationalRole } from "@/lib/auth/roles";

export type Workspace = {
  slug: string;
  name: string;
  role: string;
  focus: string;
};

export type NavItem = {
  label: string;
  href: string;
  matchPrefix: string;
};

export const WORKSPACES: Workspace[] = [
  {
    slug: "alan",
    name: "Alan",
    role: "Direção executiva",
    focus: "Aprovações, visão global e ritmo da operação.",
  },
  {
    slug: "pedro",
    name: "Pedro",
    role: "Ofertas e operação",
    focus: "Prioridades comerciais, execução e fluxo diário.",
  },
  {
    slug: "lucas",
    name: "Lucas",
    role: "Criativos e copys",
    focus: "Materiais, mensagens e produção dos ativos.",
  },
];

export function getNavItems(workspaceSlug: string, role: UserRole): NavItem[] {
  const items: NavItem[] = [
    {
      label: "Dashboard",
      href: "/app/dashboard",
      matchPrefix: "/app/dashboard",
    },
    {
      label: "Meu Workspace",
      href: `/app/workspace/${workspaceSlug}`,
      matchPrefix: "/app/workspace",
    },
    {
      label: "Inbox",
      href: "/app/inbox",
      matchPrefix: "/app/inbox",
    },
    {
      label: "Arquivos",
      href: "/app/files",
      matchPrefix: "/app/files",
    },
  ];

  if (isOperationalRole(role)) {
    items.splice(2, 0,
      {
        label: "Ofertas",
        href: "/app/offers",
        matchPrefix: "/app/offers",
      },
      {
        label: "Operação",
        href: "/app/operations",
        matchPrefix: "/app/operations",
      },
      {
        label: "Delegação",
        href: "/app/delegations",
        matchPrefix: "/app/delegations",
      },
    );
  }

  if (isAdminRole(role)) {
    items.push({
      label: "Usuários",
      href: "/app/users",
      matchPrefix: "/app/users",
    });
  }

  return items;
}
