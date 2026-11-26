import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Brand from "@/components/Brand";
import { Menu, X, Ticket, LogOut, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Em cartaz", href: "/#programacao" },
  { label: "Agenda", href: "/#agenda" },
  { label: "Gratuito", href: "/#gratuito" },
  { label: "O evento", href: "/#evento" },
];

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const isAdmin = user?.role === "admin";

  const sair = () => {
    setMenuAberto(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-cream">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-5 py-1.5 text-[10px] uppercase tracking-retro lg:px-10">
          <span>Temporada 2026 · Parque Aurora</span>
          <span className="hidden sm:block">
            Sextas e sábados · 18h30 · entrada gratuita
          </span>
          <span className="sm:hidden">Entrada gratuita</span>
        </div>
      </div>

      <div className="border-b-2 border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between gap-4 px-5 lg:px-10">
          <Brand />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium text-ink/70 transition-colors hover:text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-coral after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                to="/meus-ingressos"
                className="hidden items-center gap-2 rounded-full border-2 border-ink bg-mustard px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-mustard/70 sm:inline-flex"
              >
                <Ticket className="h-4 w-4" />
                Meus ingressos
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Painel
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden max-w-[130px] truncate text-xs text-ink/55 xl:block">
                  {user.full_name || user.email}
                </span>
                <button
                  type="button"
                  onClick={sair}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-4 py-2 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block"
              >
                <Ticket className="h-4 w-4" />
                Entrar
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuAberto((valor) => !valor)}
              aria-expanded={menuAberto}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink text-ink lg:hidden"
            >
              {menuAberto ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav
            className="border-t-2 border-ink bg-cream px-5 py-4 lg:hidden"
            aria-label="Menu do site"
          >
            <ul className="flex flex-col divide-y divide-ink/10">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMenuAberto(false)}
                    className="block py-3 font-display text-lg text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    to="/meus-ingressos"
                    onClick={() => setMenuAberto(false)}
                    className="block py-3 font-display text-lg text-ink"
                  >
                    Meus ingressos
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setMenuAberto(false)}
                    className="block py-3 font-display text-lg text-ink"
                  >
                    Painel da produção
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}