import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Gift, Send, Star } from "lucide-react";
import BuildDemo from "../BuildDemo";
import { Logo, ThemeToggle, btnAccent, btnGhost } from "../ui";
import { TG } from "../data";

const links = [["#work", "Роботи"], ["#process", "Як працюємо"], ["#pricing", "Ціни"], ["#faq", "Питання"]];

export function Header() {
  const { scrollY } = useScroll();
  const [stuck, setStuck] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setStuck(v > 40)), [scrollY]);
  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-3">
      <motion.div
        className="wrap flex items-center gap-3 rounded-full py-2 pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500"
        animate={{ maxWidth: stuck ? 980 : 1200 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{
          background: stuck ? "color-mix(in srgb, var(--t-bg) 72%, transparent)" : "transparent",
          border: `1px solid ${stuck ? "var(--t-line)" : "transparent"}`,
          backdropFilter: stuck ? "blur(18px)" : "none",
          WebkitBackdropFilter: stuck ? "blur(18px)" : "none",
        }}
      >
        <a href="#top" className="mr-auto flex items-center gap-2.5" aria-label="MBO Solutions, на початок">
          <Logo className="h-5 w-auto" />
          <span className="hidden text-[11px] font-semibold tracking-[.3em] text-fg-3 uppercase sm:inline">Solutions</span>
        </a>
        <nav aria-label="Розділи" className="hidden items-center gap-1 md:flex">
          {links.map(([h, l]) => (
            <a key={h} href={h} className="rounded-full px-3.5 py-2 text-sm text-fg-2 transition-colors hover:bg-card-2 hover:text-fg">{l}</a>
          ))}
        </nav>
        <ThemeToggle />
        <a href="#contact" className={`${btnAccent} min-h-10 px-4 text-sm`}>Обговорити<span className="hidden sm:inline"> проєкт</span></a>
      </motion.div>
    </header>
  );
}

const words = ["продають", "записують", "працюють"];

export function Hero({ onConcept }: { onConcept: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const [stage, setStage] = useState(0);
  const [w, setW] = useState(0);

  // play the build loop only while the hero is visible; the last stage stays longer
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setStage((s) => (s + 1) % 5), stage === 4 ? 3800 : 2300);
    return () => clearTimeout(t);
  }, [stage, inView]);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setW((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [inView]);

  // soft light that trails the pointer
  const mx = useMotionValue(0.7), my = useMotionValue(0.3);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 }), sy = useSpring(my, { stiffness: 60, damping: 20 });
  const left = useTransform(sx, (v) => `${v * 100}%`), top = useTransform(sy, (v) => `${v * 100}%`);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const demoY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      id="top"
      ref={ref}
      className="grain relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height); }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]" style={{ left, top, background: "radial-gradient(circle, var(--t-glow), transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--t-line)_1px,transparent_1px),linear-gradient(90deg,var(--t-line)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_50%_30%,#000,transparent_70%)]" />

      <div className="wrap relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col items-start">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-7 inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[13px]">
            <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent"><Star className="size-3 fill-current" aria-hidden />5.0</span>
            на Fiverr · Україна і весь світ
          </motion.span>

          <h1 className="self-stretch text-[clamp(44px,6.6vw,88px)] leading-[.98] font-semibold tracking-[-.045em]">
            <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>Сайти, що</motion.span>
            <span className="relative block h-[1.08em] overflow-hidden text-accent" aria-live="off">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={w}
                  className="absolute inset-x-0 top-0 whitespace-nowrap"
                  initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
                >
                  {words[w]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 max-w-[520px] text-lg leading-relaxed text-fg-2">
            Лендінг від 3 000 грн за 2–3 дні. Дизайн під ваш бізнес, швидкий сайт на телефоні та заявки прямо у ваш Telegram.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className={btnAccent}>Обговорити проєкт<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></a>
            <button type="button" onClick={onConcept} className={btnGhost}><Gift className="size-4 text-accent" aria-hidden />Концепт безкоштовно</button>
          </motion.div>
          <a href={TG} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
            <Send className="size-3.5" aria-hidden />Або просто напишіть нам у Telegram<ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>

        <motion.div style={{ y: demoY }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <BuildDemo stage={stage} />
          {/* tappable progress: jump to any stage */}
          <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Етапи створення сайту">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} type="button" role="tab" aria-selected={stage === i} aria-label={`Етап ${i + 1}`} onClick={() => setStage(i)} className="relative h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-[var(--t-line-2)]">
                {stage === i && <motion.span layoutId="hero-step" className="absolute inset-0 rounded-full bg-accent" />}
                {stage > i && <span className="absolute inset-0 rounded-full bg-fg-3" />}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
