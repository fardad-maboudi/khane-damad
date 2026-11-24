/**
 * Salon data layer. Visitor calls go through `@/api/plugins/bookings` only.
 *
 * Integration points (everything else in the site is presentational):
 *   loadCatalog()      -> services + barbers   (listServices / listResources)
 *   loadRangeSlots()   -> bookable slots for a service, to colour the date strip
 *   loadDayTimes()     -> free start times for one day (overlap-guarded)
 *   createAppointment()-> bookSlot
 *
 * The demo fallback is used ONLY when the booking backend is unreachable
 * (network error or 502/503/504). Any other failure is surfaced to the visitor.
 */
import { useQuery } from "@tanstack/react-query";
import { listServices, listResources, listAvailability, bookSlot, myCredits, purchaseServicePackage } from "@/api/plugins/bookings";
import seed from "@/seed/khane-damad.seed.json";
import { dateKey, dayRange, addDays, todayKey, tehranHour } from "@/lib/fa.js";

const idOf = (row) => String(row?._id ?? row?.id ?? "");

export function isUnreachable(error) {
  const status = Number(error?.status ?? 0);
  return status === 0 || status === 502 || status === 503 || status === 504;
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

export function normalizeService(row) {
  return {
    id: idOf(row),
    name: row.name,
    group: row.group || "سایر خدمات",
    description: row.description || "",
    durationMinutes: Number(row.durationMinutes) || 30,
    price: Number(row.price) || 0,
    currency: row.currency || "IRT",
    image: row.image || "",
    resourceIds: (row.resourceIds || []).map(String),
    sortOrder: Number(row.sortOrder) || 0,
    package: row.package?.enabled
      ? {
          name: row.package.name || "",
          sessions: Number(row.package.sessionCount) || 0,
          price: Number(row.package.price) || 0,
          validityDays: Number(row.package.validityDays) || 0,
        }
      : null,
  };
}

export function normalizeBarber(row) {
  return {
    id: idOf(row),
    name: row.name,
    title: row.title || "",
    bio: row.bio || "",
    avatar: row.avatar || "",
    color: row.color || "",
    sortOrder: Number(row.sortOrder) || 0,
  };
}

export const isFree = (slot) => slot.available !== false && Number(slot.remaining ?? slot.capacity ?? 1) > 0;

/* ------------------------------------------------------------------ */
/* Demo backend (only when the real one is unreachable)                */
/* ------------------------------------------------------------------ */

export const DEMO_KEY = "khane-demo-bookings";
const demoKeyFor = { s: (k) => `demo-s-${k}`, b: (k) => `demo-b-${k}` };

export function demoCatalog() {
  const barbers = seed.resources.map((r) => normalizeBarber({ ...r, id: demoKeyFor.b(r.key) }));
  const services = seed.services.map((s) =>
    normalizeService({
      ...s,
      id: demoKeyFor.s(s.key),
      currency: "IRT",
      resourceIds: s.resources.map(demoKeyFor.b),
    }),
  );
  return { services, barbers, demo: true };
}

export function readDemoBookings() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeDemoBookings(list) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

function demoSlotsForDay(key, services) {
  const weekdayOf = (k) => new Date(`${k}T12:00:00+03:30`).getUTCDay();
  if (!seed.schedule.weekdays.includes(weekdayOf(key))) return [];
  const [startH, startM] = seed.schedule.startTime.split(":").map(Number);
  const [endH, endM] = seed.schedule.endTime.split(":").map(Number);
  const dayStart = new Date(`${key}T00:00:00+03:30`).getTime();
  const taken = readDemoBookings().filter((b) => b.status !== "cancelled");
  const minStart = Date.now() + seed.settings.leadTimeMinutes * 60_000;
  const out = [];
  for (const service of services) {
    for (const barberId of service.resourceIds) {
      const open = dayStart + (startH * 60 + startM) * 60_000;
      const close = dayStart + (endH * 60 + endM) * 60_000;
      for (let t = open; t + service.durationMinutes * 60_000 <= close; t += seed.schedule.slotIntervalMinutes * 60_000) {
        if (t < minStart) continue;
        out.push({
          id: `demo|${barberId}|${service.id}|${t}`,
          startsAt: new Date(t).toISOString(),
          endsAt: new Date(t + service.durationMinutes * 60_000).toISOString(),
          service: service.id,
          resource: barberId,
          available: !taken.some((b) => b.resource === barberId && t < b.end && t + service.durationMinutes * 60_000 > b.start),
          remaining: 1,
        });
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Live backend                                                        */
/* ------------------------------------------------------------------ */

export async function loadCatalog() {
  try {
    const [serviceRows, barberRows] = await Promise.all([listServices(), listResources()]);
    const services = [...serviceRows].map(normalizeService).sort((a, b) => a.sortOrder - b.sortOrder);
    const barbers = [...barberRows].map(normalizeBarber).sort((a, b) => a.sortOrder - b.sortOrder);
    return { services, barbers, demo: false };
  } catch (error) {
    if (isUnreachable(error)) return demoCatalog();
    throw error;
  }
}

async function fetchSlots({ from, to, serviceId, resourceId }, catalog) {
  if (catalog.demo) {
    const days = [];
    for (let k = dateKey(from); k < dateKey(to); k = addDays(k, 1)) days.push(k);
    return days.flatMap((k) => demoSlotsForDay(k, catalog.services)).filter(
      (s) => (!serviceId || s.service === serviceId) && (!resourceId || s.resource === resourceId),
    );
  }
  return [...(await listAvailability({ from, to, serviceId, resourceId }))];
}

/** Days that still have at least one free slot for this service/barber. */
export async function loadRangeSlots({ serviceId, resourceId, days }, catalog) {
  const first = todayKey();
  const last = addDays(first, days);
  const slots = await fetchSlots(
    { from: dayRange(first).from, to: dayRange(last).from, serviceId, resourceId },
    catalog,
  );
  const perDay = {};
  for (const slot of slots) {
    if (!isFree(slot)) continue;
    const key = dateKey(slot.startsAt);
    perDay[key] = (perDay[key] ?? 0) + 1;
  }
  return perDay;
}

const overlaps = (a, b) =>
  new Date(a.startsAt).getTime() < new Date(b.endsAt).getTime() &&
  new Date(a.endsAt).getTime() > new Date(b.startsAt).getTime();

/**
 * Free start times for one day. A barber who already has an appointment for a
 * different service must not be offered at an overlapping time, so we also read
 * that barber's other slots for the day and drop anything that clashes with a
 * booked one.
 */
export async function loadDayTimes({ serviceId, barberIds, dayKey }, catalog) {
  const { from, to } = dayRange(dayKey);
  const all = await fetchSlots({ from, to }, catalog);
  const wanted = new Set(barberIds);
  const mine = all.filter((s) => s.service === serviceId && wanted.has(String(s.resource)));
  const busy = all.filter((s) => !isFree(s) && wanted.has(String(s.resource)));
  const minStart = Date.now();
  const free = mine.filter(
    (s) =>
      isFree(s) &&
      new Date(s.startsAt).getTime() > minStart &&
      !busy.some((b) => String(b.resource) === String(s.resource) && overlaps(b, s)),
  );
  const byStart = new Map();
  for (const slot of free.sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const entry = byStart.get(slot.startsAt) ?? { startsAt: slot.startsAt, endsAt: slot.endsAt, options: [] };
    entry.options.push({ slotId: String(slot.id ?? slot._id), barberId: String(slot.resource) });
    byStart.set(slot.startsAt, entry);
  }
  return [...byStart.values()];
}

export function timePeriod(iso) {
  const hour = tehranHour(iso);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export const PERIOD_LABELS = { morning: "صبح", afternoon: "بعدازظهر", evening: "عصر و شب" };

/* ------------------------------------------------------------------ */
/* Device-saved guest appointments (for quick recall on /book)        */
/* ------------------------------------------------------------------ */

const RECENT_BOOKINGS_KEY = "khane-recent-bookings";

export function readRecentBookings() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentBooking(entry) {
  try {
    const prev = readRecentBookings().filter((b) => b.id !== entry.id);
    localStorage.setItem(RECENT_BOOKINGS_KEY, JSON.stringify([entry, ...prev].slice(0, 6)));
  } catch {
    // Ignore blocked storage
  }
}

/**
 * Book one slot. The server is the authority: a slot that was just taken comes
 * back as a 409 and is reported as `kind: "taken"` so the flow can refresh.
 */
export async function createAppointment({ option, startsAt, endsAt, service, barber, customer }, catalog) {
  if (catalog.demo) {
    const stored = readDemoBookings();
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    if (stored.some((b) => b.status !== "cancelled" && b.resource === barber.id && start < b.end && end > b.start)) {
      const error = new Error("taken");
      error.kind = "taken";
      throw error;
    }
    if (customer.creditId) noteCreditUsed(customer.creditId);
    const record = {
      id: `demo-${Date.now().toString(36)}`,
      service: service?.id || option.slotId.split("|")[2] || "",
      serviceTitle: service?.name || "",
      resource: barber.id,
      barberName: barber?.name || "",
      start,
      end,
      startsAt,
      endsAt,
      price: service?.price || 0,
      customerName: customer.name,
      customerPhone: customer.phone,
      notes: customer.note || "",
      status: "pending",
      paidWithCredit: Boolean(customer.creditId),
    };
    writeDemoBookings([...stored, record]);
    saveRecentBooking({
      id: record.id,
      serviceName: service?.name || "خدمت",
      barberName: barber?.name || "",
      startsAt,
      endsAt,
      price: service?.price || 0,
      currency: service?.currency || "IRT",
      status: "pending",
      paidWithCredit: Boolean(customer.creditId),
      demo: true,
    });
    return { id: record.id, status: "pending", demo: true, paidWithCredit: Boolean(customer.creditId) };
  }
  try {
    const result = await bookSlot({
      slotId: option.slotId,
      customerName: customer.name,
      customerPhone: customer.phone,
      notes: customer.note || undefined,
      creditId: customer.creditId || undefined,
    });
    if (customer.creditId) noteCreditUsed(customer.creditId);
    const id = idOf(result);
    const status = result.status || "pending";
    saveRecentBooking({
      id,
      serviceName: service?.name || "خدمت",
      barberName: barber?.name || "",
      startsAt,
      endsAt,
      price: service?.price || 0,
      currency: service?.currency || "IRT",
      status,
      paidWithCredit: Boolean(customer.creditId),
      demo: false,
    });
    return { id, status, demo: false, paidWithCredit: Boolean(customer.creditId) };
  } catch (error) {
    if (Number(error?.status) === 409) {
      error.kind = /ظرفیت|هم‌پوشانی|گذشته/.test(String(error.message)) ? "taken" : "rejected";
    } else if (Number(error?.status) === 429) {
      error.kind = "busy";
    } else if (isUnreachable(error)) {
      error.kind = "offline";
    }
    throw error;
  }
}

/**
 * Packages and credits: works with both live backend and standalone demo fallback.
 */
const CREDITS_KEY = "khane-credits";
const readCredits = () => {
  try {
    return JSON.parse(localStorage.getItem(CREDITS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeCredits = (list) => {
  try {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(list));
  } catch {
    // Storage blocked
  }
};

export async function buyPackage({ service, customer }) {
  try {
    const credit = await purchaseServicePackage(service.id, { customerName: customer.name, customerPhone: customer.phone });
    const entry = {
      id: idOf(credit),
      serviceId: service.id,
      phone: customer.phone,
      total: Number(credit.totalSessions) || service.package?.sessions || 0,
      remaining: Number(credit.remainingSessions) || service.package?.sessions || 0,
    };
    writeCredits([...readCredits(), entry]);
    return { id: entry.id, sessions: entry.total, demo: false };
  } catch (error) {
    if (isUnreachable(error)) {
      const sessions = Number(service.package?.sessions) || 4;
      const entry = {
        id: `demo-pkg-${Date.now().toString(36)}`,
        serviceId: service.id,
        phone: customer.phone,
        total: sessions,
        remaining: sessions,
        demo: true,
      };
      writeCredits([...readCredits(), entry]);
      return { id: entry.id, sessions: entry.total, demo: true };
    }
    throw error;
  }
}

export async function loadMyCredits(serviceId) {
  const local = readCredits().filter((c) => c.serviceId === serviceId && c.remaining > 0);
  try {
    const rows = await myCredits();
    const list = Array.isArray(rows) ? rows : rows?.items ?? [];
    const known = new Set(local.map((c) => c.id));
    const remote = list
      .filter((c) => Number(c.remainingSessions) > 0 && (!c.serviceId || String(c.serviceId) === String(serviceId)) && !known.has(idOf(c)))
      .map((c) => ({ id: idOf(c), remaining: Number(c.remainingSessions), total: Number(c.totalSessions), phone: "" }));
    return [...local, ...remote];
  } catch {
    return local;
  }
}

export function noteCreditUsed(creditId) {
  writeCredits(readCredits().map((c) => (c.id === creditId ? { ...c, remaining: Math.max(0, c.remaining - 1) } : c)));
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useCatalog() {
  return useQuery({ queryKey: ["salon", "catalog"], queryFn: loadCatalog, staleTime: 60_000 });
}

export function groupServices(services) {
  const groups = new Map();
  for (const service of services) {
    if (!groups.has(service.group)) groups.set(service.group, []);
    groups.get(service.group).push(service);
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }));
}

export const BOOKING_HORIZON_DAYS = seed.settings.horizonDays;
export const CANCELLATION_POLICY = seed.settings.cancellationPolicyText;
