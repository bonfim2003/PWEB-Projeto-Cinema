import { ArrowUpRight, Play } from "lucide-react";
import { heroImage } from "@/data/hero";
import { Image } from "@/components/ui/image";
import Tape from "@/components/decor/Tape";
import Sticker from "@/components/decor/Sticker";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blush/25" />
        <div className="absolute right-[8%] top-[14%] h-36 w-36 rounded-full border-[3px] border-ink/10" />
        <div className="absolute bottom-10 left-[46%] hidden h-24 w-24 rotate-12 bg-lagoon/20 lg:block" />
        <div className="halftone absolute -left-10 bottom-24 h-40 w-40 opacity-20" />
      </div>

      <div className="mx-auto grid max-w-[1360px] items-center gap-16 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-16">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-4">
            <Sticker tone="mustard" className="h-[74px] w-[74px] -rotate-6">
              Temporada<br />2026
            </Sticker>
            <p className="max-w-[190px] text-[11px] uppercase leading-relaxed tracking-retro text-ink/60">
              Praças e parques
              <br />
              da cidade
            </p>
          </div>

          <h1 className="mt-7 font-display text-[2.7rem] font-semibold leading-[0.9] text-ink sm:text-6xl lg:text-[4.4rem]">
            Cinema ao ar
            <br />
            livre,{" "}
            <span className="font-serif font-normal italic text-coral">de graça</span>
            ,
            <br />
            sob as estrelas.
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/70">
            Telão inflável, gramado aberto e clássicos oitentistas. Reserve
            seu lugar pelo site, receba um código por ingresso e mostre na
            entrada.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#programacao"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-7 py-4 text-sm font-semibold text-ink shadow-block-sm transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-block">
              
              Ver a programação
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#gratuito"
              className="inline-flex items-center gap-3 text-sm font-semibold text-ink transition-colors hover:text-coral">
              
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink">
                <Play className="h-4 w-4" />
              </span>
              Como funciona
            </a>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t-2 border-ink/15 pt-6 text-sm">
            {[
            ["Entrada", "gratuita, sempre"],
            ["Até 4 ingressos", "por sessão"],
            ["Um código", "por pessoa"]].
            map(([term, desc]) =>
            <div key={term}>
                <dt className="font-display text-base font-semibold text-ink">
                  {term}
                </dt>
                <dd className="text-ink/55">{desc}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
          <div className="relative rotate-[1.5deg]">
            <Tape tone="coral" className="-top-3 left-10 -rotate-6" />
            <Tape tone="lagoon" className="-bottom-3 right-10 rotate-3" />
            <div className="overflow-hidden border-2 border-ink bg-cream p-2 shadow-block">
              <Image
                src={heroImage}
                alt="Pessoas em mantas no gramado assistindo a um filme em um telão ao ar livre ao entardecer"
                className="h-[300px] w-full sm:h-[400px] lg:h-[440px]" />
              
            </div>
          </div>

        </div>
      </div>
    </section>);

}