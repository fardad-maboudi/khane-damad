// Standalone stub for query hooks keys
export const queryKeys = {
  plugin: (name) => ["plugin", name],
  bookings: {
    all: ["bookings"],
    lists: () => ["bookings", "list"],
    list: (filters) => ["bookings", "list", filters],
    details: () => ["bookings", "detail"],
    detail: (id) => ["bookings", "detail", id],
  },
};
