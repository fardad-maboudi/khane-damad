/**
 * Applies the bundled seed pack (src/seed/khane-damad.seed.json) through the
 * back-office SDK. Idempotent: rows are matched by name / (barber, service,
 * weekday) and never duplicated. Used by /salon/setup after importing the
 * data-free template; scripts/seed.ts does the same from the command line.
 */
import pack from "@/seed/khane-damad.seed.json";
import { staffCreate, staffList, staffSaveSettings, staffUpdate } from "@/lib/staff-data.js";
import { createService, generateSlots, updateService } from "@/api/backoffice/bookings";

const idOf = (row) => String(row?._id ?? row?.id ?? "");
const rows = async (entity) => [...(await staffList(entity))];

export function seedStepCount() {
  return 3 + pack.services.reduce((n, s) => n + s.resources.length * pack.schedule.weekdays.length, 0) + pack.timeoff.length + 1;
}

export async function applySeedPack(onProgress = () => {}) {
  let done = 0;
  const total = seedStepCount();
  const tick = (label) => onProgress({ done: ++done, total, label });

  await staffSaveSettings(pack.settings);
  tick("تنظیمات رزرو");

  const resources = new Map();
  const existingResources = await rows("booking_resource");
  for (const { key, ...fields } of pack.resources) {
    const found = existingResources.find((r) => r.name === fields.name);
    const saved = found
      ? await staffUpdate("booking_resource", idOf(found), { ...fields, active: true })
      : await staffCreate("booking_resource", { ...fields, active: true });
    resources.set(key, idOf(found ?? saved));
  }
  tick("آرایشگرها");

  const services = new Map();
  const existingServices = await rows("booking_service");
  for (const { key, resources: who, ...fields } of pack.services) {
    const body = {
      ...fields,
      kind: "solo",
      mode: "in_person",
      currency: "IRT",
      capacity: 1,
      bufferAfterMinutes: 0,
      autoConfirm: false,
      active: true,
      resourceIds: who.map((k) => resources.get(k)),
    };
    const found = existingServices.find((s) => s.name === fields.name);
    const saved = found ? await updateService(idOf(found), body) : await createService(body);
    services.set(key, idOf(found ?? saved));
  }
  tick("خدمات و تعرفه");

  // One schedule per (barber, service, weekday): the slot generator keys slots by schedule.
  const existingSchedules = await rows("booking_schedule");
  for (const service of pack.services) {
    for (const who of service.resources) {
      for (const weekday of pack.schedule.weekdays) {
        const resource = resources.get(who);
        const serviceId = services.get(service.key);
        const exists = existingSchedules.some((e) => String(e.resource) === resource && String(e.service) === serviceId && Number(e.weekday) === weekday);
        if (!exists) {
          await staffCreate("booking_schedule", {
            resource,
            service: serviceId,
            weekday,
            startTime: pack.schedule.startTime,
            endTime: pack.schedule.endTime,
            slotIntervalMinutes: pack.schedule.slotIntervalMinutes,
            active: true,
          });
        }
        tick("ساعت کاری");
      }
    }
  }

  const existingTimeoff = await rows("booking_timeoff");
  for (const off of pack.timeoff) {
    const resource = resources.get(off.resource);
    if (!existingTimeoff.some((e) => String(e.resource) === resource && e.reason === off.reason)) {
      const start = new Date();
      start.setDate(start.getDate() + off.daysFromToday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 0);
      await staffCreate("booking_timeoff", { resource, startsAt: start.toISOString(), endsAt: end.toISOString(), allDay: off.allDay, kind: off.kind, reason: off.reason });
    }
    tick("مرخصی");
  }

  // One pass per barber: the generator reads at most 2000 existing slots per call.
  for (const resourceId of resources.values()) {
    await generateSlots({ daysAhead: pack.slotGeneration.daysAhead, resourceId });
  }
  tick("ساخت زمان‌های خالی");
  return { services: services.size, barbers: resources.size };
}
