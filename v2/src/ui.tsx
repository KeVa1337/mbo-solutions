import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 -2 154 44" className={className} fill="currentColor" role="img" aria-label="MBO Solutions">
      <path d="M0 40V0h9.5L25 21.5 40.5 0H50v40h-8V12.6L25 36 8 12.6V40Z" />
      <path fillRule="evenodd" d="M58 0h28.5C94.4 0 99.5 4.3 99.5 10.6c0 4-2 7-5.6 8.5 4.6 1.4 7.6 5 7.6 10.2 0 6.6-5.4 10.7-13.4 10.7H58Zm8 7v9h19.3c3.4 0 5.4-1.7 5.4-4.5S88.7 7 85.3 7Zm0 16v10h21.2c3.8 0 6-1.9 6-5s-2.2-5-6-5Z" />
      <path fillRule="evenodd" d="M108 20c0-11.6 10-20 22.5-20S153 8.4 153 20s-10 20-22.5 20S108 31.6 108 20Zm8 0c0 7.4 6.4 12.8 14.5 12.8S145 27.4 145 20s-6.4-12.8-14.5-12.8S116 12.6 116 20Z" />
    </svg>
  );
}

// Theme switch with a circular reveal from the button (View Transitions where supported).
// First-time visitors get a one-off hint that a dark theme exists.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(true);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    setLight(document.documentElement.dataset.theme !== "dark");
    let seen = true;
    try { seen = !!(localStorage.getItem("mbo-theme") || localStorage.getItem("mbo-theme-hint")); } catch { /* private mode: skip the hint */ }
    if (seen) return;
    const show = setTimeout(() => setHint(true), 1400);
    const hide = setTimeout(() => dismiss(), 9000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);
  const dismiss = () => {
    setHint(false);
    try { localStorage.setItem("mbo-theme-hint", "1"); } catch { /* private mode */ }
  };

  const flip = (e: React.MouseEvent) => {
    dismiss();
    const next = !light;
    const apply = () => {
      document.documentElement.dataset.theme = next ? "light" : "dark";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next ? "#f5f4fa" : "#0c0c0f");
      try { localStorage.setItem("mbo-theme", next ? "light" : "dark"); } catch { /* private mode */ }
      setLight(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
    const r = Math.hypot(Math.max(e.clientX, innerWidth - e.clientX), Math.max(e.clientY, innerHeight - e.clientY));
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${e.clientX}px ${e.clientY}px)`, `circle(${r}px at ${e.clientX}px ${e.clientY}px)`] },
        { duration: 550, easing: "cubic-bezier(.77,0,.18,1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={flip} aria-label={light ? "Увімкнути темну тему" : "Увімкнути світлу тему"} className={`relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-line-2 transition-colors hover:bg-card-2 ${className}`}>
        {hint && <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-accent" animate={{ scale: [1, 1.7], opacity: [0.9, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />}
        <motion.span key={String(light)} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          {light ? <Moon className="size-[18px]" aria-hidden /> : <Sun className="size-[18px]" aria-hidden />}
        </motion.span>
      </button>
      <AnimatePresence>
        {hint && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed inset-x-4 top-[72px] z-50 origin-top rounded-2xl bg-ink p-4 text-on-ink shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-3 sm:w-[280px] sm:origin-top-right"
          >
            {/* on phones the hint spans the screen under the header; from sm up it hangs from the toggle with an arrow */}
            <span aria-hidden className="absolute -top-1.5 right-[14px] hidden size-3 rotate-45 bg-ink sm:block" />
            <p className="flex items-center gap-2 text-[15px] font-semibold"><Moon className="size-4" aria-hidden />Є темна тема</p>
            <p className="mt-1 text-sm text-on-ink/70">Сайт можна перемкнути на темний вигляд цією кнопкою.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={flip} className="min-h-10 flex-1 cursor-pointer rounded-full bg-accent px-3 text-sm font-semibold text-on-accent">Спробувати</button>
              <button type="button" onClick={dismiss} className="min-h-10 cursor-pointer rounded-full px-3 text-sm text-on-ink/70 hover:text-on-ink">Зрозуміло</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fade-and-rise when the block scrolls into view
export function Reveal({ children, delay = 0, className = "", y = 28 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Heading whose words rise out of a mask one after another
export function SplitTitle({ text, className = "", as = "h2" }: { text: string; className?: string; as?: "h1" | "h2" }) {
  const words = text.split(" ");
  const Tag = as === "h1" ? motion.h1 : motion.h2;
  // the heading itself is observed: the word spans start clipped by their masks, so they never count as visible
  return (
    <Tag className={className} aria-label={text} initial="hide" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ staggerChildren: 0.06 }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[.08em] align-bottom">
          <motion.span className="inline-block" variants={{ hide: { y: "110%" }, show: { y: 0, transition: { duration: 0.75, ease: [0.2, 0.7, 0.2, 1] } } }}>
            {w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// Number that counts up when it first appears
export function CountUp({ to, decimals = 0, className = "" }: { to: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const fmt = (v: number) => v.toLocaleString("uk-UA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  useEffect(() => {
    if (!seen || !ref.current) return;
    if (reduce) { ref.current.textContent = fmt(to); return; }
    const c = animate(0, to, { duration: 1.4, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = fmt(v); } });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return <span ref={ref} className={className}>{fmt(0)}</span>;
}

export const btnAccent = "group inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent shadow-[0_12px_40px_-12px_var(--t-glow)] transition-transform active:scale-[.97]";
export const btnGhost = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-2 px-6 font-semibold transition-colors hover:bg-card-2 active:scale-[.97]";
