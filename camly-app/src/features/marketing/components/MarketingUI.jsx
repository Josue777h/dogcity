import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useInView } from './marketingMotion';
import InteractiveHeroCanvas from './InteractiveHeroCanvas';

// Tonos de los iconos. Un acento de marca (sky) más colores semánticos para categorías.
const ICON_TONES = {
  sky: 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white',
  cyan: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white',
  emerald: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
  amber: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
  rose: 'bg-rose-100 text-rose-700 group-hover:bg-rose-500 group-hover:text-white',
  indigo: 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white',
  violet: 'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
};

const PILL_TONES = {
  sky: 'bg-sky-50 border-sky-200 text-sky-800',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

/** Hace aparecer su contenido con un deslizamiento suave al entrar en pantalla. */
export function Reveal({ as = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  const Element = as;
  return (
    <Element
      ref={ref}
      style={{ '--mk-delay': `${delay}ms` }}
      className={`mk-reveal ${inView ? 'is-in' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Element>
  );
}

/** Número que sube desde 0 hasta `to` cuando se vuelve visible. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1400, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{value}{suffix}</span>;
}

export function Section({ id, muted = false, className = '', children }) {
  return (
    <section id={id} className={`relative border-b border-slate-200/70 py-16 sm:py-24 ${muted ? 'bg-slate-50' : 'bg-white'} ${className}`}>
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">{children}</Reveal>
    </section>
  );
}

export function PageHero({ eyebrow, title, highlight, description, ctaTo, ctaLabel, note }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#070B14] text-white">
      <InteractiveHeroCanvas />

      <div className="relative mx-auto max-w-4xl space-y-6 px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
        <p className="mk-pop inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
          {eyebrow}
        </p>

        <h1 className="mk-title mk-pop text-4xl leading-[1.04] sm:text-6xl [--mk-delay:80ms]">
          {title}
          <span className="mt-2 block text-sky-400">{highlight}</span>
        </h1>

        <p className="mk-pop mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg [--mk-delay:160ms]">{description}</p>

        <div className="mk-pop flex flex-col items-center gap-3 pt-2 [--mk-delay:240ms]">
          <Link
            to={ctaTo}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] sm:w-auto sm:text-base"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
          {note && <p className="text-xs font-medium text-slate-400">{note}</p>}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, children, tone = 'sky', dark = false }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl space-y-4 text-center sm:mb-14">
      {eyebrow && (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${PILL_TONES[tone]}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`mk-title text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem] ${dark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      {children && (
        <p className={`text-sm leading-relaxed sm:text-base ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{children}</p>
      )}
    </Reveal>
  );
}

export function FeatureCard({ icon, tone = 'sky', title, children, delay = 0 }) {
  const Icon = icon;
  return (
    <Reveal
      as="article"
      delay={delay}
      className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-900/10 sm:p-7"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${ICON_TONES[tone]}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mk-title mt-5 text-lg text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </Reveal>
  );
}

export function IconRow({ icon, tone = 'sky', title, children }) {
  const Icon = icon;
  return (
    <li className="group flex items-start gap-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${ICON_TONES[tone]}`}>
        <Icon size={18} aria-hidden="true" />
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
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-900/5"
    >
      <div>
        <p className="font-bold text-slate-900 transition-colors group-hover:text-sky-700">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-sky-600 group-hover:text-white">
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function CtaBand({ title, description, ctaTo, ctaLabel, note }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#070B14] py-20 text-white sm:py-28">
      <InteractiveHeroCanvas />
      <Reveal className="relative mx-auto max-w-4xl space-y-6 px-4 text-center sm:px-6">
        <h2 className="mk-title text-3xl leading-[1.08] sm:text-5xl">{title}</h2>
        {description && (
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>
        )}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            to={ctaTo}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] sm:w-auto sm:text-base"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
          {note && <p className="text-xs font-medium text-slate-400">{note}</p>}
        </div>
      </Reveal>
    </section>
  );
}
