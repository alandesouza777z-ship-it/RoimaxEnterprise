import { UserAdminActions } from "@/app/app/users/user-admin-actions";
import { UserCreateForm } from "@/app/app/users/user-create-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { verifyAdminSession } from "@/lib/auth/dal";
import { listWorkspaceUsers } from "@/lib/queries/users";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function UsersPage() {
  const user = await verifyAdminSession();

  const users = await listWorkspaceUsers(user.workspaceSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuários"
        title="Gestão compartilhada de usuários"
        description="Camada administrativa para criar usuários, ajustar roles e controlar acesso real no workspace atual."
      />

      <UserCreateForm />

      <section className="grid gap-4 lg:grid-cols-3">
        {users.length ? (
          users.map((member) => (
            <article key={member.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-semibold text-white">{member.displayName}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Usuário: {member.username}</p>
                <p>Role: {member.role}</p>
                <p>Status: {member.disabledAt ? "Desativado" : "Ativo"}</p>
                <p>Entrou na base: {formatDate(member.createdAt)}</p>
                <p>Sessões ativas/persistidas: {member._count.sessions}</p>
                <p>Offers sob responsabilidade: {member._count.ownedOffers}</p>
                <p>Delegações atribuídas: {member._count.assignedDelegations}</p>
                <p>Delegações criadas: {member._count.createdDelegations}</p>
              </div>
              <UserAdminActions userId={member.id} currentRole={member.role} isDisabled={Boolean(member.disabledAt)} />
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400 lg:col-span-3">
            Nenhum usuário encontrado neste workspace.
          </div>
        )}
      </section>
    </div>
  );
}

