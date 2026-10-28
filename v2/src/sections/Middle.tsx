import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import BuildDemo from "../BuildDemo";
import { CountUp, Reveal, SplitTitle } from "../ui";
import { steps } from "../data";

// Black metric cards with big light numerals
export function Stats() {
  const items = [
    { pre: "від", n: 3000, suf: "₴", label: "лендінг під ключ" },
    { pre: "", n: 3, suf: "дні", label: "від брифу до запуску" },
    { pre: "≈", n: 1, suf: "с", label: "відкривається на телефоні" },
    { pre: "", n: 5, dec: 1, suf: "★", label: "оцінка клієнтів на Fiverr" },
  ];
  return (
    <section aria-label="Цифри" className="wrap grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it, i) => (
        <Reveal key={it.label} delay={i * 0.08}>
          <div className="group relative h-full overflow-hidden rounded-[28px] bg-ink p-5 text-on-ink md:p-7">
            <span aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full bg-accent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
            <div className="flex items-baseline gap-1.5">
              {it.pre && <span className="text-sm text-on-ink/50">{it.pre}</span>}
              <CountUp to={it.n} decimals={it.dec ?? 0} className="text-[clamp(40px,5vw,64px)] leading-none font-light tracking-[-.04em] tabular-nums" />
              <span className="text-xl font-light text-on-ink/60">{it.suf}</span>
            </div>
            <p className="mt-3 text-sm text-on-ink/60">{it.label}</p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

// Scroll-driven story: the same site builds up step by step while the section is pinned
export function Process() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setStage(Math.min(4, Math.floor(p * 5.2))));
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="process" ref={ref} className="relative h-[460vh]" aria-label="Як ми працюємо">
      <div className="sticky top-0 flex min-h-svh flex-col justify-center overflow-hidden py-20">
        <div className="wrap grid items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">Як ми працюємо</p>
            <h2 className="h2 mt-4">Ваш сайт за 5 кроків</h2>
            <ol className="mt-8 hidden flex-col gap-1 lg:flex">
              {steps.map((s, i) => (
                <li key={s.title} className="relative py-3 pl-8">
                  <span className={`absolute top-[18px] left-0 size-2.5 rounded-full transition-colors duration-500 ${i <= stage ? "bg-accent" : "bg-[var(--t-line-2)]"}`} />
                  <motion.p animate={{ opacity: i === stage ? 1 : 0.35 }} className="text-xl font-semibold">{s.title}</motion.p>
                  <AnimatePresence initial={false}>
                    {i === stage && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-1.5 text-fg-2">
                        {s.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ol>
            <div className="relative mt-6 hidden h-px bg-[var(--t-line-2)] lg:block">
              <motion.span className="absolute inset-y-0 left-0 origin-left bg-accent" style={{ width: "100%", scaleX: bar }} />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[620px]">
            <BuildDemo stage={stage} />
            {/* phones: the current step text sits under the demo */}
            <div className="mt-5 min-h-[96px] lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="text-lg font-semibold">{steps[stage].title}</p>
                  <p className="mt-1 text-fg-2">{steps[stage].text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const cases = [
  { tag: "Брендинг · сайт", name: "LUMEX", title: "Картини на оргсклі з підсвіткою фар вашого авто", img: "/img/case-lumex.webp", href: "" },
  { tag: "Концепт для ніші", name: "GLOSSLAB", title: "Сайт детейлінг-студії, який записує клієнтів сам", img: "/img/demo-detailing.webp", href: "/examples/detailing.html" },
];
const niches = [
  { name: "СТО", img: "/img/demo-sto.webp", href: "/examples/sto.html" },
  { name: "Салон краси", img: "/img/demo-beauty.webp", href: "/examples/beauty.html" },
  { name: "Шиномонтаж", img: "/img/demo-tires.webp", href: "/examples/tires.html" },
];

// Card that tilts toward the pointer
function TiltCard({ c }: { c: (typeof cases)[number] }) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 }), sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const Tag = c.href ? "a" : "div";
  return (
    <motion.div style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * 8); rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8); }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      <Tag {...(c.href ? { href: c.href } : {})} className="group block overflow-hidden rounded-[32px] border border-line bg-card">
        <div className="overflow-hidden">
          <img src={c.img} alt={`${c.name}: ${c.title}`} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className="flex items-end justify-between gap-4 p-6">
          <div>
            <p className="eyebrow">{c.tag}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{c.name}</p>
            <p className="mt-1 text-fg-2">{c.title}</p>
          </div>
          {c.href && <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-2 transition-all group-hover:rotate-45 group-hover:bg-accent group-hover:text-on-accent"><ArrowUpRight className="size-5" aria-hidden /></span>}
        </div>
      </Tag>
    </motion.div>
  );
}

export function Work() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-12%"]);
  return (
    <section id="work" className="py-28 md:py-36">
      <div className="wrap">
        <p className="eyebrow">Роботи</p>
        <SplitTitle text="Те, що ми вже зробили" className="h2 mt-4" />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {cases.map((c, i) => <Reveal key={c.name} delay={i * 0.1}><TiltCard c={c} /></Reveal>)}
        </div>
      </div>
      {/* niche demos drift sideways with scroll */}
      <div ref={ref} className="mt-16 overflow-hidden">
        <div className="wrap mb-5 flex items-end justify-between">
          <p className="text-lg font-semibold">Готові демо для вашої ніші</p>
          <a href="/examples/" className="text-sm text-fg-2 hover:text-fg">Усі приклади →</a>
        </div>
        <motion.div style={{ x }} className="flex gap-4 pl-[max(16px,calc((100vw-1200px)/2))]">
          {niches.map((n) => (
            <a key={n.name} href={n.href} className="group relative w-[min(78vw,420px)] shrink-0 overflow-hidden rounded-[28px] border border-line">
              <img src={n.img} alt={`Демо-сайт: ${n.name}`} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="glass absolute bottom-3 left-3 rounded-full px-3.5 py-1.5 text-sm font-semibold">{n.name}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
