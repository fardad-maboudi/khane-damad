/**
 * Staff reads/writes of plugin rows through the back-office transport, so the
 * signed-in staff token is used (the visitor seam sends the visitor session and
 * is refused for staff-only rows such as clients, schedules and time off).
 *
 * Every call maps onto `client.backoffice.plugin("bookings").records(entity)`,
 * which is the same `/plugins/bookings/data/:entity` route the pages were written
 * against — only the transport changed.
 */
import { getBackend } from "@/api/joorchin.js";

async function staffPlugin() {
  const client = await getBackend();
  if (!client) throw Object.assign(new Error("Backend is not configured"), { status: 0 });
  return client.backoffice.plugin("bookings");
}

export const staffList = async (entity, query = { limit: 500 }) => (await staffPlugin()).records(entity).list(query);

export const staffGet = async (entity, id) => (await staffPlugin()).records(entity).get(id);

export const staffCreate = async (entity, body) => (await staffPlugin()).records(entity).create(body);

export const staffUpdate = async (entity, id, body) => (await staffPlugin()).records(entity).update(id, body);

export const staffRemove = async (entity, id) => (await staffPlugin()).records(entity).remove(id);

export const staffSaveSettings = async (body) =>
  (await staffPlugin()).action("settings", { method: "PUT", body });
