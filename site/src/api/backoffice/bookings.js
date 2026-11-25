// Standalone stub for backoffice bookings API with interactive demo state
import { getBackend, isUnreachable } from "@/api/joorchin.js";

const DEMO_KEY = "khane-demo-bookings";
const DEMO_CLIENTS_KEY = "khane-demo-clients";

function getSeededDemoBookings() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  const now = new Date();
  const baseDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0);
  const tomorrow = new Date(baseDay.getTime() + 86_400_000);
  const dayAfter = new Date(baseDay.getTime() + 2 * 86_400_000);

  const sample = [
    {
      id: "demo-seed-1",
      service: "demo-s-haircut",
      serviceTitle: "کات مو",
      resource: "demo-b-mehdi",
      start: tomorrow.getTime(),
      end: tomorrow.getTime() + 60 * 60_000,
      startsAt: tomorrow.toISOString(),
      endsAt: new Date(tomorrow.getTime() + 60 * 60_000).toISOString(),
      price: 450000,
      customerName: "کیارش محمدی",
      customerPhone: "09113456789",
      notes: "فید ملایم کنار سر، رویه کلاسیک",
      status: "pending",
    },
    {
      id: "demo-seed-2",
      service: "demo-s-razor-shave",
      serviceTitle: "اصلاح سنتی با تیغ و حوله گرم",
      resource: "demo-b-amirhossein",
      start: tomorrow.getTime() + 180 * 60_000,
      end: tomorrow.getTime() + 210 * 60_000,
      startsAt: new Date(tomorrow.getTime() + 180 * 60_000).toISOString(),
      endsAt: new Date(tomorrow.getTime() + 210 * 60_000).toISOString(),
      price: 300000,
      customerName: "سهراب نادری",
      customerPhone: "09124567890",
      notes: "",
      status: "confirmed",
    },
    {
      id: "demo-seed-3",
      service: "demo-s-groom-gold",
      serviceTitle: "پکیج داماد طلایی",
      resource: "demo-b-mehdi",
      start: dayAfter.getTime() + 120 * 60_000,
      end: dayAfter.getTime() + 270 * 60_000,
      startsAt: new Date(dayAfter.getTime() + 120 * 60_000).toISOString(),
      endsAt: new Date(dayAfter.getTime() + 270 * 60_000).toISOString(),
      price: 4500000,
      customerName: "آرش تابش",
      customerPhone: "09117891234",
      notes: "مراسم جمعه شب برگزار می‌شود؛ مشاوره استایل انجام شده",
      status: "confirmed",
    },
  ];
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(sample));
  } catch {
    // ignore
  }
  return sample;
}

