/**
 * Persian formatting for the salon: digits, toman prices, Jalali dates, Tehran
 * wall-clock times, mobile validation and calendar exports. Iran has no DST, so
 * Tehran day boundaries are a fixed +03:30 offset.
 */
export const TEHRAN_TZ = "Asia/Tehran";
const OFFSET = "+03:30";

const faNumber = new Intl.NumberFormat("fa-IR");
const jalaliParts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TEHRAN_TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const jalaliShort = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TEHRAN_TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("fa-IR", {
  timeZone: TEHRAN_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const keyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TEHRAN_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TEHRAN_TZ,
  hour: "2-digit",
  hourCycle: "h23",
});

export const toFa = (value) => faNumber.format(Number(value) || 0);

/** Digit-by-digit conversion that keeps leading zeros (phone numbers). */
export const toFaDigits = (value) => String(value ?? "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";
export function toEnDigits(input) {
  return String(input ?? "")
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d)));
}

/** Prices are stored per-service as IRT (toman) or IRR (rial). */
export function formatPrice(amount, currency = "IRT") {
  const n = Number(amount) || 0;
  if (n <= 0) return "توافقی";
  const toman = currency === "IRR" ? Math.round(n / 10) : n;
  return `${toFa(toman)} تومان`;
}

export function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${toFa(h)} ساعت و ${toFa(r)} دقیقه`;
  if (h) return `${toFa(h)} ساعت`;
  return `${toFa(r)} دقیقه`;
}

/** 'YYYY-MM-DD' of an instant on the Tehran calendar. */
export const dateKey = (value) => keyFormat.format(new Date(value));

/** Instants for the Tehran day `key`: [start, next day's start). */
export function dayRange(key) {
  const start = new Date(`${key}T00:00:00${OFFSET}`);
  return { from: start.toISOString(), to: new Date(start.getTime() + 86_400_000).toISOString() };
}

export function addDays(key, days) {
  const base = new Date(`${key}T12:00:00${OFFSET}`);
  return dateKey(new Date(base.getTime() + days * 86_400_000));
}

export const todayKey = () => dateKey(new Date());

export const formatTime = (value) => timeFormat.format(new Date(value));
export const tehranHour = (value) => Number(hourFormat.format(new Date(value)));

/** «دوشنبه ۴ آبان ۱۴۰۵» */
export function formatDateLong(value) {
  const date = typeof value === "string" && value.length === 10 ? new Date(`${value}T12:00:00${OFFSET}`) : new Date(value);
  const parts = jalaliParts.formatToParts(date);
  const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${pick("weekday")} ${pick("day")} ${pick("month")} ${pick("year")}`;
}

/** Pieces for a date chip: weekday, day number, month. */
export function dateChip(key) {
  const date = new Date(`${key}T12:00:00${OFFSET}`);
  const parts = jalaliShort.formatToParts(date);
  const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: pick("weekday"), day: pick("day"), month: pick("month") };
}

/** Accepts 0911…, +98911…, 98911…, Persian or Arabic digits. */
export function normalizeMobile(input) {
  const digits = toEnDigits(input).replace(/[\s\-()+]/g, "");
  let local = digits;
  if (local.startsWith("0098")) local = `0${local.slice(4)}`;
  else if (local.startsWith("98") && local.length === 12) local = `0${local.slice(2)}`;
  else if (local.length === 10 && local.startsWith("9")) local = `0${local}`;
  return /^09\d{9}$/.test(local) ? local : null;
}

const icsStamp = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsEscape = (text) => String(text ?? "").replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

export function buildIcs({ id, title, startsAt, endsAt, location, description }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Khaneh Damaad//Booking//FA",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${id || icsStamp(startsAt)}@khanedamad`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(startsAt)}`,
    `DTEND:${icsStamp(endsAt)}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(title)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(event) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "khane-damad-appointment.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl({ title, startsAt, endsAt, location, description }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsStamp(startsAt)}/${icsStamp(endsAt)}`,
    details: description || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
