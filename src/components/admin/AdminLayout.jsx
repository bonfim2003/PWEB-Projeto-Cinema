import { NavLink, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Film,
  CalendarDays,
  Ticket,
  LogOut,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/filmes", label: "Filmes", icon: Film },
  { to: "/admin/sessoes", label: "Sessões", icon: CalendarDays },
  { to: "/admin/reservas", label: "Reservas", icon: Ticket },
];

export default function AdminLayout() {
  const { user } = useAuth();

  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-coral">
          <ShieldAlert className="h-6 w-6 text-ink" />
        </span>
        <h1 className="mt-6 font-display text-3xl text-ink">Área restrita</h1>
        <p className="mt-3 max-w-sm text-sm text-ink/60">
          Seu usuário não tem permissão de administrador. Se você faz parte da
          produção do evento, peça acesso à organização.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink"
          >
            Voltar ao site
          </Link>
          <button
            type="button"
            onClick={() => base44.auth.logout()}
            className="rounded-full border-2 border-ink px-6 py-3 text-sm font-semibold text-ink"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b-2 border-ink bg-ink p-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r-2">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/60 bg-mustard">
              <span className="h-3 w-3 rounded-full bg-ink" />
            </span>
            <span className="font-display text-base tracking-wide text-cream">
              CINE AFTERGLOW
            </span>
          </Link>
          <p className="mt-1 pl-12 text-[10px] uppercase tracking-retro text-cream/40">
            Painel
          </p>

          <nav className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-cream text-ink"
                      : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 hidden border-t border-cream/15 pt-5 lg:block">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-cream"
            >
              <ArrowUpRight className="h-4 w-4" />
              Ver o site
            </Link>
            <button
              type="button"
              onClick={() => base44.auth.logout()}
              className="mt-4 flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-cream"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}