function saveDemoBookings(list) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function readDemoClients() {
  try {
    const raw = localStorage.getItem(DEMO_CLIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const initial = [
    { id: "c-1", phoneNumber: "09113456789", visitCount: 2, noShowCount: 0 },
    { id: "c-2", phoneNumber: "09124567890", visitCount: 5, noShowCount: 0 },
    { id: "c-3", phoneNumber: "09117891234", visitCount: 1, noShowCount: 0 },
  ];
  try {
    localStorage.setItem(DEMO_CLIENTS_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

function bumpDemoClient(phone, field) {
  if (!phone) return;
  const list = readDemoClients();
  const idx = list.findIndex((c) => c.phoneNumber === phone);
  if (idx >= 0) {
    list[idx] = { ...list[idx], [field]: (Number(list[idx][field]) || 0) + 1 };
  } else {
    list.push({ id: `c-${Date.now()}`, phoneNumber: phone, visitCount: field === "visitCount" ? 1 : 0, noShowCount: field === "noShowCount" ? 1 : 0 });
  }
  try {
    localStorage.setItem(DEMO_CLIENTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function normalizeDemoRow(b) {
  const startsAt = b.startsAt || new Date(b.start).toISOString();
  const endsAt = b.endsAt || new Date(b.end).toISOString();
  return {
    ...b,
    id: b.id,
    startsAt,
    endsAt,
    service: b.service || "demo-s-haircut",
    resource: b.resource || "demo-b-mehdi",
    customerName: b.customerName || "مشتری مهمان",
    customerPhone: b.customerPhone || "09110001234",
    status: b.status || "pending",
  };
}

const demoCalendar = async ({ from, to, resourceId } = {}) => {
  const all = getSeededDemoBookings().map(normalizeDemoRow);
  const fromMs = from ? new Date(from).getTime() : 0;
  const toMs = to ? new Date(to).getTime() : Infinity;
  const bookings = all.filter((b) => {
    const t = new Date(b.startsAt).getTime();
    if (t < fromMs || t >= toMs) return false;
    if (resourceId && String(b.resource) !== String(resourceId)) return false;
    return true;
  });
  return { bookings, slots: [] };
};

const demoConfirmBooking = async (id) => {
  const list = getSeededDemoBookings().map((b) => (String(b.id) === String(id) ? { ...b, status: "confirmed" } : b));
  saveDemoBookings(list);
  return { ok: true };
};

const demoCompleteBooking = async (id) => {
  const all = getSeededDemoBookings();
  const target = all.find((b) => String(b.id) === String(id));
  if (target) bumpDemoClient(target.customerPhone, "visitCount");
  saveDemoBookings(all.map((b) => (String(b.id) === String(id) ? { ...b, status: "completed" } : b)));
  return { ok: true };
};

const demoNoShowBooking = async (id) => {
  const all = getSeededDemoBookings();
  const target = all.find((b) => String(b.id) === String(id));
  if (target) bumpDemoClient(target.customerPhone, "noShowCount");
  saveDemoBookings(all.map((b) => (String(b.id) === String(id) ? { ...b, status: "no_show" } : b)));
  return { ok: true };
};

const demoCancelBooking = async (id) => {
  const list = getSeededDemoBookings().map((b) => (String(b.id) === String(id) ? { ...b, status: "cancelled" } : b));
  saveDemoBookings(list);
  return { ok: true };
};

const demoRescheduleBooking = async (id, { newSlotId } = {}) => {
  const parts = String(newSlotId || "").split("|");
  const newStart = parts.length === 4 ? Number(parts[3]) : null;
  const list = getSeededDemoBookings().map((b) => {
    if (String(b.id) !== String(id) || !newStart) return b;
    const duration = (b.end || new Date(b.endsAt).getTime()) - (b.start || new Date(b.startsAt).getTime());
    const end = newStart + Math.max(duration, 30 * 60_000);
    return {
      ...b,
      start: newStart,
      end,
      startsAt: new Date(newStart).toISOString(),
      endsAt: new Date(end).toISOString(),
      status: "confirmed",
    };
  });
  saveDemoBookings(list);
  return { ok: true };
};

/* ------------------------------------------------------------------------- */
/* SDK transport                                                              */
/* ------------------------------------------------------------------------- */

/**
 * Staff calls use the signed-in staff token through `client.backoffice`.
 * Demo rows stay the fallback only when no backend is configured or it cannot be
 * reached; a 401/403 is rethrown so the page can ask for a sign-in instead of
 * showing invented appointments.
 */
async function staffCall(run, fallback) {
  const client = await getBackend();
  if (!client) return fallback();
  try {
    return await run(client);
  } catch (error) {
    if (isUnreachable(error)) return fallback();
    throw error;
  }
}

export const getCalendar = ({ from, to, resourceId } = {}) =>
  staffCall(
    (client) => client.bookings.getCalendar({ from, to, resourceId }),
    () => demoCalendar({ from, to, resourceId }),
  );

export const confirmBooking = (id) =>
  staffCall(
    (client) => client.bookings.confirmBooking(id),
    () => demoConfirmBooking(id),
  );

export const completeBooking = (id) =>
  staffCall(
    (client) => client.bookings.completeBooking(id),
    () => demoCompleteBooking(id),
  );

export const noShowBooking = (id) =>
  staffCall(
    (client) => client.bookings.noShowBooking(id),
    () => demoNoShowBooking(id),
  );

export const cancelBooking = (id, input) => {
  const payload = typeof input === "string" ? { reason: input } : (input ?? {});
  return staffCall(
    (client) => client.bookings.cancelBooking(id, payload),
    () => demoCancelBooking(id),
  );
};

export const rescheduleBooking = (id, input = {}) =>
  staffCall(
    (client) => client.bookings.rescheduleBooking(id, input),
    () => demoRescheduleBooking(id, input),
  );

/*
 * Services go through the raw plugin action instead of `client.bookings.createService`
 * on purpose: that wrapper Zod-parses the body and `$strip`s every field it does not
 * know, which would silently drop the seed pack's embedded `package` block (the paid
 * multi-session offer). The route is the same one the wrapper posts to.
 */
export const createService = (body) =>
  staffCall(
    (client) => client.backoffice.plugin("bookings").action("services", { method: "POST", body }),
    () => ({ ok: true }),
  );

export const updateService = (id, body) =>
  staffCall(
    (client) => client.backoffice.plugin("bookings").action(`services/${encodeURIComponent(id)}`, { method: "PUT", body }),
    () => ({ ok: true }),
  );

export const generateSlots = (input) =>
  staffCall(
    (client) => client.bookings.generateSlots(input),
    () => ({ ok: true, count: 0 }),
  );
