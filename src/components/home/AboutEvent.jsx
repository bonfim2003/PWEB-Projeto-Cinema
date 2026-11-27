import Sticker from "@/components/decor/Sticker";
import { Ticket, Armchair, Sparkles } from "lucide-react";

const passos = [
  {
    numero: "01",
    icon: Ticket,
    titulo: "Reserve pelo site",
    texto:
      "Escolha a sessão e a área do espaço. Cada conta reserva até 4 ingressos por sessão, e cada ingresso ganha um código próprio.",
  },
  {
    numero: "02",
    icon: Armchair,
    titulo: "Chegue com o código",
    texto:
      "Os códigos ficam em Meus ingressos. Não precisa imprimir: mostre no celular ou anote os 8 caracteres.",
  },
  {
    numero: "03",
    icon: Sparkles,
    titulo: "A portaria confirma sua entrada",
    texto:
      "O operador digita o código e o sistema confirma na hora. Cada código vale uma única entrada, só na sessão reservada.",
  },
];

export default function AboutEvent() {
  return (
    <section id="gratuito" className="scroll-mt-24 px-5 pb-16 lg:px-10 lg:pb-24">
      <div className="relative mx-auto max-w-[1360px]">
        <div className="overflow-hidden border-2 border-ink bg-mustard shadow-block">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:p-14">
            <div className="relative">
              <p className="font-serif text-xl italic text-ink/60">
                a proposta
              </p>
              <h2 className="mt-1 font-display text-4xl font-semibold leading-[0.95] text-ink sm:text-5xl">
                Entrada gratuita,
                <br />
                sempre.
              </h2>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-ink/75">
                O Cine Pipoca é um cinema ao ar livre gratuito que circula
                por praças e parques. A reserva online não vende nada: ela
                organiza o encontro, para que o espaço caiba todo mundo e
                ninguém fique de fora na hora da sessão.
              </p>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-ink/75">
                Se não puder ir, cancele até 2 horas antes: as vagas voltam na
                hora para outra pessoa.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Sticker tone="coral" className="h-[86px] w-[86px] -rotate-6">
                  Sem<br />pagamento
                </Sticker>
                <Sticker tone="cream" className="h-[86px] w-[86px] rotate-3">
                  100%<br />gratuito
                </Sticker>
              </div>
            </div>

            <ol className="relative space-y-5">
              {passos.map(({ numero, icon: Icon, titulo, texto }) => (
                <li
                  key={numero}
                  className="flex gap-4 rounded-xl border-2 border-ink bg-cream p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lagoon/40">
                    <Icon className="h-4 w-4 text-ink" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-retro text-ink/45">
                      passo {numero}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-ink">
                      {titulo}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                      {texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}