// Standalone stub for backoffice team API
export const getMyMembership = async () => ({
  membership: {
    capabilities: ["booking:manage"],
    role: "owner",
    name: "مدیر سالن (دمو)",
  },
});
