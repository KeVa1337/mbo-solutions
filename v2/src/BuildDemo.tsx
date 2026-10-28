import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, Zap } from "lucide-react";

// A client site assembling itself: brief → wireframe → design → phone → first lead.
// The hero plays it on a loop; the process section drives `stage` from scroll.

export const stageNames = ["Бриф", "Структура", "Дизайн", "Розробка", "Запуск"];

const brief = ["Ніша: детейлінг", "Мета: запис онлайн", "Стиль: преміум", "Термін: 3 дні"];
const packs = [
  ["Експрес", "1 200 ₴"],
  ["Полірування", "4 500 ₴"],
  ["Кераміка", "9 000 ₴"],
];

// Text that is a grey skeleton bar until the design stage, then fades into real copy
function T({ on, i, className = "", children }: { on: boolean; i: number; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-[5px] transition-[color,background-color] duration-700 ${on ? "" : "!text-transparent bg-[var(--t-line-2)]"} ${className}`}
      style={{ transitionDelay: on ? `${i * 70}ms` : "0ms" }}
    >
      {children}
    </span>
  );
}

export default function BuildDemo({ stage }: { stage: number }) {
  const built = stage >= 1;
  const on = stage >= 2;
  const phone = stage >= 3;
  const live = stage >= 4;
  // on phones the demo is square and the phone frame wider, so overlays don't cover the page
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 640px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div className="relative flex aspect-square w-full items-center justify-center sm:aspect-[5/4]">
      {/* stage label */}
      <div className="absolute top-0 left-0 z-20 flex items-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={stage}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            className="rounded-full border border-line-2 px-2.5 py-0.5 text-xs font-semibold"
          >
            <span className="mr-1.5 font-mono text-fg-3">0{stage + 1}</span>{stageNames[stage]}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        className="@container relative overflow-hidden border border-line-2 shadow-[0_40px_120px_-40px_var(--t-glow)]"
        initial={false}
        animate={{
          width: phone ? (narrow ? "62%" : "44%") : "100%",
          height: phone ? "92%" : "80%",
          borderRadius: phone ? 34 : 20,
          backgroundColor: on ? "#0e0e11" : "var(--t-bg-2)",
        }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      >
        {/* browser bar or phone notch */}
        <div className="flex h-7 items-center gap-1.5 border-b border-white/5 px-3">
          {phone ? (
            <span className="mx-auto h-1.5 w-12 rounded-full bg-white/15" />
          ) : (
            <>
              {[0, 1, 2].map((d) => <span key={d} className="size-2 rounded-full bg-[var(--t-line-2)]" />)}
              <span className="ml-3 truncate rounded-md bg-[var(--t-line)] px-2 py-0.5 text-[10px] text-fg-3">glosslab.com.ua</span>
            </>
          )}
        </div>

        <AnimatePresence>
          {stage === 0 && (
            <motion.div key="brief" exit={{ opacity: 0, scale: 0.96 }} className="absolute inset-0 top-7 flex flex-col items-start justify-center gap-2.5 p-6">
              {brief.map((b, i) => (
                <motion.span
                  key={b}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.28 }}
                  className="rounded-full border border-line-2 bg-card-2 px-3 py-1.5 text-[13px] font-medium"
                >
                  {b}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {built && (
          <motion.div
            initial="hide"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="flex flex-col gap-3 p-3 text-white @md:gap-4 @md:p-5"
          >
            {/* nav */}
            <motion.div variants={pop} className="flex items-center justify-between gap-2 text-[10px] @md:text-[11px]">
              <T on={on} i={0} className="font-extrabold tracking-[.18em]">GLOSSLAB</T>
              <span className="hidden gap-3 @md:flex">
                <T on={on} i={1} className="text-white/60">Послуги</T>
                <T on={on} i={2} className="text-white/60">Роботи</T>
                <T on={on} i={3} className="text-white/60">Ціни</T>
              </span>
              <span className={`rounded-full px-2.5 py-1 font-semibold transition-colors duration-700 ${on ? "bg-[#ff8a3d] text-black" : "bg-[var(--t-line-2)] text-transparent"}`}>Запис</span>
            </motion.div>

            {/* hero */}
            <div className="grid gap-3 @md:grid-cols-[1.1fr_1fr] @md:items-center">
              <motion.div variants={pop} className="flex flex-col items-start gap-1.5 @md:gap-2">
                <T on={on} i={4} className="text-[17px] leading-tight font-bold @md:text-[22px]">Блиск, який</T>
                <T on={on} i={5} className="text-[17px] leading-tight font-bold @md:text-[22px]">видно здалеку</T>
                <T on={on} i={6} className="mt-1 text-[10px] text-white/55 @md:text-[11px]">Полірування та кераміка у Львові</T>
                <span className={`mt-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-colors duration-700 @md:text-[11px] ${on ? "bg-[#ff8a3d] text-black" : "bg-[var(--t-line-2)] text-transparent"}`}>Записатися онлайн</span>
              </motion.div>
              <motion.div variants={pop} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--t-line)]">
                {/* wireframe cross until the photo is revealed */}
                <svg className="absolute inset-0 size-full text-[var(--t-line-2)]" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M0 0L100 100M100 0L0 100" stroke="currentColor" strokeWidth=".6" vectorEffect="non-scaling-stroke" />
                </svg>
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  initial={false}
                  animate={{ clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}
                  transition={{ duration: 0.9, ease: [0.77, 0, 0.18, 1], delay: on ? 0.35 : 0 }}
                  style={{ background: "radial-gradient(120% 90% at 70% 110%, #ff8a3d 0%, #7a2e12 35%, #15100e 70%)" }}
                >
                  {/* car silhouette */}
                  <svg viewBox="0 0 200 80" className="absolute bottom-[14%] left-1/2 w-[78%] -translate-x-1/2 text-black/70" aria-hidden="true">
                    <path fill="currentColor" d="M10 62c0-8 6-12 16-14l30-6c10-10 26-20 48-20 22 0 38 8 52 20l22 4c8 2 12 6 12 12v6H10Z" />
                    <circle cx="52" cy="66" r="11" fill="#111" /><circle cx="152" cy="66" r="11" fill="#111" />
                    <path d="M62 40c10-9 24-14 40-14 15 0 27 5 37 14Z" fill="#ff8a3d" opacity=".25" />
                  </svg>
                  {/* polish shine sweeping across */}
                  <motion.span
                    className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    animate={on ? { left: ["-40%", "130%"] } : { left: "-40%" }}
                    transition={{ duration: 1.6, delay: 1.1, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* packages */}
            <div className="grid grid-cols-3 gap-2">
              {packs.map(([n, p], k) => (
                <motion.div key={n} variants={pop} className={`flex flex-col gap-1 rounded-lg border p-2 transition-colors duration-700 ${on ? "border-white/10 bg-white/[.04]" : "border-transparent bg-[var(--t-line)]"}`}>
                  <T on={on} i={8 + k} className="truncate text-[9px] text-white/60 @md:text-[10px]">{n}</T>
                  <T on={on} i={9 + k} className="text-[11px] font-bold @md:text-[13px]">{p}</T>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* speed badge once it is a real page */}
      <AnimatePresence>
        {phone && (
          <motion.div
            key="speed"
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            style={{ background: "color-mix(in srgb, var(--t-bg-2) 92%, transparent)" }} className="glass absolute bottom-[3%] left-0 z-10 flex items-center gap-2 rounded-2xl px-2.5 py-2 sm:bottom-[14%] sm:left-[2%] sm:gap-2.5 sm:px-3.5 sm:py-2.5"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-on-accent"><Zap className="size-4" aria-hidden /></span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tabular-nums">≈1 с</span>
              <span className="text-[11px] text-fg-2">відкривається на телефоні</span>
            </span>
          </motion.div>
        )}
        {live && (
          <motion.div
            key="lead"
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.25 }}
            style={{ background: "color-mix(in srgb, var(--t-bg-2) 94%, transparent)" }} className="glass absolute top-[10%] right-0 z-10 flex w-[min(270px,62%)] items-start gap-2.5 rounded-2xl p-3 shadow-xl"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2aabee] text-white">
              <Send className="size-4" aria-hidden />
              <motion.span className="absolute inset-0 rounded-xl border-2 border-[#2aabee]" animate={{ scale: [1, 1.6], opacity: [0.8, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />
            </span>
            <span className="flex min-w-0 flex-col text-left">
              <span className="text-[11px] text-fg-3">Telegram · щойно</span>
              <span className="text-[13px] leading-snug font-semibold">Нова заявка: Олег, BMW X5, кераміка</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const pop = { hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
