// Standalone stub for backoffice client API
import { readDemoClients } from "./bookings.js";

export const backofficeList = async (path) => {
  if (String(path).endsWith("/booking_client")) return readDemoClients();
  return [];
};
export const backofficeRequest = async () => ({});
