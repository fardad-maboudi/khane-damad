/**
 * Visitor booking seam — uses the `bookings` plugin when installed, and
 * seamlessly falls back to `client.entities` when models are seeded directly
 * from `models.json` in Joorchin Studio.
 */
import {
  isUnreachable,
  readBookingSession,
  rememberBookingSession,
  statusOf,
  withBookingsFallback,
} from "@/api/joorchin.js";

const PLUGIN = "bookings";

const idOf = (row) => (row && typeof row === "object" ? String(row._id ?? row.id ?? "") : String(row ?? ""));

const asList = (payload) =>
  Array.isArray(payload) ? payload : (payload?.items ?? payload?.rows ?? payload?.records ?? payload?.data ?? []);

function ensureGuestSession(explicit) {
  const existing = explicit ?? readBookingSession();
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  rememberBookingSession(generated);
  return generated;
}

/*
 * The plugin answers catalogue reads both as a service action
 * (`/plugins/bookings/services`) and as plugin records
 * (`/plugins/bookings/data/booking_service`). Probe once and keep the winner.
 */
const routeCache = new Map();

async function firstPluginRoute(client, key, routes) {
  const plugin = client.site.plugin(PLUGIN);
  const winner = routeCache.get(key);
  const ordered = winner
    ? [...routes].sort((a, b) => (a.name === winner ? -1 : b.name === winner ? 1 : 0))
    : routes;
  let failure;
  for (const route of ordered) {
    try {
      const value = await route.run(plugin);
      routeCache.set(key, route.name);
      return value;
    } catch (error) {
      failure = error;
      const status = statusOf(error);
      const msg = String(error?.message ?? "");
      if (status === 403 && /not installed|نصب نشده/i.test(msg)) throw error;
      if (![400, 404, 405].includes(status)) throw error;
    }
  }
  throw failure;
}

/* ---------------------------------------------------------------- catalogue */

export function listServices() {
  return withBookingsFallback(
    (client) =>
      firstPluginRoute(client, "services", [
        { name: "action", run: (p) => p.action("services", { query: { active: true } }) },
        { name: "records", run: (p) => p.records("booking_service").list({ filter: { active: true }, limit: 200 }) },
      ]).then(asList),
    (client) => client.entities.booking_service.filter({ active: true }, "sortOrder", 200).then(asList),
  );
}

export function listResources() {
  return withBookingsFallback(
    (client) =>
      firstPluginRoute(client, "resources", [
        { name: "records", run: (p) => p.records("booking_resource").list({ filter: { active: true }, limit: 200 }) },
        { name: "action", run: (p) => p.action("resources", { query: { active: true } }) },
      ]).then(asList),
    (client) => client.entities.booking_resource.filter({ active: true }, "sortOrder", 200).then(asList),
  );
}

/* -------------------------------------------------------------- availability */

export function listAvailability(query = {}) {
  const { from, to, serviceId, resourceId } = query;
  return withBookingsFallback(
    (client) => client.bookings.listAvailability({ from, to, serviceId, resourceId }),
    async (client) => {
      const filter = {};
      if (serviceId) filter.service = serviceId;
      if (resourceId) filter.resource = resourceId;
      const rows = Object.keys(filter).length
        ? await client.entities.booking_slot.filter(filter, "startsAt", 1000)
        : await client.entities.booking_slot.list("startsAt", 1000);
      const fromMs = from ? new Date(from).getTime() : -Infinity;
      const toMs = to ? new Date(to).getTime() : Infinity;
      return asList(rows).filter((slot) => {
        const startMs = new Date(slot.startsAt).getTime();
        if (startMs < fromMs || startMs >= toMs) return false;
        if (serviceId && idOf(slot.service) !== String(serviceId)) return false;
        if (resourceId && idOf(slot.resource) !== String(resourceId)) return false;
        return true;
      });
    },
  );
}

/* ------------------------------------------------------------------ bookings */

export async function bookSlot(input = {}) {
  const { slotId, session, ...rest } = input;
  if (!slotId) throw Object.assign(new Error("slotId is required"), { status: 400 });

  return withBookingsFallback(
    async (client) => {
      const booking = await client.bookings.bookSlot(slotId, rest, {
        session: session ?? readBookingSession() ?? undefined,
      });
      if (booking?.guestSession) rememberBookingSession(booking.guestSession);
      return booking;
    },
    async (client) => {
      const slot = await client.entities.booking_slot.get(slotId);
      const seats = Math.max(1, Number(rest.seats ?? rest.partySize ?? 1));
      const remaining = Number(slot?.capacity ?? 1);
      if (slot?.available === false || remaining < seats) {
        throw Object.assign(new Error("ظرفیت این زمان تکمیل شده است."), { status: 409 });
      }
      const guestSession = ensureGuestSession(session);
      const serviceId = idOf(slot.service);
      const resourceId = idOf(slot.resource);
      const booking = await client.entities.booking.create({
        slotId,
        service: serviceId || undefined,
        resource: resourceId || undefined,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        price: slot.price,
        seats,
        status: "pending",
        paymentStatus: rest.creditId ? "credit" : "unpaid",
        source: "web",
        guestSession,
        ...rest,
      });
      const nextCap = Math.max(0, remaining - seats);
      await client.entities.booking_slot.update(slotId, {
        capacity: nextCap,
        available: nextCap > 0,
      });
      if (rest.creditId) {
        try {
          const credit = await client.entities.booking_credit.get(rest.creditId);
          const nextRem = Math.max(0, Number(credit.remainingSessions ?? 0) - 1);
          await client.entities.booking_credit.update(rest.creditId, {
            remainingSessions: nextRem,
            usedSessions: Number(credit.usedSessions ?? 0) + 1,
            status: nextRem === 0 ? "exhausted" : credit.status || "active",
          });
        } catch {
          // Do not fail the booking if credit counter update is restricted.
        }
      }
      return booking;
    },
  );
}

