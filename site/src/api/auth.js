/**
 * Session seam for the site.
 *
 * The SDK owns the tokens: it persists the access token under
 * `joorchin_token_<appId>`, refreshes it on a 401 and attaches it to every
 * authenticated request.
 */
import { APP_ID, getBackend, hasSession, statusOf } from "@/api/joorchin.js";

const tokenKey = APP_ID ? `joorchin_token_${APP_ID}` : null;
export const AUTH_CHANGE_EVENT = "khane:auth-changed";

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

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

/** Current signed-in user profile (`client.auth.me()`), or `null` for guests. */
export async function getMe() {
  if (!hasSession()) return null;
  const client = await getBackend();
  if (!client) return null;
  try {
    return await client.auth.me();
  } catch (error) {
    if ([401, 403].includes(statusOf(error))) return null;
    throw error;
  }
}

/** Update the signed-in user's profile (`client.auth.updateMe()`). */
export async function updateMe(data) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  const updated = await client.auth.updateMe(data);
  notifyAuthChange();
  return updated;
}

/** Customer sign-in step 1: send an OTP to the customer's phone. */
export async function requestCustomerOtp(phone) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  return client.auth.requestOtp(phone);
}

/** Customer sign-in step 2: verify the OTP and save the session. */
export async function verifyCustomerOtp({ phone, otpCode, fullName }) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  const res = await client.auth.verifyOtp({ phone, otpCode, ...(fullName ? { fullName } : {}) });
  notifyAuthChange();
  return res;
}

/** Customer sign-in with phone + password. */
export async function loginCustomerWithPassword(phone, password) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  const res = await client.auth.loginWithPassword(phone, password);
  notifyAuthChange();
  return res;
}

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
  const res = await client.auth.loginStaffViaPhoneOtp(phone, code);
  notifyAuthChange();
  return res;
}

/** Staff sign-in with a password (set once from a signed-in session). */
export async function loginStaffWithPassword(phone, password) {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  const res = await client.auth.loginStaffWithPassword(phone, password);
  notifyAuthChange();
  return res;
}

export async function signOut() {
  const client = await getBackend();
  if (client) {
    try {
      await client.auth.logout();
    } catch {
      // The local session is cleared by the SDK either way.
    }
  }
  notifyAuthChange();
}
