import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-[0_24px_100px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
            Acesso seguro
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Entrar no RoiMax Enterprise
          </h1>
          <p className="text-sm leading-7 text-slate-300">
            Entre com seu usuário e senha do ambiente compartilhado do RoiMax Enterprise.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
          Este ambiente foi preparado para operação compartilhada. O bootstrap inicial depende de credenciais geridas por variáveis de ambiente e não expostas na interface.
        </div>
      </div>
    </main>
  );
}
