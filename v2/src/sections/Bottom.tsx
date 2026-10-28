import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Check, Clock, Camera, Gift, Loader2, Mail, Phone, Plus, Send, ShieldCheck, Star } from "lucide-react";
import { CountUp, Logo, Reveal, SplitTitle, btnAccent } from "../ui";
import { FIVERR, PHONE, TG, faq, guarantees, plans, types, type ProjectType } from "../data";
import { sourceLines, track } from "../track";

export function Pricing({ onPick }: { onPick: (t: ProjectType) => void }) {
  return (
    <section id="pricing" className="wrap py-28 md:py-36">
      <p className="eyebrow">Ціни</p>
      <SplitTitle text="Прозорі пакети без сюрпризів" className="h2 mt-4 max-w-[760px]" />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((p, i) => {
          const hot = "hot" in p && p.hot;
          return (
            <Reveal key={p.name} delay={i * 0.1} className="h-full">
              <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative flex h-full flex-col rounded-[32px] p-7 ${hot ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>
                {hot && <span className="absolute top-6 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-on-accent">Обирають найчастіше</span>}
                <p className="text-lg font-semibold">{p.name}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className={`text-sm ${hot ? "text-on-ink/50" : "text-fg-3"}`}>від</span>
                  <CountUp to={p.price} className="text-[56px] leading-none font-light tracking-[-.04em] tabular-nums" />
                  <span className="text-xl font-light opacity-60">₴</span>
                </div>
                <p className={`mt-3 inline-flex items-center gap-1.5 text-sm ${hot ? "text-on-ink/60" : "text-fg-2"}`}><Clock className="size-4" aria-hidden />{p.days}</p>
                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[15px]"><Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />{it}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => onPick(p.type)} className={`mt-8 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[.97] ${hot ? "bg-accent text-on-accent" : "border border-line-2 hover:bg-card-2"}`}>
                  Обрати «{p.name}»<ArrowRight className="size-4" aria-hidden />
                </button>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
      <Reveal className="mt-6 flex flex-wrap gap-2">
        {guarantees.map((g) => (
          <span key={g} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-fg-2"><ShieldCheck className="size-4 text-accent" aria-hidden />{g}</span>
        ))}
      </Reveal>
    </section>
  );
}

// Bento: real review, first-client discount, free concept, founder
export function Proof({ onConcept }: { onConcept: () => void }) {
  return (
    <section id="about" aria-label="Відгуки та пропозиції" className="wrap relative grid gap-4 pb-28 md:grid-cols-6 md:pb-36">
      <span id="gift" className="absolute top-0" aria-hidden="true" />
      <Reveal className="md:col-span-4">
        <a href={FIVERR} target="_blank" rel="noopener" className="group flex h-full flex-col justify-between gap-8 rounded-[32px] border border-line bg-card p-7 md:p-9">
          <div className="flex items-center justify-between">
            <span className="flex gap-1 text-[#ffb33e]">{[0, 1, 2, 3, 4].map((i) => <motion.span key={i} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 400, damping: 14 }}><Star className="size-5 fill-current" aria-hidden /></motion.span>)}</span>
            <span className="text-xl font-extrabold tracking-[-.04em]">fiverr<span className="text-[#1dbf73]">.</span></span>
          </div>
          <blockquote>
            <p lang="en" className="text-[clamp(22px,2.6vw,32px)] leading-snug font-medium tracking-tight">“Everything was done very quickly and efficiently, with no issues or complaints at all. Great communication and excellent work.”</p>
            <p className="mt-4 text-fg-2">«Усе зроблено дуже швидко і якісно, без жодних зауважень. Чудова комунікація і відмінна робота».</p>
          </blockquote>
          <p className="flex items-center justify-between text-sm text-fg-3">Клієнтка з України · виправлення помилок на сайті за 1 день<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></p>
        </a>
      </Reveal>
      <Reveal delay={0.1} className="md:col-span-2">
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[32px] bg-accent p-7 text-on-accent">
          <motion.span aria-hidden className="absolute -right-10 -bottom-12 text-[180px] leading-none font-light opacity-15" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }}>%</motion.span>
          <p className="text-sm font-semibold">Для перших клієнтів</p>
          <div>
            <p className="text-[64px] leading-none font-light tracking-[-.05em]">−15%</p>
            <p className="mt-3 text-[15px] opacity-80">в обмін на чесний відгук і дозвіл показати сайт у наших роботах</p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.05} className="md:col-span-3">
        <button type="button" onClick={onConcept} className="group flex h-full w-full cursor-pointer items-center gap-5 rounded-[32px] border border-line bg-card p-7 text-left">
          <motion.span whileHover={{ rotate: -12, scale: 1.1 }} className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-on-ink"><Gift className="size-6" aria-hidden /></motion.span>
          <span>
            <span className="block text-lg font-semibold">Концепт першого екрана безкоштовно</span>
            <span className="mt-1 block text-fg-2">Покажемо ваш майбутній сайт ще до оплати</span>
          </span>
          <ArrowRight className="ml-auto size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
      </Reveal>
      <Reveal delay={0.1} className="md:col-span-3">
        <div className="flex h-full items-center gap-5 rounded-[32px] border border-line bg-card p-5">
          <img src="/assets/img/founder.webp" alt="Богдан Мудрик" loading="lazy" className="size-20 shrink-0 rounded-2xl object-cover object-top" />
          <div>
            <p className="text-lg font-semibold">Богдан Мудрик</p>
            <p className="mt-1 text-fg-2">Засновник. Працюєте напряму зі мною, без менеджерів-посередників.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="wrap grid gap-10 pb-28 md:pb-36 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="eyebrow">Питання</p>
        <SplitTitle text="Відповідаємо чесно" className="h2 mt-4" />
      </div>
      <div className="flex flex-col">
        {faq.map(([q, a], i) => (
          <div key={q} className="border-b border-line">
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-lg font-semibold">
              {q}
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors ${open === i ? "border-accent bg-accent text-on-accent" : "border-line-2"}`}><Plus className="size-4" aria-hidden /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }} className="overflow-hidden pr-12 text-fg-2">
                  <span className="block pb-5">{a}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

const direct = [
  { href: TG, label: "Telegram", Icon: Send },
  { href: `tel:${PHONE}`, label: "+380 63 664 06 06", Icon: Phone },
  { href: `viber://chat?number=%2B380636640606`, label: "Viber", Icon: Phone },
  { href: "https://instagram.com/mbo.solutions", label: "Instagram", Icon: Camera },
  { href: "mailto:hello@mbo-solutions.com", label: "hello@mbo-solutions.com", Icon: Mail },
];

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ type, setType }: { type: ProjectType; setType: (t: ProjectType) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    const lines = [`Що потрібно: ${type}`, `Ім’я: ${f.get("name")}`, `Контакт: ${f.get("contact")}`];
    const msg = String(f.get("msg") || "").trim();
    if (msg) lines.push(`\nПро проєкт:\n${msg}`);
    lines.push(...sourceLines());
    try {
      const r = await fetch("/lead.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: `Заявка з сайту: ${type}`, lines, page: location.pathname, website: f.get("website") }) });
      const j = await r.json().catch(() => ({}));
      const ok = r.ok && j.ok;
      setStatus(ok ? "sent" : "error");
      if (ok) track("lead", "form", String(f.get("contact") || ""));
    } catch { setStatus("error"); }
  };
  const field = "min-h-13 w-full rounded-2xl border border-line-2 bg-card px-4 text-base outline-none transition-colors placeholder:text-fg-3 focus:border-accent";

  return (
    <section id="contact" className="wrap relative pb-28 md:pb-36">
      <span id="quiz" className="absolute top-0" aria-hidden="true" />
      <div className="relative grid gap-10 overflow-hidden rounded-[40px] border border-line bg-bg-2 p-6 md:p-12 lg:grid-cols-[1fr_1.2fr]">
        <span aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full opacity-50 blur-[120px]" style={{ background: "var(--t-glow)" }} />
        <div className="relative">
          <p className="eyebrow">Контакти</p>
          <SplitTitle text="Обговоримо ваш проєкт?" className="h2 mt-4" />
          <p className="mt-5 max-w-[420px] text-fg-2">Залиште заявку або напишіть напряму. Підкажемо рішення і чесно скажемо, скільки це коштуватиме.</p>
          <ul className="mt-8 flex flex-col gap-1">
            {direct.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="group flex items-center gap-3 rounded-2xl py-2 text-[17px] transition-colors hover:text-accent">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-line-2 transition-colors group-hover:border-accent"><Icon className="size-[18px]" aria-hidden /></span>{label}
                </a>
              </li>
            ))}
            <li>
              <a href={FIVERR} target="_blank" rel="noopener" className="group flex items-center gap-3 rounded-2xl py-2 text-[17px] transition-colors hover:text-[#1dbf73]">
                <span className="flex size-10 items-center justify-center rounded-xl border border-line-2 text-[13px] font-extrabold transition-colors group-hover:border-[#1dbf73]">fi</span>Fiverr · для замовлень з-за кордону
              </a>
            </li>
          </ul>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }} className="flex size-20 items-center justify-center rounded-full bg-accent text-on-accent">
                  <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5 }} /></svg>
                </motion.span>
                <p className="text-2xl font-semibold">Заявку отримано</p>
                <p className="max-w-[320px] text-fg-2">Зв’яжемося з вами найближчим часом.</p>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={submit} className="flex flex-col gap-5">
                <fieldset>
                  <legend className="mb-3 text-sm text-fg-2">Що потрібно</legend>
                  <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                      <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={`relative min-h-11 cursor-pointer rounded-full px-4 text-[15px] transition-colors ${type === t ? "text-on-accent" : "border border-line-2 hover:bg-card-2"}`}>
                        {type === t && <motion.span layoutId="type-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                        <span className="relative">{t === "Безкоштовний концепт" ? "🎁 " : ""}{t}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="flex flex-col gap-2 text-sm text-fg-2">Ваше ім’я<input name="name" required autoComplete="name" className={field} placeholder="Як до вас звертатися" /></label>
                <label className="flex flex-col gap-2 text-sm text-fg-2">Телефон або Telegram<input name="contact" required autoComplete="tel" className={field} placeholder="+380 або @username" /></label>
                <label className="flex flex-col gap-2 text-sm text-fg-2">Коротко про бізнес <span className="sr-only">(необов’язково)</span><textarea name="msg" rows={3} className={`${field} py-3`} placeholder="Чим займаєтесь і що хочете від сайту" /></label>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
                <button type="submit" disabled={status === "sending"} className={`${btnAccent} min-h-14 text-base disabled:opacity-70`}>
                  {status === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <>Надіслати заявку<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></>}
                </button>
                {status === "error" && (
                  <p role="alert" className="text-sm text-fg-2">Не вдалося надіслати. Напишіть нам у <a className="text-accent underline" href={TG} target="_blank" rel="noopener">Telegram</a> або подзвоніть <a className="text-accent underline" href={`tel:${PHONE}`}>+380 63 664 06 06</a>.</p>
                )}
                <p className="text-xs text-fg-3">Надсилаючи заявку, ви погоджуєтесь з <a href="/privacy.html" className="underline">політикою конфіденційності</a>.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="wrap flex flex-col items-start justify-between gap-6 border-t border-line py-10 text-sm text-fg-3 md:flex-row md:items-center">
      <Logo className="h-5 w-auto text-fg" />
      <nav aria-label="Корисне" className="flex flex-wrap gap-x-6 gap-y-2">
        <a href="/calculator.html" className="hover:text-fg">Калькулятор вартості</a>
        <a href="/audit.html" className="hover:text-fg">Безкоштовний аудит</a>
        <a href="/guides/" className="hover:text-fg">Гайди</a>
        <a href="/privacy.html" className="hover:text-fg">Конфіденційність</a>
      </nav>
      <p>© 2026 MBO Solutions</p>
    </footer>
  );
}

// Phones: a bottom bar with the main action appears after the first screen
export function MobileBar() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShow(v > 600));
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="glass fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-full p-1.5 md:hidden" style={{ background: "color-mix(in srgb, var(--t-bg) 80%, transparent)" }}>
          <a href="#contact" className={`${btnAccent} flex-1`}>Обговорити проєкт</a>
          <a href={TG} target="_blank" rel="noopener" aria-label="Написати в Telegram" className="flex size-12 items-center justify-center rounded-full bg-[#2aabee] text-white"><Send className="size-5" aria-hidden /></a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
