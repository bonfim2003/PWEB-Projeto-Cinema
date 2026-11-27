import { Link } from "react-router-dom";
import Brand from "@/components/Brand";
import Sticker from "@/components/decor/Sticker";
import { MapPin, Clock3, Mail } from "lucide-react";

const navegar = [
  { label: "Em cartaz", href: "/#programacao" },
  { label: "Agenda", href: "/#agenda" },
  { label: "Como funciona", href: "/#gratuito" },
  { label: "Os locais", href: "/#evento" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto max-w-[1360px] px-5 py-14 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_1fr]">
          <div>
            <Brand tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
              Uma temporada de cinema ao ar livre que circula por praças e
              parques da cidade. Clássicos oitentistas na tela grande, reserva
              pelo site e entrada gratuita em todas as sessões.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Sticker tone="mustard" className="h-20 w-20 -rotate-6">
                Entrada<br />grátis
              </Sticker>
              <Sticker tone="lagoon" className="h-20 w-20 rotate-3">
                Até 4<br />ingressos
              </Sticker>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-serif text-lg italic text-cream/60">navegar</p>
            <div className="flex flex-col gap-2 text-cream/80">
              {navegar.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-mustard"
                >
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="transition-colors hover:text-mustard">
                Produção e portaria
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-serif text-lg italic text-cream/60">onde e quando</p>
            <p className="flex items-start gap-2 text-cream/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              Parque Aurora, Praça do Coreto e Mirante da Represa
            </p>
            <p className="flex items-start gap-2 text-cream/80">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              Portões abrem 1 hora antes de cada sessão
            </p>
            <a
              href="mailto:producao@cinepipoca.com.br"
              className="flex items-center gap-2 text-cream/80 transition-colors hover:text-mustard"
            >
              <Mail className="h-4 w-4 shrink-0 text-mustard" />
              producao@cinepipoca.com.br
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-2 px-5 py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 Cine Pipoca · Evento cultural gratuito</p>
          <p>Projeto acadêmico · Programação Dinâmica para a Web</p>
        </div>
      </div>
    </footer>
  );
}