// Google Ads / GA4 tracking, same events as the old site. IDs live in /js/config.js (window.MBO_TRACKING).

type Tracking = { adsId?: string; leadLabel?: string; callLabel?: string; ga4Id?: string };
declare global {
  interface Window { MBO_TRACKING?: Tracking; dataLayer: unknown[] }
}

const T: Tracking = (typeof window !== "undefined" && window.MBO_TRACKING) || {};
const on = !!(T.adsId || T.ga4Id);
function gtag(..._args: unknown[]) {
  // gtag.js expects the `arguments` object itself, not an array
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

// Where the visitor came from (ad click id + UTM), kept for the whole visit and added to leads
const KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
let source: Record<string, string> = {};

export function initTracking() {
  window.dataLayer = window.dataLayer || [];
  try { source = JSON.parse(sessionStorage.getItem("mbo-source") || "{}"); } catch { /* private mode */ }
  const params = new URLSearchParams(location.search);
  const fresh: Record<string, string> = {};
  KEYS.forEach((k) => { const v = params.get(k); if (v) fresh[k] = v; });
  if (Object.keys(fresh).length) source = fresh;
  try { sessionStorage.setItem("mbo-source", JSON.stringify(source)); } catch { /* private mode */ }

  if (on) {
    gtag("js", new Date());
    if (T.adsId) gtag("config", T.adsId);
    if (T.ga4Id) gtag("config", T.ga4Id);
    // load Google's script when the page is idle so it never slows the first screen
    const load = () => {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${T.adsId || T.ga4Id}`;
      document.head.appendChild(s);
    };
    const later = () => ("requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 1500));
    if (document.readyState === "complete") later();
    else addEventListener("load", later, { once: true });
  }

  // calls, Viber, Telegram, email, Instagram and Fiverr clicks
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const method = href.startsWith("tel:") ? "phone"
      : href.startsWith("viber:") ? "viber"
      : href.includes("t.me/") ? "telegram"
      : href.startsWith("mailto:") ? "email"
      : href.includes("instagram.com") ? "instagram"
      : href.includes("fiverr.com") ? "fiverr" : "";
    if (method) track("contact", method);
  });
}

export function sourceLines(): string[] {
  if (!Object.keys(source).length) return [];
  const ad = source.gclid || source.gbraid || source.wbraid ? "Google Реклама" : "";
  const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_term"].map((k) => source[k]).filter(Boolean).join(" / ");
  return ["", `Джерело: ${[ad, utm].filter(Boolean).join(" · ")}`];
}

// Enhanced conversions: phone or email from the contact field (Google hashes it before sending)
function userData(contact: string) {
  const v = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { email: v.toLowerCase() };
  if (!/^[\d\s()+-]+$/.test(v)) return null;
  let d = v.replace(/\D/g, "");
  if (d.length < 9 || d.length > 15) return null;
  if (d.length === 10 && d.startsWith("0")) d = "38" + d;
  if (d.length === 9) d = "380" + d;
  return { phone_number: "+" + d };
}

export function track(kind: "lead" | "contact", method: string, contact = "") {
  if (!on) return;
  const ud = kind === "lead" && userData(contact);
  if (ud) gtag("set", "user_data", ud);
  const label = kind === "lead" ? T.leadLabel : T.callLabel;
  if (T.adsId && label) gtag("event", "conversion", { send_to: `${T.adsId}/${label}` });
  gtag("event", kind === "lead" ? "generate_lead" : "contact", { method });
}
