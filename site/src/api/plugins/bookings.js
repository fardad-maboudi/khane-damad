// Standalone stub for bookings plugin API
// Rejection with status 0 triggers salon-api.js automatic demo mode fallback.

const offline = () => Promise.reject({ status: 0, message: "Standalone dev mode - using local demo fallback" });

function readLocalDemoBookings() {
  try {
    return JSON.parse(localStorage.getItem("khane-demo-bookings") || "[]").map((b) => ({
      ...b,
      startsAt: b.startsAt || new Date(b.start).toISOString(),
      endsAt: b.endsAt || new Date(b.end).toISOString(),
    }));
  } catch {
    return [];
  }
}

export const listServices = offline;
export const listResources = offline;
export const listAvailability = offline;
export const bookSlot = offline;
export const myCredits = async () => [];
export const purchaseServicePackage = offline;
export const listEvents = async () => [];
export const bookEvent = offline;
export const listMyBookings = async () => readLocalDemoBookings();
export const listMyEvents = async () => [];
export const cancelMyBooking = async (id) => {
  try {
    const list = JSON.parse(localStorage.getItem("khane-demo-bookings") || "[]").map((b) =>
      String(b.id) === String(id) ? { ...b, status: "cancelled" } : b,
    );
    localStorage.setItem("khane-demo-bookings", JSON.stringify(list));
  } catch {
    // ignore
  }
  return { ok: true };
};
export const cancelMyEventRegistration = offline;
