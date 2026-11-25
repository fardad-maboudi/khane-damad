import { Clock, MapPin, Phone, Navigation } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, Reveal } from "@/components/salon/ui.jsx";
import { FinalCta, HoursTable, MapEmbed, QuickContact } from "@/components/salon/sections.jsx";
import { ContactHero } from "@/components/salon/heroes.jsx";
import { directionLinks } from "@/lib/salon-helpers.js";
import { contact } from "@/content/salon.js";

export default function Contact() {
  return (
    <>
      <Seo title="تماس و آدرس" description={`آدرس خانه داماد: ${contact.address}. تلفن ${contact.phoneDisplay}، ساعت کاری و مسیریابی.`} />
      <ContactHero />
      <Container className="grid gap-8 py-14 sm:py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Reveal className="lift rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 shadow-[0_18px_40px_-34px_rgb(15_32_25/0.5)] hover:border-brass-400/70 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-forest-900">
              <MapPin className="size-5 text-brass-600" aria-hidden /> نشانی و راهنمای دسترسی
            </h2>
            <address className="mt-3 not-italic leading-8 font-medium text-charcoal-900">{contact.address}</address>
            <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-7 text-neutral-700">
              {contact.directions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-ivory-200 pt-5">
              {directionLinks().map((l) => (
                <Btn key={l.href} href={l.href} variant="outline" size="sm">
                  <Navigation className="size-4" aria-hidden /> {l.label}
                </Btn>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80} className="lift rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 shadow-[0_18px_40px_-34px_rgb(15_32_25/0.5)] hover:border-brass-400/70 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-forest-900">
              <Phone className="size-5 text-brass-600" aria-hidden /> تماس مستقیم
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-800">
              <li className="flex items-center justify-between border-b border-ivory-200 pb-2.5">
                <span className="text-neutral-600">تلفن ثابت استودیو</span>
                <a className="num font-extrabold text-forest-900 hover:text-brass-700" dir="ltr" href={`tel:${contact.phone}`}>
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-600">موبایل هماهنگی</span>
                <a className="num font-extrabold text-forest-900 hover:text-brass-700" dir="ltr" href={`tel:${contact.mobile}`}>
                  {contact.mobileDisplay}
                </a>
              </li>
            </ul>
            <QuickContact className="mt-5 pt-2" size="sm" />
          </Reveal>

          <Reveal delay={160} className="lift rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 shadow-[0_18px_40px_-34px_rgb(15_32_25/0.5)] hover:border-brass-400/70 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-forest-900">
              <Clock className="size-5 text-brass-600" aria-hidden /> ساعت کاری هفتگی
            </h2>
            <HoursTable className="mt-3" />
          </Reveal>
        </div>
        <Reveal variant="fade" className="overflow-hidden rounded-[1.5rem] border border-ivory-300 shadow-[0_24px_60px_-40px_rgb(15_32_25/0.55)]">
          <MapEmbed className="h-full min-h-[28rem]" />
        </Reveal>
      </Container>
      <FinalCta />
    </>
  );
}
