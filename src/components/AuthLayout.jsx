import React from "react";
import { Link } from "react-router-dom";
import Brand from "@/components/Brand";
import Sticker from "@/components/decor/Sticker";
import Tape from "@/components/decor/Tape";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="paper-grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blush/25" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-lagoon/20" />
        <div className="halftone absolute right-10 top-16 h-32 w-32 opacity-20" />
      </div>

      <Brand className="mb-9" />

      <div className="relative w-full max-w-md">
        <Tape tone="mustard" className="-top-3 left-8 -rotate-6" />
        <div className="rounded-2xl border-2 border-ink bg-card p-7 shadow-block sm:p-9">
          <div className="mb-7 text-center">
            {Icon && (
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-mustard">
                <Icon className="h-5 w-5 text-ink" aria-hidden="true" />
              </div>
            )}
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 font-serif text-base italic text-plum">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        <Sticker
          tone="coral"
          className="absolute -bottom-6 -right-4 hidden h-[70px] w-[70px] rotate-6 sm:flex"
        >
          Grátis<br />sempre
        </Sticker>

        {footer && <p className="mt-8 text-center text-sm text-ink/60">{footer}</p>}
        <p className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs font-medium uppercase tracking-retro text-ink/45 transition-colors hover:text-ink"
          >
            voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}