export function listMyBookings() {
  return withBookingsFallback(
    (client) => client.bookings.listMyBookings({ session: readBookingSession() ?? undefined }),
    (client) => {
      const guestSession = readBookingSession();
      if (!guestSession) return [];
      return client.entities.booking.filter({ guestSession }, "-startsAt", 100).then(asList);
    },
  );
}

export function cancelMyBooking(id, reason) {
  const payload = typeof reason === "string" ? { reason } : (reason ?? {});
  return withBookingsFallback(
    (client) => client.bookings.cancelBooking(id, payload, { session: readBookingSession() ?? undefined }),
    async (client) => {
      const updated = await client.entities.booking.update(id, {
        status: "cancelled",
        cancelReason: payload.reason || undefined,
        cancelledAt: new Date().toISOString(),
        cancelledBy: "customer",
      });
      const slotId = idOf(updated?.slotId);
      if (slotId) {
        try {
          const slot = await client.entities.booking_slot.get(slotId);
          const restored = Number(slot?.capacity ?? 0) + Math.max(1, Number(updated?.seats ?? 1));
          await client.entities.booking_slot.update(slotId, {
            capacity: restored,
            available: restored > 0,
          });
        } catch {
          // Ignore if slot was removed.
        }
      }
      return updated;
    },
  );
}

/* ------------------------------------------------------------- credits/packs */

export function myCredits(query = {}) {
  return withBookingsFallback(
    (client) => client.bookings.listMyCredits(query, { session: readBookingSession() ?? undefined }),
    (client) => {
      const filter = query?.phone ? { clientPhone: query.phone } : {};
      return Object.keys(filter).length
        ? client.entities.booking_credit.filter(filter, undefined, 100).then(asList)
        : client.entities.booking_credit.list(undefined, 100).then(asList);
    },
  );
}

export function purchaseServicePackage(serviceId, input = {}) {
  return withBookingsFallback(
    async (client) => {
      const credit = await client.bookings.purchaseServicePackage(serviceId, input, {
        session: readBookingSession() ?? undefined,
      });
      if (credit?.guestSession) rememberBookingSession(credit.guestSession);
      return credit;
    },
    async (client) => {
      const service = await client.entities.booking_service.get(serviceId);
      const totalSessions = Number(service?.package?.sessionCount ?? 4);
      const validityDays = Number(service?.package?.validityDays ?? 0);
      const expiresAt = validityDays > 0 ? new Date(Date.now() + validityDays * 86_400_000).toISOString() : undefined;
      return client.entities.booking_credit.create({
        clientId: input.clientId || ensureGuestSession(),
        clientPhone: input.customerPhone || undefined,
        packageName: service?.package?.name || service?.name || "بسته اعتباری",
        serviceIds: [serviceId],
        totalSessions,
        remainingSessions: totalSessions,
        usedSessions: 0,
        status: "active",
        grantedAt: new Date().toISOString(),
        ...(expiresAt ? { expiresAt } : {}),
      });
    },
  );
}

/* -------------------------------------------------------------------- events */

export function listEvents() {
  return withBookingsFallback(
    (client) => client.bookings.listEvents(),
    (client) => client.entities.booking_event.filter({ active: true }, "startsAt", 200).then(asList),
  );
}

export function bookEvent(input = {}) {
  const { eventId, ...rest } = input;
  return withBookingsFallback(
    (client) => client.bookings.bookEvent(eventId, rest, { session: readBookingSession() ?? undefined }),
    (client) =>
      client.entities.booking_event_registration.create({
        eventId,
        ...rest,
        status: "confirmed",
        sessionId: ensureGuestSession(),
      }),
  );
}

export function listMyEvents() {
  return withBookingsFallback(
    (client) => client.bookings.listMyEvents({ session: readBookingSession() ?? undefined }),
    (client) => {
      const sessionId = readBookingSession();
      if (!sessionId) return [];
      return client.entities.booking_event_registration.filter({ sessionId }, undefined, 100).then(asList);
    },
  );
}

export function cancelMyEventRegistration(id, reason) {
  const payload = typeof reason === "string" ? { reason } : (reason ?? {});
  return withBookingsFallback(
    (client) =>
      client.bookings.cancelEventRegistration(id, payload, { session: readBookingSession() ?? undefined }),
    (client) =>
      client.entities.booking_event_registration.update(id, {
        status: "cancelled",
        cancelledReason: payload.reason || undefined,
        cancelledAt: new Date().toISOString(),
        cancelledBy: "customer",
      }),
  );
}

export { isUnreachable };
