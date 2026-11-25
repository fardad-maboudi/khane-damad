/**
 * Session seam for the site.
 *
 * The SDK owns the tokens: it persists the access token under
 * `joorchin_token_<appId>`, refreshes it on a 401 and attaches it to every
 * authenticated request. Nothing here needs to build headers for the SDK — these
 * helpers exist for React Query keys (which must change when the identity
 * changes) and for the staff sign-in UI.
 */
import { APP_ID, getBackend, hasSession } from "@/api/joorchin.js";

const tokenKey = APP_ID ? `joorchin_token_${APP_ID}` : null;

export function getToken() {
  if (!tokenKey) return null;
  try {
    return localStorage.getItem(tokenKey);
  } catch {
    return null;
  }
}

/**
 * Not real headers — a short fingerprint of the current session, used as part of
 * query keys so signing in/out re-fetches instead of showing another user's rows.
 */
export function getAuthHeaders() {
  const token = getToken();
  return token ? { authorization: `session:${token.slice(-8)}` } : {};
}

export function getSession() {
  const token = getToken();
  return token ? { access_token: token } : null;
}

export const isSignedIn = hasSession;

/** Staff sign-in step 1: send an OTP to a phone that belongs to this site's team. */
export async function requestStaffOtp(phone) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  return client.auth.requestStaffOtp(phone);
}

/** Staff sign-in step 2: verify the code; the SDK saves the session pair. */
export async function loginStaff(phone, code) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  return client.auth.loginStaffViaPhoneOtp(phone, code);
}

/** Staff sign-in with a password (set once from a signed-in session). */
export async function loginStaffWithPassword(phone, password) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  return client.auth.loginStaffWithPassword(phone, password);
}

export async function signOut() {
  const client = await getBackend();
  if (!client) return;
  try {
    await client.auth.logout();
  } catch {
    // The local session is cleared by the SDK either way.
  }
}
