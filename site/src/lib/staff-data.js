/**
 * Staff reads/writes of plugin rows through the back-office transport, falling
 * back to `client.entities` when the `bookings` plugin is not installed on the
 * Joorchin app (e.g. models seeded directly from `models.json`).
 */
import { withBookingsFallback } from "@/api/joorchin.js";

const idOf = (row) => String(row?._id ?? row?.id ?? "");

export const staffList = (entity, query = { limit: 500 }) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").records(entity).list(query),
    (client) => {
      const limit = query?.limit ?? 500;
      const skip = query?.skip;
      const sort = query?.sort;
      if (query?.filter && Object.keys(query.filter).length > 0) {
        return client.entities[entity].filter(query.filter, sort, limit, skip);
      }
      return client.entities[entity].list(sort, limit, skip);
    },
  );

export const staffGet = (entity, id) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").records(entity).get(id),
    (client) => client.entities[entity].get(id),
  );

export const staffCreate = (entity, body) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").records(entity).create(body),
    (client) => client.entities[entity].create(body),
  );

export const staffUpdate = (entity, id, body) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").records(entity).update(id, body),
    (client) => client.entities[entity].update(id, body),
  );

export const staffRemove = (entity, id) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").records(entity).remove(id),
    (client) => client.entities[entity].delete(id),
  );

export const staffSaveSettings = (body) =>
  withBookingsFallback(
    (client) => client.backoffice.plugin("bookings").action("settings", { method: "PUT", body }),
    async (client) => {
      const existing = await client.entities.booking_setting.list(undefined, 1);
      const first = Array.isArray(existing) ? existing[0] : null;
      if (first && idOf(first)) {
        return client.entities.booking_setting.update(idOf(first), body);
      }
      return client.entities.booking_setting.create(body);
    },
  );
