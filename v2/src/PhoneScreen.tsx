import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";

// What the 3D phone shows: a client site going from brief to first lead.
// Rendered as DOM (320×660 css px) and projected onto the phone's screen.

const brief = ["Ніша: детейлінг", "Мета: запис онлайн", "Стиль: преміум", "Термін: 3 дні"];
const packs = [["Експрес", "1 200 ₴"], ["Полірування", "4 500 ₴"], ["Кераміка", "9 000 ₴"]];

function T({ on, i, className = "", children }: { on: boolean; i: number; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-[6px] transition-[color,background-color] duration-700 ${on ? "" : "!text-transparent bg-white/10"} ${className}`}
      style={{ transitionDelay: on ? `${i * 70}ms` : "0ms" }}
    >
      {children}
    </span>
  );
}

export default function PhoneScreen({ stage }: { stage: number }) {
  const built = stage >= 1;
  const on = stage >= 2;
  const fast = stage >= 3;
  const live = stage >= 4;
  return (
    <div className="relative h-[660px] w-[320px] overflow-hidden rounded-[44px] bg-[#0e0e11] font-sans text-white select-none">
      {/* status bar */}
      <div className="flex h-12 items-center justify-between px-7 pt-2 text-[13px] font-semibold">
        <span>9:41</span>
        <span className="h-[26px] w-[92px] rounded-full bg-black" />
        <span className="flex gap-1"><i className="h-2.5 w-4 rounded-sm bg-white/80" /></span>
      </div>
      {/* page load bar on the "development" step */}
      <motion.span className="absolute top-12 left-0 h-[2px] bg-[#ff8a3d]" initial={false} animate={{ width: fast ? "100%" : "0%", opacity: fast ? [1, 1, 0] : 0 }} transition={{ duration: 1.1 }} />

      <AnimatePresence>
        {stage === 0 && (
          <motion.div key="brief" exit={{ opacity: 0, y: -10 }} className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-7">
            <span className="mb-2 text-xs tracking-[.2em] text-white/40 uppercase">Бриф</span>
            {brief.map((b, i) => (
              <motion.span key={b} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.22 }} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[15px]">
                {b}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {built && (
        <motion.div initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="flex flex-col gap-4 px-5 pt-2">
          <motion.div variants={pop} className="flex items-center justify-between text-[12px]">
            <T on={on} i={0} className="font-extrabold tracking-[.2em]">GLOSSLAB</T>
            <span className={`rounded-full px-3 py-1.5 font-semibold transition-colors duration-700 ${on ? "bg-[#ff8a3d] text-black" : "bg-white/10 text-transparent"}`}>Запис</span>
          </motion.div>
          <motion.div variants={pop} className="flex flex-col items-start gap-2">
            <T on={on} i={1} className="text-[27px] leading-[1.1] font-bold">Блиск, який</T>
            <T on={on} i={2} className="text-[27px] leading-[1.1] font-bold">видно здалеку</T>
            <T on={on} i={3} className="mt-1 text-[13px] text-white/55">Полірування та кераміка у Львові</T>
            <span className={`mt-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors duration-700 ${on ? "bg-[#ff8a3d] text-black" : "bg-white/10 text-transparent"}`}>Записатися онлайн</span>
          </motion.div>
          <motion.div variants={pop} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/[.06]">
            <svg className="absolute inset-0 size-full text-white/10" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M0 0L100 100M100 0L0 100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={false}
              animate={{ clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}
              transition={{ duration: 0.9, ease: [0.77, 0, 0.18, 1], delay: on ? 0.3 : 0 }}
              style={{ background: "radial-gradient(120% 90% at 70% 110%, #ff8a3d 0%, #7a2e12 35%, #15100e 70%)" }}
            >
              <svg viewBox="0 0 200 80" className="absolute bottom-[12%] left-1/2 w-[86%] -translate-x-1/2 text-black/75" aria-hidden="true">
                <path fill="currentColor" d="M10 62c0-8 6-12 16-14l30-6c10-10 26-20 48-20 22 0 38 8 52 20l22 4c8 2 12 6 12 12v6H10Z" />
                <circle cx="52" cy="66" r="11" fill="#111" /><circle cx="152" cy="66" r="11" fill="#111" />
              </svg>
              <motion.span
                className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={on ? { left: ["-40%", "130%"] } : { left: "-40%" }}
                transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
          <div className="flex flex-col gap-2">
            {packs.map(([n, p], k) => (
              <motion.div key={n} variants={pop} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-700 ${on ? "border-white/10 bg-white/[.04]" : "border-transparent bg-white/[.06]"}`}>
                <T on={on} i={5 + k} className="text-[14px] text-white/70">{n}</T>
                <T on={on} i={6 + k} className="text-[15px] font-bold">{p}</T>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* the first lead drops in like a real push notification */}
      <AnimatePresence>
        {live && (
          <motion.div
            key="push"
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.2 }}
            className="absolute inset-x-3 top-14 flex items-start gap-3 rounded-[22px] bg-[#2a2a30]/95 p-3.5 shadow-2xl backdrop-blur"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2aabee]"><Send className="size-5" aria-hidden /></span>
            <span className="flex min-w-0 flex-col">
              <span className="flex justify-between text-[12px] text-white/50"><b className="font-semibold text-white/80">Telegram</b>щойно</span>
              <span className="text-[14px] leading-snug font-semibold">Нова заявка з сайту</span>
              <span className="text-[13px] leading-snug text-white/70">Олег, BMW X5, кераміка. Передзвоніть, будь ласка</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const pop = { hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
