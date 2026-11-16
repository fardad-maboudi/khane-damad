/**
 * Staff reads/writes of plugin rows through the back-office SDK transport, so the
 * signed-in staff token is used (the visitor seam sends the visitor session and
 * is refused for staff-only rows such as clients, schedules and time off).
 */
import { backofficeList, backofficeRequest } from "@/api/backoffice/client";

const base = (entity) => `/plugins/bookings/data/${entity}`;

export const staffList = (entity, query = { limit: 500 }) => backofficeList(base(entity), query);
export const staffCreate = (entity, body) => backofficeRequest(base(entity), { method: "POST", body });
export const staffUpdate = (entity, id, body) => backofficeRequest(`${base(entity)}/${id}`, { method: "PUT", body });
export const staffSaveSettings = (body) => backofficeRequest("/plugins/bookings/settings", { method: "PUT", body });
