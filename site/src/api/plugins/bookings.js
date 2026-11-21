// Standalone stub for bookings plugin API
// Rejection with status 0 triggers salon-api.js automatic demo mode fallback.

const offline = () => Promise.reject({ status: 0, message: "Standalone dev mode - using local demo fallback" });

export const listServices = offline;
export const listResources = offline;
export const listAvailability = offline;
export const bookSlot = offline;
export const myCredits = async () => [];
export const purchaseServicePackage = offline;
export const listEvents = async () => [];
export const bookEvent = offline;
