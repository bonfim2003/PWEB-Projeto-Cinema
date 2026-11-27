import { NavLink, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Film, CalendarDays, MapPin, Users, ScanLine, LogOut, ArrowUpRight } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/filmes", label: "Filmes", icon: Film },
  { to: "/admin/locais", label: "Locais", icon: MapPin },
  { to: "/admin/sessoes", label: "Sessões", icon: CalendarDays },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/portaria", label: "Portaria", icon: ScanLine },
];

export default function AdminLayout() {
  const { user, sair } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b-2 border-ink bg-ink p-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r-2">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-full border-2 border-cream/60 object-cover" />
            <span className="font-display text-base tracking-wide text-cream">
              CINE PIPOCA
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
            <p className="mb-4 truncate text-xs text-cream/50">{user?.name}</p>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-cream"
            >
              <ArrowUpRight className="h-4 w-4" />
              Ver o site
            </Link>
            <button
              type="button"
              onClick={sair}
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