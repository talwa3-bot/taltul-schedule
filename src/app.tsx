import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

type InstallEvt = Event & { prompt?: () => Promise<void> | void };
type Opt = "date" | "dinner" | "mine" | "his" | "surprise" | "coffee" | "breakfast" | "football" | "beer" | "sleep" | "other";
type Extra = "withDate" | "sleepOnly";
type Place = "tal" | "idan";
type Pick = { time?: string; extra?: Extra; place?: Place; text?: string };

const C = {
  ivory: "#FAF3E6", ink: "#2B2326", muted: "#6B5E5A",
  wine: "#6E1F2F", gold: "#C9A86A", goldSoft: "#F1E4C6", line: "#E8D9BE", white: "#FFFDF8",
};
const g = (a: string, b: string) => `linear-gradient(180deg, ${a}, ${b})`;
const PAPER = g("#FFFBF3", "#FBF2E2");
const PAGE = `radial-gradient(circle at 20% 0%, #FFF8EC 0%, transparent 60%), linear-gradient(180deg, #FAF3E6, #F5EAD6)`;
const WINE = g("#7A2435", "#5E1827");
const GOLDG = g("#FBF3DF", "#F1E4C6");
const SERIF = "'Frank Ruhl Libre', 'David Libre', 'Times New Roman', serif";

const OPTS: Record<Opt, { label: string; emoji: string; title: string; dur: number; range: [string, string]; pop: string[] }> = {
  date: { label: "דייט", emoji: "🍷", title: "דייט עם טל", dur: 180, range: ["12:00", "22:00"], pop: ["אל תשכח לחשוב על מקום ;)", "אתה מתכנן, אני מתלבשת 💃", "רמז: אני אוהבת הפתעות קטנות 🌹"] },
  dinner: { label: "ארוחת ערב", emoji: "🍽️", title: "ארוחת ערב עם טל", dur: 150, range: ["18:00", "21:30"], pop: ["תזמין שולחן, אני מביאה תיאבון 😋", "רמז: אני לא אוכלת סלט בדייט 🍝", "קינוח עליי. אולי 😏"] },
  mine: { label: "לישון אצל טל", emoji: "🏠", title: "לישון אצל טל", dur: 0, range: ["20:00", "23:00"], pop: ["אל תשכח תחתונים 😜", "מברשת שיניים, אלוף. אני לא משתפת 🪥", "כרית שלך? לא צריך, יש לי שתיים 😏"] },
  his: { label: "לישון אצל עידן", emoji: "🛌", title: "טל ישנה אצל עידן", dur: 0, range: ["20:00", "23:00"], pop: ["תסדר קצת את הבית, אני שופטת 😜", "מגבת נקייה תתקבל בברכה 🛁", "קפה בבוקר עליך ☕"] },
  surprise: { label: "תפתיעי אותי", emoji: "🎁", title: "הפתעה עם טל", dur: 180, range: ["07:00", "23:00"], pop: ["אני סומכת עליך. בערך 😅", "הפתעה טובה = נקודות כפולות 🎯", "תעשה את זה שווה 🎁"] },
  coffee: { label: "קפה", emoji: "☕", title: "קפה עם טל", dur: 60, range: ["07:00", "17:30"], pop: ["הפוך על חלב שקדים, ואתה כבר מכיר אותי ☕", "קפה איתך > קפה לבד", "אם יש גם עוגה, אני בכלל באה 🍰"] },
  breakfast: { label: "ארוחת בוקר", emoji: "🥐", title: "ארוחת בוקר עם טל", dur: 90, range: ["07:00", "11:30"], pop: ["מי שמביא קרואסון, מקבל נשיקה 🥐", "שקשוקה? אתה מבין עניין 🍳", "רק אל תעיר אותי לפני שמונה 😴"] },
  football: { label: "משחק כדורגל", emoji: "⚽", title: "משחק כדורגל עם טל", dur: 120, range: ["12:00", "21:00"], pop: ["רק שאתה מסביר לי מה זה נבדל ⚽", "אני אצעק כשכולם צועקים, סגור?", "אם הקבוצה שלך מפסידה, אני לא אשמה 😇"] },
  beer: { label: "בירה", emoji: "🍺", title: "בירה עם טל", dur: 120, range: ["15:00", "22:00"], pop: ["אחת. טוב, שתיים 🍺", "לחיים, לגבר שיוזם 🥂", "אתה בוחר בר, אני בוחרת שירים"] },
  sleep: { label: "לישון ביחד", emoji: "😴", title: "לישון ביחד", dur: 0, range: ["20:00", "23:00"], pop: ["אל תשכח תחתונים 😜", "צד ימין שלי, שתדע 😏", "מברשת שיניים, אלוף 🪥"] },
  other: { label: "אחר", emoji: "✏️", title: "טל ועידן", dur: 120, range: ["07:00", "23:00"], pop: ["יצירתי! אני אוהבת את זה ✨", "נו, תפתיע אותי במילים 😏", "רעיון מקורי = נקודות בונוס"] },
};
const WEEKDAY_OPTS: Opt[] = ["date", "dinner", "mine", "his", "surprise", "other"];
const WEEKEND_OPTS: Opt[] = ["coffee", "breakfast", "football", "beer", "dinner", "sleep", "date", "surprise", "other"];
const EXTRAS: { value: Extra; label: string; text: string }[] = [
  { value: "withDate", label: "🍷 כולל דייט", text: "כולל דייט" },
  { value: "sleepOnly", label: "😴 רק לישון ביחד", text: "רק לישון ביחד" },
];
const PLACES: { value: Place; label: string; text: string }[] = [
  { value: "tal", label: "🏠 אצל טל", text: "אצל טל" },
  { value: "idan", label: "🛌 אצל עידן", text: "אצל עידן" },
];

const toMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const fmt = (x: number) => `${Math.floor(x / 60)}:${x % 60 === 0 ? "00" : "30"}`;
const slots = (from: number, to: number): string[] => { const out: string[] = []; for (let x = Math.ceil(from / 30) * 30; x <= to; x += 30) out.push(fmt(x)); return out; };

type Day = { id: string; day: string; date: string; free: boolean; weekend: boolean; when: string; line: string; windows: [string, string][] };
const DAYS: Day[] = [
  { id: "tue", day: "שלישי", date: "3.11", free: true, weekend: false, when: "מ-20:00", line: "הערב. כן, כבר היום. תפתיע אותי", windows: [["20:00", "22:30"]] },
  { id: "wed", day: "רביעי", date: "4.11", free: true, weekend: false, when: "מ-22:00", line: "משבצת לילה מאוחרת, אחרי הבנות", windows: [["22:00", "23:00"]] },
  { id: "thu", day: "חמישי", date: "5.11", free: true, weekend: false, when: "מ-22:00", line: "חמישי בלילה, משבצת לילה מאוחרת. נו באמת, מה עוד צריך", windows: [["22:00", "23:00"]] },
  { id: "fri", day: "שישי", date: "6.11", free: true, weekend: true, when: "בבוקר, עד 14:00", line: "בוקר שישי פנוי. אחר הצהריים אני נעלמת לכמה שעות של שקט", windows: [["07:00", "09:00"], ["10:00", "14:00"]] },
  { id: "sat", day: "שבת", date: "7.11", free: true, weekend: true, when: "מ-15:00", line: "חוזרת אחר הצהריים רגועה ומוכנה לפינוק", windows: [["15:00", "23:00"]] },
  { id: "sun", day: "ראשון", date: "8.11", free: false, weekend: false, when: "", line: "לומדת עד הלילה. חנונית אבל חמודה 📚", windows: [] },
  { id: "mon", day: "שני", date: "9.11", free: false, weekend: false, when: "", line: "עסוקה עד מאוחר, אוספת השראה 🎤", windows: [] },
];
const FREE = DAYS.filter((d) => d.free);
const isSleepOpt = (o: Opt) => o === "mine" || o === "his" || o === "sleep";
const timesFor = (d: Day, o: Opt): string[] => {
  if (!d.weekend) return d.windows.flatMap(([a, b]) => slots(toMin(a), toMin(b)));
  const [ra, rb] = OPTS[o].range;
  return d.windows.flatMap(([a, b]) => slots(Math.max(toMin(a), toMin(ra)), Math.min(isSleepOpt(o) ? toMin(b) : toMin(b) - 60, toMin(rb))));
};
const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (dt: Date) => `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
const calTimes = (date: string, tm: string, o: Opt) => {
  const [dd, mm] = date.split(".").map(Number);
  const [h, m] = tm.split(":").map(Number);
  const s = new Date(Date.UTC(2026, mm - 1, dd, h, m));
  const e = isSleepOpt(o) ? new Date(Date.UTC(2026, mm - 1, dd + 1, 8, 0)) : new Date(s.getTime() + OPTS[o].dur * 60000);
  return { start: stamp(s), end: stamp(e) };
};
const titleFor = (o: Opt, p: Pick) => {
  if (o === "other") return p.text ? `${p.text} – טל ועידן` : "טל ועידן";
  let t = OPTS[o].title;
  if (o === "sleep") t = p.place === "idan" ? "טל ישנה אצל עידן" : p.place === "tal" ? "לישון אצל טל" : "לישון ביחד";
  if (isSleepOpt(o) && p.extra === "withDate") t += " + דייט";
  return t;
};
const lineFor = (d: Day, o: Opt, p: Pick) => {
  const parts = [`${OPTS[o].emoji} ${d.day} ${d.date} – ${o === "other" ? (p.text ? `אחר: ${p.text}` : "אחר") : OPTS[o].label}`];
  if (o === "sleep" && p.place) parts.push(PLACES.find((x) => x.value === p.place)?.text ?? "");
  const e = EXTRAS.find((x) => x.value === p.extra);
  if (isSleepOpt(o) && e) parts.push(e.text);
  if (p.time) parts.push(`מגיע ב-${p.time}`);
  return parts.join(", ");
};

const QUIPS = [
  "גבר שיוזם זה הדבר הכי סקסי אחרי גבר שמבשל", "אל תחשוב יותר מדי, אתה לא בוחר משכנתא", "הכפתורים האלה לא ילחצו את עצמם, אלוף",
  "רמז: אין תשובה לא נכונה. חוץ מלא לבחור כלום", "בחירה מצוינת. אתה מבין עניין", "וואו, גבר עם תוכנית. אני נמסה",
  "זה הרגע שבו אתה הופך לאגדה", "אתה בדרך הנכונה. ממש מרגישים את הביטחון", "הלו״ז שלי עמוס, אבל בשבילך יש מקום",
  "גם ברוס וויין היה צריך לתכנן את הערבים שלו", "מי שמגיע בזמן, מקבל נשיקה בכניסה", "שקט, אני מנסה לא להתרגש מזה",
  "יוזמה זה כמו כושר. כל פעם קל יותר", "אתה עושה את זה מעולה. ממשיך?", "גבר אמיתי לא מחכה שישאלו אותו",
  "אני כבר בוחרת מה ללבוש", "הבחירה הזאת? 10 מתוך 10, בלי ערעורים", "המשבצת הזאת חיכתה רק לך",
  "לא לחץ, אבל אני מסתכלת 👀", "פלוס נקודה ליוזמה, פלוס שתיים לטעם", "אם תבחר עוד ערב, אני מבשלת. אולי",
  "תכנון זה הסקסי החדש", "אתה בדרך לתואר ׳החבר של השבוע׳", "כל לחיצה פה שווה חיוך אצלי",
];
const iosSteps = ["פותחים את העמוד בספארי (מתוך וואטסאפ: ⋯ ← פתיחה בספארי)", "לוחצים על כפתור השיתוף, הריבוע עם החץ ⬆️", "בוחרים \"הוספה למסך הבית\"", "לוחצים \"הוסף\". זהו 😎"];
const androidSteps = ["פותחים את העמוד בכרום (מתוך וואטסאפ: ⋮ ← פתיחה בכרום)", "לוחצים על שלוש הנקודות ⋮", "בוחרים \"הוספה למסך הבית\"", "מאשרים \"הוסף\". זהו 😎"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&display=swap');
.tw-root, .tw-root * { color-scheme: light !important; box-sizing: border-box; }
.tw-root { background: ${PAGE} !important; color: ${C.ink} !important; }
.tw-card { background: ${PAPER} !important; color: ${C.ink} !important; animation: twFade .6s ease both; }
.tw-busy { background: ${g("#F3E9D8", "#EFE3CF")} !important; color: ${C.muted} !important; }
.tw-tile { background: ${PAPER} !important; color: ${C.wine} !important; transition: transform .15s ease; }
.tw-tile:active { transform: scale(.97); }
.tw-tile.on { background: ${WINE} !important; color: ${C.white} !important; }
.tw-chip { background: ${PAPER} !important; color: ${C.wine} !important; }
.tw-chip.on { background: ${WINE} !important; color: ${C.white} !important; }
.tw-ghost { background: ${PAPER} !important; color: ${C.ink} !important; }
.tw-sub { background: ${g("#FFF8EC", "#F8EDDA")} !important; color: ${C.ink} !important; }
.tw-input { background: #FFFDF8 !important; color: ${C.ink} !important; }
@keyframes twFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;

function App() {
  const sans = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";
  const [sel, setSel] = useState<Record<string, Partial<Record<Opt, Pick>>>>({});
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000));
  const [copied, setCopied] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [sent, setSent] = useState<boolean>(false);
  const [showHome, setShowHome] = useState<boolean>(false);
  const [installEvt, setInstallEvt] = useState<InstallEvt | null>(null);

  useEffect(() => { setSeed((s: number) => s + 1 + Math.floor(Math.random() * 5)); }, [sel]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 3500); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallEvt(e as InstallEvt); };
    window.addEventListener("beforeinstallprompt", h);
    try {
      [document.documentElement, document.body].forEach((el: HTMLElement) => { el.style.setProperty("background", "#FAF3E6", "important"); el.style.setProperty("color-scheme", "light", "important"); });
      let p: HTMLElement | null = document.querySelector(".tw-root");
      while (p && p.parentElement) { p = p.parentElement; p.style.setProperty("background", "#FAF3E6", "important"); }
    } catch { /* ignore */ }
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const openHome = () => {
    if (installEvt && installEvt.prompt) { try { void installEvt.prompt(); setInstallEvt(null); return; } catch { /* fall through */ } }
    setShowHome(true);
  };

  const toggle = (d: Day, o: Opt) => {
    const cur = sel[d.id] ?? {};
    const on = !!cur[o];
    let next: Partial<Record<Opt, Pick>>;
    if (on) { next = { ...cur }; delete next[o]; }
    else next = d.weekend ? { ...cur, [o]: {} } : { [o]: {} };
    setSel({ ...sel, [d.id]: next });
    if (!on) { const p = OPTS[o].pop; setToast(p[Math.floor(Math.random() * p.length)]); }
  };
  const update = (d: Day, o: Opt, patch: Pick) => {
    const cur = sel[d.id] ?? {};
    setSel({ ...sel, [d.id]: { ...cur, [o]: { ...(cur[o] ?? {}), ...patch } } });
  };

  const picked = (d: Day) => (Object.keys(sel[d.id] ?? {}) as Opt[]);
  const count = FREE.filter((d) => picked(d).length > 0).length;
  const lines = FREE.flatMap((d) => picked(d).map((o) => lineFor(d, o, (sel[d.id] ?? {})[o] ?? {})));
  const message = `טל, שיבצתי את עצמי 😎\n${lines.join("\n")}\nשלחתי לך לאישור, תעדכני אותי 😉`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const copy = () => { try { void navigator.clipboard.writeText(message); setCopied(true); setSent(true); } catch { setCopied(false); } };

  const reset = { fontFamily: sans, WebkitAppearance: "none" as const, appearance: "none" as const, cursor: "pointer", outline: "none" };
  const shadow = "0 10px 30px rgba(110,31,47,0.10), 0 2px 6px rgba(43,35,38,0.06)";
  const card = { backgroundImage: PAPER, color: C.ink, borderRadius: 26, border: `1px solid ${C.line}`, boxShadow: shadow };
  const label = { fontSize: 15, fontWeight: 700, letterSpacing: 0.5, color: C.muted };
  const chip = (on: boolean) => ({ ...reset, fontSize: 16, fontWeight: 700, minHeight: 48, borderRadius: 9999, padding: "8px 8px", border: `1.5px solid ${C.wine}`, backgroundImage: on ? WINE : PAPER, color: on ? C.white : C.wine });
  const ls = { display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 15, fontWeight: 700, minHeight: 46, borderRadius: 9999, border: `1px solid ${C.gold}`, color: "#5A4520", backgroundImage: GOLDG, padding: "6px" };

  return (
    <div className="tw-root" dir="rtl" lang="he" style={{ colorScheme: "light", backgroundImage: PAGE, backgroundColor: C.ivory, color: C.ink, minHeight: "100vh", width: "100%", fontFamily: sans }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 18px 120px", display: "flex", flexDirection: "column", gap: 22, textAlign: "right" }}>

        <div className="tw-card" style={{ ...card, padding: "34px 24px 28px", textAlign: "center", position: "relative", border: `1px solid ${C.gold}` }}>
          <div style={{ position: "absolute", inset: 8, borderRadius: 20, border: `1px solid ${C.goldSoft}`, pointerEvents: "none" }} />
          <div style={{ width: 72, height: 72, margin: "0 auto 14px", borderRadius: 9999, backgroundImage: WINE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 6px 14px rgba(110,31,47,0.35)" }}>💌</div>
          <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: "44px", fontWeight: 900, color: C.wine }}>עידן, יש לך הזמנה</div>
          <div style={{ width: 60, height: 2, background: C.gold, margin: "14px auto" }} />
          <div style={{ fontSize: 18, lineHeight: "28px", color: C.ink }}>הזמנים הפנויים שלי השבוע מחכים לך.</div>
          <div style={{ fontSize: 16, lineHeight: "26px", color: C.ink, marginTop: 10 }}>1. בוחרים מה בא לך · 2. שולחים לי · 3. אני מאשרת, ורק אז זה סגור</div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: C.muted, marginTop: 10 }}>״{QUIPS[(seed * 7) % QUIPS.length]}״</div>
        </div>

        <button className="tw-ghost" onClick={openHome} style={{ ...reset, fontSize: 16, fontWeight: 600, minHeight: 48, borderRadius: 9999, border: `1px solid ${C.line}`, backgroundImage: PAPER, color: C.ink }}>📲 הוספה למסך הבית</button>
        {showHome ? (
          <div className="tw-card" role="dialog" style={{ ...card, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: C.wine }}>איך שמים את זה במסך הבית</div>
            {(isIOS || !isAndroid) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {!isIOS ? <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>באייפון</div> : null}
                {iosSteps.map((s, i) => <div key={s} style={{ fontSize: 16, lineHeight: "25px", color: C.ink }}>{i + 1}. {s}</div>)}
              </div>
            ) : null}
            {(isAndroid || !isIOS) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {!isAndroid ? <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>באנדרואיד</div> : null}
                {androidSteps.map((s, i) => <div key={s} style={{ fontSize: 16, lineHeight: "25px", color: C.ink }}>{i + 1}. {s}</div>)}
              </div>
            ) : null}
            <button className="tw-chip on" onClick={() => setShowHome(false)} style={chip(true)}>סגור</button>
          </div>
        ) : null}

        {DAYS.map((d) => {
          if (!d.free) return (
            <div key={d.id} className="tw-busy" style={{ borderRadius: 18, padding: "14px 18px", backgroundImage: g("#F3E9D8", "#EFE3CF"), color: C.muted, fontSize: 15, border: `1px dashed ${C.line}` }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: C.muted }}>{d.day} {d.date}</span> · תפוסה · {d.line}
            </div>
          );
          const opts = (d.weekend ? WEEKEND_OPTS : WEEKDAY_OPTS).filter((o) => timesFor(d, o).length > 0);
          const mine = sel[d.id] ?? {};
          const any = picked(d).length > 0;
          return (
            <div key={d.id} className="tw-card" style={{ ...card, padding: "26px 18px 22px", display: "flex", flexDirection: "column", gap: 16, border: `1px solid ${any ? C.gold : C.line}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: "40px", fontWeight: 700, color: C.wine }}>{d.day}</div>
                  <div style={{ fontSize: 15, color: C.muted }}>{d.date}{d.weekend ? " · אפשר לבחור כמה דברים" : ""}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#5A4520", backgroundImage: g("#F4E7C8", "#E9D5A6"), border: `1px solid ${C.gold}`, borderRadius: 9999, padding: "6px 14px" }}>🕯️ {d.when}</div>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: C.muted }}>{d.line}</div>
              <div style={{ display: "grid", gridTemplateColumns: d.weekend ? "repeat(3, 1fr)" : "1fr 1fr", gap: 10 }}>
                {opts.map((o) => {
                  const on = !!mine[o];
                  return (
                    <button key={o} aria-pressed={on} className={on ? "tw-tile on" : "tw-tile"} onClick={() => toggle(d, o)}
                      style={{ ...reset, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: d.weekend ? 86 : 92, borderRadius: 18, padding: "10px 4px",
                        border: `1.5px solid ${C.wine}`, backgroundImage: on ? WINE : PAPER, color: on ? C.white : C.wine, boxShadow: on ? "0 6px 16px rgba(110,31,47,0.30)" : "none" }}>
                      {on ? <span style={{ position: "absolute", top: 6, left: 8, width: 22, height: 22, borderRadius: 9999, background: C.gold, color: C.wine, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span> : null}
                      <span style={{ fontSize: d.weekend ? 28 : 32, lineHeight: "34px" }}>{OPTS[o].emoji}</span>
                      <span style={{ fontSize: d.weekend ? 14 : 16, fontWeight: 700, color: on ? C.white : C.wine }}>{OPTS[o].label}</span>
                    </button>
                  );
                })}
              </div>

              {picked(d).map((o) => {
                const p = mine[o] ?? {};
                const tms = timesFor(d, o);
                let cal: { g: string; ics: string } | null = null;
                if (p.time) {
                  const ct = calTimes(d.date, p.time, o);
                  const title = titleFor(o, p);
                  const details = "ממתין לאישור של טל";
                  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TalWeek//HE", "BEGIN:VEVENT", `UID:${d.id}-${o}-${ct.start}@talweek`, `DTSTAMP:${ct.start}`, `DTSTART;TZID=Asia/Jerusalem:${ct.start}`, `DTEND;TZID=Asia/Jerusalem:${ct.end}`, `SUMMARY:${title}`, `DESCRIPTION:${details}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
                  cal = { g: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${ct.start}/${ct.end}&ctz=Asia/Jerusalem&details=${encodeURIComponent(details)}`, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
                }
                return (
                  <div key={o} className="tw-sub" style={{ backgroundImage: g("#FFF8EC", "#F8EDDA"), color: C.ink, borderRadius: 20, border: `1px solid ${C.line}`, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: C.wine }}>{OPTS[o].emoji} {OPTS[o].label}</div>
                    {o === "other" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={label}>מה בא לך?</div>
                        <input className="tw-input" type="text" value={p.text ?? ""} placeholder="למשל: סרט בקולנוע, טיול בים..." maxLength={60}
                          onChange={(e: { target: { value: string } }) => update(d, o, { text: e.target.value })}
                          style={{ fontFamily: sans, fontSize: 17, minHeight: 50, borderRadius: 14, border: `1.5px solid ${C.gold}`, background: "#FFFDF8", color: C.ink, padding: "8px 14px", outline: "none", WebkitAppearance: "none" }} />
                      </div>
                    ) : null}
                    {o === "sleep" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={label}>איפה?</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {PLACES.map((x) => { const on = p.place === x.value; return <button key={x.value} className={on ? "tw-chip on" : "tw-chip"} onClick={() => update(d, o, { place: on ? undefined : x.value })} style={chip(on)}>{on ? "✓ " : ""}{x.label}</button>; })}
                        </div>
                      </div>
                    ) : null}
                    {(o === "mine" || o === "his") ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={label}>וגם דייט?</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {EXTRAS.map((x) => { const on = p.extra === x.value; return <button key={x.value} className={on ? "tw-chip on" : "tw-chip"} onClick={() => update(d, o, { extra: on ? undefined : x.value })} style={chip(on)}>{on ? "✓ " : ""}{x.label}</button>; })}
                        </div>
                      </div>
                    ) : null}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={label}>מתי אתה מגיע?</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {tms.map((tm) => { const on = p.time === tm; return <button key={tm} className={on ? "tw-chip on" : "tw-chip"} onClick={() => update(d, o, { time: on ? undefined : tm })} style={chip(on)}>{tm}</button>; })}
                      </div>
                    </div>
                    {cal ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={label}>📅 הוספה ליומן (ממתין לאישור של טל)</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <a href={cal.g} target="_blank" rel="noopener noreferrer" style={ls}>Google Calendar</a>
                          <a href={cal.ics} download={`tal-${d.id}-${o}.ics`} style={ls}>אייפון / אחר</a>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="tw-card" style={{ ...card, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, border: `1px solid ${C.gold}` }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: C.wine }}>ההזמנה שלך {count >= 2 ? "🔥" : count === 1 ? "👏" : ""}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {FREE.map((d) => { const on = picked(d).length > 0; return (
              <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, backgroundImage: on ? WINE : g("#F4EADA", "#EFE2CC"), color: on ? C.gold : C.muted, border: `1px solid ${on ? C.wine : C.line}` }}>{on ? "✓" : "·"}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{d.day}</div>
              </div>
            ); })}
          </div>
          {lines.length > 0 ? (
            <div style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: "27px", color: C.ink }}>{lines.join("\n")}</div>
          ) : (
            <div style={{ fontSize: 16, color: C.muted }}>עוד לא בחרת כלום. הכפתורים לא נושכים 😉</div>
          )}
          {lines.length > 0 ? <div style={{ fontSize: 15, color: C.muted, textAlign: "center" }}>שום דבר לא סגור עד שטל מאשרת. שולחים לה, והיא חוזרת אליך.</div> : null}
          {lines.length > 0 ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => setSent(true)}
              style={{ display: "block", textAlign: "center", textDecoration: "none", fontSize: 19, fontWeight: 800, padding: "17px 12px", borderRadius: 9999, backgroundImage: WINE, color: C.white, boxShadow: "0 8px 20px rgba(110,31,47,0.30)" }}>
              💬 שלח לטל לאישור בוואטסאפ
            </a>
          ) : null}
          {lines.length > 0 ? (
            <button className="tw-ghost" onClick={copy} style={{ ...reset, fontSize: 16, fontWeight: 600, minHeight: 48, borderRadius: 9999, border: `1px solid ${C.line}`, backgroundImage: PAPER, color: C.ink }}>
              {copied ? "הועתק ✓ עכשיו להדביק לטל" : "או העתק את ההודעה"}
            </button>
          ) : null}
          {sent ? <div style={{ fontSize: 17, fontWeight: 700, textAlign: "center", color: "#5A4520", backgroundImage: GOLDG, border: `1px solid ${C.gold}`, borderRadius: 18, padding: 14 }}>נשלח לטל לאישור ✅ היא תעדכן אותך</div> : null}
          <div style={{ fontSize: 14, color: C.muted, textAlign: "center" }}>טל תאשר ותקבע שעה, והזמנה תגיע ליומן שלך 📅</div>
        </div>

        {toast ? (
          <div role="status" onClick={() => setToast("")} style={{ position: "fixed", bottom: 24, left: 16, right: 16, maxWidth: 488, margin: "0 auto", zIndex: 50, backgroundImage: WINE, color: C.white, fontSize: 19, fontWeight: 700, textAlign: "center", borderRadius: 22, padding: "16px 14px", border: `1px solid ${C.gold}`, boxShadow: "0 10px 26px rgba(0,0,0,0.25)" }}>{toast}</div>
        ) : null}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
