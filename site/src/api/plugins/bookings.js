/**
 * Visitor booking seam — the `bookings` plugin through `@joorchin/client-sdk`.
 *
 * Every export keeps the argument shape the pages already use, so switching
 * between demo data and the live backend never touches a component. When no app
 * id is configured, or the backend is unreachable, the rejection carries
 * `status: 0` and `@/lib/salon-api` turns it into the demo catalogue.
 *
 * Guest identity: the server owns anonymous bookings by an `x-booking-session`
 * header (`{ session }` here). It is issued once, as `booking.guestSession`, and
 * reused for "my bookings", cancellation and credits.
 */
import { getBackend, isUnreachable, readBookingSession, rememberBookingSession, statusOf } from "@/api/joorchin.js";

const PLUGIN = "bookings";

const offline = () => Object.assign(new Error("Backend is not configured"), { status: 0 });

async function requireBackend() {
  const client = await getBackend();
  if (!client) throw offline();
  return client;
}

async function plugin() {
  return (await requireBackend()).site.plugin(PLUGIN);
}

const asList = (payload) =>
  Array.isArray(payload) ? payload : (payload?.items ?? payload?.rows ?? payload?.records ?? payload?.data ?? []);

/*
 * The plugin answers catalogue reads both as a service action
 * (`/plugins/bookings/services`) and as plugin records
 * (`/plugins/bookings/data/booking_service`), and which of the two an app
 * exposes is policy-dependent. Probe once per page load and keep the winner.
 */
const routeCache = new Map();

async function firstRoute(key, routes) {
  const winner = routeCache.get(key);
  const ordered = winner
    ? [...routes].sort((a, b) => (a.name === winner ? -1 : b.name === winner ? 1 : 0))
    : routes;
  let failure;
  for (const route of ordered) {
    try {
      const value = await route.run();
      routeCache.set(key, route.name);
      return value;
    } catch (error) {
      failure = error;
      // 404/405 mean "this app does not expose that route"; anything else is real.
      if (![400, 404, 405].includes(statusOf(error))) throw error;
    }
  }
  throw failure;
}

/* ---------------------------------------------------------------- catalogue */

export function listServices() {
  return firstRoute("services", [
    { name: "action", run: async () => (await plugin()).action("services", { query: { active: true } }) },
    {
      name: "records",
      run: async () => (await plugin()).records("booking_service").list({ filter: { active: true }, limit: 200 }),
    },
  ]).then(asList);
}

export function listResources() {
  return firstRoute("resources", [
    {
      name: "records",
      run: async () => (await plugin()).records("booking_resource").list({ filter: { active: true }, limit: 200 }),
    },
    { name: "action", run: async () => (await plugin()).action("resources", { query: { active: true } }) },
  ]).then(asList);
}

/* -------------------------------------------------------------- availability */

export function listAvailability(query = {}) {
  const { from, to, serviceId, resourceId } = query;
  return requireBackend().then((client) => client.bookings.listAvailability({ from, to, serviceId, resourceId }));
}

/* ------------------------------------------------------------------ bookings */

export async function bookSlot(input = {}) {
  const { slotId, session, ...rest } = input;
  if (!slotId) throw Object.assign(new Error("slotId is required"), { status: 400 });
  const client = await requireBackend();
  const booking = await client.bookings.bookSlot(slotId, rest, {
    session: session ?? readBookingSession() ?? undefined,
  });
  if (booking?.guestSession) rememberBookingSession(booking.guestSession);
  return booking;
}

export function listMyBookings() {
  return requireBackend().then((client) =>
    client.bookings.listMyBookings({ session: readBookingSession() ?? undefined }),
  );
}

export function cancelMyBooking(id, reason) {
  const payload = typeof reason === "string" ? { reason } : (reason ?? {});
  return requireBackend().then((client) =>
    client.bookings.cancelBooking(id, payload, { session: readBookingSession() ?? undefined }),
  );
}

/* ------------------------------------------------------------- credits/packs */

export function myCredits(query = {}) {
  return requireBackend().then((client) =>
    client.bookings.listMyCredits(query, { session: readBookingSession() ?? undefined }),
  );
}

export function purchaseServicePackage(serviceId, input = {}) {
  return requireBackend().then(async (client) => {
    const credit = await client.bookings.purchaseServicePackage(serviceId, input, {
      session: readBookingSession() ?? undefined,
    });
    if (credit?.guestSession) rememberBookingSession(credit.guestSession);
    return credit;
  });
}

/* -------------------------------------------------------------------- events */

export function listEvents() {
  return requireBackend().then((client) => client.bookings.listEvents());
}

export function bookEvent(input = {}) {
  const { eventId, ...rest } = input;
  return requireBackend().then((client) =>
    client.bookings.bookEvent(eventId, rest, { session: readBookingSession() ?? undefined }),
  );
}

export function listMyEvents() {
  return requireBackend().then((client) =>
    client.bookings.listMyEvents({ session: readBookingSession() ?? undefined }),
  );
}

export function cancelMyEventRegistration(id, reason) {
  const payload = typeof reason === "string" ? { reason } : (reason ?? {});
  return requireBackend().then((client) =>
    client.bookings.cancelEventRegistration(id, payload, { session: readBookingSession() ?? undefined }),
  );
}

export { isUnreachable };
