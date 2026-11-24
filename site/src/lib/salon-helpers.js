import { contact, loyalty, reviews, teamExtras } from "@/content/salon.js";
import { formatDateLong, formatTime, toEnDigits } from "@/lib/fa.js";

export const averageRating = () => reviews.items.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.items.length);

export function specialtiesOf(barber, services = []) {
  const extra = teamExtras[barber.name]?.specialties;
  if (extra) return extra;
  return services.filter((s) => s.resourceIds.includes(barber.id)).slice(0, 3).map((s) => s.name);
}

export function directionLinks() {
  const { lat, lng } = contact.coordinates;
  return [
    { label: "مسیریابی با گوگل‌مپ", href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
    { label: "مسیریابی با Waze", href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
  ];
}

/**
 * Stamp-card state from completed visits (booking_client.visitCount, which the
 * plugin raises when staff mark an appointment completed).
 */
export function loyaltyState(visits) {
  const done = Math.max(0, Number(visits) || 0);
  const inCard = done % loyalty.every;
  const rewardReady = done > 0 && inCard === 0;
  return { visits: done, stamps: rewardReady ? loyalty.every : inCard, remaining: rewardReady ? 0 : loyalty.every - inCard, rewardReady, percent: loyalty.discountPercent };
}

export function discountedPrice(price, state) {
  return state.rewardReady ? Math.round((Number(price) * (100 - state.percent)) / 100) : Number(price);
}

/** Receptionist-assisted reminder: a prefilled WhatsApp or SMS message to the customer. */
export function reminderText({ booking, service, barber }) {
  const when = `${formatDateLong(booking.startsAt)} ساعت ${formatTime(booking.startsAt)}`;
  return `${booking.customerName} عزیز، یادآوری نوبت شما در خانه داماد لاهیجان: ${service?.name ?? "خدمت"}${barber ? ` با ${barber.name}` : ""}، ${when}. نشانی: ${contact.addressShort}. برای تغییر یا لغو تا ۱۲ ساعت قبل تماس بگیرید: ${contact.phoneDisplay}`;
}

export function reminderLinks(phone, text) {
  const digits = toEnDigits(String(phone || "")).replace(/\D/g, "");
  const intl = digits.startsWith("98") ? digits : `98${digits.replace(/^0/, "")}`;
  return {
    whatsapp: `https://wa.me/${intl}?text=${encodeURIComponent(text)}`,
    sms: `sms:+${intl}?body=${encodeURIComponent(text)}`,
  };
}
