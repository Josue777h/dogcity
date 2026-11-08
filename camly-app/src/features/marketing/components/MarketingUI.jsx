import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

// Tonos de los iconos. Un solo acento de marca (sky) y colores semánticos para categorías.
const ICON_TONES = {
  sky: 'bg-sky-100 text-sky-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
};

const PILL_TONES = {
  sky: 'bg-sky-50 border-sky-200 text-sky-800',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

export function Section({ id, muted = false, className = '', children }) {
  return (
    <section id={id} className={`border-b border-slate-200 py-16 sm:py-24 ${muted ? 'bg-slate-50' : 'bg-white'} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function PageHero({ eyebrow, title, highlight, description, ctaTo, ctaLabel, note }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-sky-600/25 blur-3xl" />
        <div className="absolute -top-24 -right-40 h-[24rem] w-[24rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-7 px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
          {eyebrow}
        </span>

        <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
          {title}
          <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-sky-500 bg-clip-text text-transparent">
            {highlight}
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{description}</p>

        <div className="flex flex-col items-center gap-3 pt-1">
          <Link
            to={ctaTo}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_8px_30px_-6px_rgba(34,211,238,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto sm:text-base"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          {note && <p className="text-xs font-medium text-slate-400">{note}</p>}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, children, tone = 'sky', dark = false }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center sm:mb-14">
      {eyebrow && (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${PILL_TONES[tone]}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem] ${dark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      {children && (
        <p className={`text-sm leading-relaxed sm:text-base ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{children}</p>
      )}
    </div>
  );
}

export function FeatureCard({ icon, tone = 'sky', title, children }) {
  const Icon = icon;
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/5 sm:p-7">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-lg font-extrabold text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </article>
  );
}

export function IconRow({ icon, tone = 'sky', title, children }) {
  const Icon = icon;
  return (
    <li className="flex items-start gap-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>
        <Icon size={17} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        {children && <p className="mt-0.5 text-sm text-slate-600">{children}</p>}
      </div>
    </li>
  );
}

export function LinkCard({ to, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-sky-300 hover:shadow-sm"
    >
      <div>
        <p className="font-bold text-slate-900 transition-colors group-hover:text-sky-700">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-sky-700" aria-hidden="true" />
    </Link>
  );
}

export function CtaBand({ title, description, ctaTo, ctaLabel, note }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-sky-600/25 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl space-y-7 px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">{title}</h2>
        {description && (
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>
        )}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            to={ctaTo}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_8px_30px_-6px_rgba(34,211,238,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto sm:text-base"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          {note && <p className="text-xs font-medium text-slate-400">{note}</p>}
        </div>
      </div>
    </section>
  );
}
