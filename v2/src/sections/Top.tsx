import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronDown, Gift, Send, Star } from "lucide-react";
import BuildDemo from "../BuildDemo";
import { Logo, ThemeToggle, btnAccent, btnGhost } from "../ui";
import { TG, steps } from "../data";

// three.js is heavy: load it after the text so the first screen is readable at once
const Scene3D = lazy(() => import("../Scene3D"));

const links = [["#work", "Роботи"], ["#top", "Як працюємо"], ["#pricing", "Ціни"], ["#faq", "Питання"]];

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

// Accent colour and theme from CSS, kept in sync when the theme toggle flips them
function useThemeColors() {
  const read = () => ({
    accent: getComputedStyle(document.documentElement).getPropertyValue("--t-accent").trim() || "#b8a9ff",
    light: document.documentElement.dataset.theme === "light",
  });
  const [c, setC] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return c;
}

const words = ["продають", "записують", "працюють"];

// Pinned first screen: scrolling turns the 3D phone and walks through the five steps
export function Hero({ onConcept }: { onConcept: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setP);
  const intro = p < 0.12;
  const stage = intro ? 0 : Math.min(4, Math.floor((p - 0.12) / 0.16));
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const colors = useThemeColors();
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!inView || !intro) return;
    const t = setInterval(() => setW((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [inView, intro]);

  return (
    <section id="top" ref={ref} className="relative h-[560vh]" aria-label="MBO Solutions: як народжується ваш сайт">
      <div className="grain sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--t-line)_1px,transparent_1px),linear-gradient(90deg,var(--t-line)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_60%_45%,#000,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute top-[38%] left-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[140px] lg:left-[68%]" style={{ background: "radial-gradient(circle, var(--t-glow), transparent 65%)" }} />

        <Suspense fallback={null}>
          <Scene3D
            progress={scrollYProgress}
            stage={stage}
            accent={colors.accent}
            light={colors.light}
            active={inView}
            fallback={<div className="absolute inset-y-0 right-0 hidden w-1/2 items-center p-10 lg:flex"><BuildDemo stage={stage} /></div>}
          />
        </Suspense>

        <div className="wrap pointer-events-none relative z-10 flex h-full flex-col justify-end pb-24 lg:grid lg:grid-cols-2 lg:items-center lg:pb-0">
          <AnimatePresence mode="wait">
            {intro ? (
              <motion.div key="intro" exit={{ opacity: 0, y: -30, filter: "blur(8px)" }} transition={{ duration: 0.35 }} className="pointer-events-auto flex flex-col items-start max-lg:rounded-[28px] max-lg:bg-[color-mix(in_srgb,var(--t-bg)_70%,transparent)] max-lg:p-5 max-lg:backdrop-blur-xl">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-6 inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[13px]">
                  <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent"><Star className="size-3 fill-current" aria-hidden />5.0</span>
                  на Fiverr · Україна і весь світ
                </motion.span>
                <h1 className="self-stretch text-[clamp(40px,6.4vw,88px)] leading-[.98] font-semibold tracking-[-.045em]">
                  <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>Сайти, що</motion.span>
                  <span className="relative block h-[1.08em] overflow-hidden text-accent">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={w} className="absolute inset-x-0 top-0 whitespace-nowrap" initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}>
                        {words[w]}.
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 max-w-[500px] text-[17px] leading-relaxed text-fg-2 lg:text-lg">
                  Лендінг від 3 000 грн за 2–3 дні. Дизайн під ваш бізнес, швидкий сайт на телефоні та заявки прямо у ваш Telegram.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-wrap gap-3">
                  <a href="#contact" className={btnAccent}>Обговорити проєкт<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></a>
                  <button type="button" onClick={onConcept} className={btnGhost}><Gift className="size-4 text-accent" aria-hidden />Концепт безкоштовно</button>
                </motion.div>
                <a href={TG} target="_blank" rel="noopener" className="mt-5 hidden items-center gap-1.5 text-sm text-fg-2 hover:text-fg sm:inline-flex">
                  <Send className="size-3.5" aria-hidden />Або просто напишіть нам у Telegram<ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              </motion.div>
            ) : (
              <motion.div key={stage} initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -24, filter: "blur(8px)" }} transition={{ duration: 0.4 }} className="pointer-events-auto max-lg:rounded-[28px] max-lg:bg-[color-mix(in_srgb,var(--t-bg)_70%,transparent)] max-lg:p-5 max-lg:backdrop-blur-xl">
                <p className="eyebrow">Крок {stage + 1} / 5</p>
                <p className="mt-4 text-[clamp(40px,6vw,84px)] leading-none font-semibold tracking-[-.045em]">{steps[stage].title}</p>
                <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-fg-2 lg:text-lg">{steps[stage].text}</p>
                {stage === 4 && (
                  <motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} href="#contact" className={`${btnAccent} mt-7`}>Хочу такий сайт<ArrowRight className="size-4" aria-hidden /></motion.a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* step progress + scroll hint */}
        <div className="wrap pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-center gap-4">
          <div className="relative h-px flex-1 bg-[var(--t-line-2)]">
            <motion.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: bar }} />
          </div>
          <AnimatePresence>
            {intro && (
              <motion.span exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-fg-3">
                Гортайте<motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><ChevronDown className="size-4" aria-hidden /></motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
