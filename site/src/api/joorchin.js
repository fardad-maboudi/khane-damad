/**
 * Joorchin backend bootstrap.
 *
 * One SDK client per app, created lazily and shared by every data module:
 *   client.site      — visitor routes (catalog, availability, booking, credits)
 *   client.backoffice— staff routes (appointments, setup, team) after staff sign-in
 *   client.bookings  — typed booking routes (slots, bookings, credits, events)
 *   client.auth      — customer / staff phone OTP and password sessions
 *
 * `VITE_JOORCHIN_APP_ID` is the only required setting. While it is unset the
 * client stays `null`, every caller keeps its demo fallback, and the site still
 * runs — so the public preview never depends on a live backend.
 */
const env = import.meta.env ?? {};

export const APP_ID = String(env.VITE_JOORCHIN_APP_ID ?? "").trim();
/** Empty means the SDK default, https://api.joorchin.ai. */
export const SERVER_URL = String(env.VITE_JOORCHIN_SERVER_URL ?? "").trim() || undefined;
/** Shown in the staff sign-in card, so a wrong host is visible instead of silent. */
export const API_HOST = SERVER_URL ?? "https://api.joorchin.ai";
/**
 * `VITE_API_MODE=demo` keeps the bundled demo data even when an app id is set
 * (handy for design work); anything else means live. It can only ever take the
 * backend away, never invent one.
 */
export const API_MODE = String(env.VITE_API_MODE ?? "live").trim().toLowerCase();
export const hasBackend = Boolean(APP_ID) && API_MODE !== "demo";

if (env.DEV && !hasBackend) {
  console.info(
    API_MODE === "demo"
      ? "[joorchin] VITE_API_MODE=demo — serving bundled demo data."
      : "[joorchin] no VITE_JOORCHIN_APP_ID in .env.local — serving bundled demo data.",
  );
}

/** Guest booking session: the server-issued id that owns anonymous bookings. */
const BOOKING_SESSION_KEY = "joorchin-booking-session";

export function readBookingSession() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(BOOKING_SESSION_KEY);
  } catch {
    return null;
  }
}

export function rememberBookingSession(session) {
  try {
    if (session) localStorage.setItem(BOOKING_SESSION_KEY, session);
    else localStorage.removeItem(BOOKING_SESSION_KEY);
  } catch {
    // private mode — bookings then live for this tab only
  }
}

let clientPromise = null;

/**
 * The shared SDK client, or `null` while no app id is configured.
 *
 * The SDK (axios + zod + the client itself, ~350 kB) is imported on first use so
 * pages that never talk to the backend keep the small bundle they had.
 */
export async function getBackend() {
  if (!hasBackend) return null;
  if (!clientPromise) {
    clientPromise = import("@joorchin/client-sdk")
      .then(({ createClient }) =>
        createClient({
          appId: APP_ID,
          serverUrl: SERVER_URL,
          // Never share the token key with another Joorchin app on this origin.
          tokenStorageKey: `joorchin_token_${APP_ID}`,
          options: {
            onError: (error) => {
              if (env.DEV) console.warn("[joorchin]", error?.status ?? "network", error?.message);
            },
          },
        }),
      )
      .catch((error) => {
        // A failed chunk load must not poison the cache for the whole session.
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

/**
 * HTTP status of a failed call, `0` for network/CORS failures.
 * `@/lib/salon-api` treats 0/502/503/504 as "backend unreachable → demo data".
 */
export function statusOf(error) {
  const status = Number(error?.status ?? error?.response?.status ?? 0);
  return Number.isFinite(status) ? status : 0;
}

/** Network failures and gateway errors mean "no backend", not "wrong request". */
export function isUnreachable(error) {
  const status = statusOf(error);
  return status === 0 || status === 502 || status === 503 || status === 504;
}

/** A signed-in session exists (access token persisted by the SDK). */
export function hasSession() {
  try {
    return Boolean(localStorage.getItem(`joorchin_token_${APP_ID}`));
  } catch {
    return false;
  }
}
