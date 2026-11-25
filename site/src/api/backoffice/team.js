/**
 * Staff membership, read through `client.backoffice.team`.
 *
 * The demo membership keeps the preview browsable when no app id is configured.
 * A real 401/403 is rethrown so `/salon/appointments` and `/salon/setup` offer a
 * sign-in instead of pretending to be an operator — the server decides who is
 * staff, this module only reports what it said.
 */
import { getBackend, isUnreachable } from "@/api/joorchin.js";

const DEMO_MEMBERSHIP = {
  membership: {
    capabilities: ["booking:manage"],
    role: "owner",
    name: "مدیر سالن (دمو)",
    demo: true,
  },
};

export async function getMyMembership() {
  const client = await getBackend();
  if (!client) return DEMO_MEMBERSHIP;
  try {
    return await client.backoffice.team.myMembership();
  } catch (error) {
    if (isUnreachable(error)) return DEMO_MEMBERSHIP;
    throw error;
  }
}

/** Capability check used by /salon/appointments and /salon/setup. Owners always manage. */
export function canManageBookings(membership) {
  const member = membership?.membership ?? membership;
  const capabilities = member?.capabilities ?? member?.role?.capabilities ?? [];
  const role = typeof member?.role === "string" ? member.role : member?.role?.key;
  return (
    member?.isOwner === true ||
    role === "owner" ||
    capabilities.includes("booking:manage") ||
    capabilities.includes("*")
  );
}
