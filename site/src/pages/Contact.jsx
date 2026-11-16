import { Clock, MapPin, Phone } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Container, Reveal } from "@/components/salon/ui.jsx";
import { FinalCta, HoursTable, MapEmbed, PageHero, QuickContact } from "@/components/salon/sections.jsx";
import { directionLinks } from "@/lib/salon-helpers.js";
import { Btn } from "@/components/salon/ui.jsx";
import { contact } from "@/content/salon.js";

export default function Contact() {
  return (
    <>
      <Seo title="تماس و آدرس" description={`آدرس خانه داماد: ${contact.address}. تلفن ${contact.phoneDisplay}، ساعت کاری و مسیریابی.`} />
      <PageHero title="خانه داماد، لاهیجان" lead="برای هماهنگی، تغییر نوبت یا پرسش درباره پکیج داماد، با ما در تماس باشید." />
      <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Reveal className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest-900"><MapPin className="size-5 text-brass-600" aria-hidden /> آدرس</h2>
            <address className="mt-3 not-italic leading-8 text-neutral-800">{contact.address}</address>
            <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-7 text-neutral-700">{contact.directions.map((d) => <li key={d}>{d}</li>)}</ol>
            <div className="mt-5 flex flex-wrap gap-3">{directionLinks().map((l) => <Btn key={l.href} href={l.href} variant="outline" size="sm">{l.label}</Btn>)}</div>
          </Reveal>
          <Reveal delay={80} className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest-900"><Phone className="size-5 text-brass-600" aria-hidden /> تماس سریع</h2>
            <ul className="mt-3 space-y-1 text-neutral-800">
              <li>تلفن ثابت: <a className="font-semibold" dir="ltr" href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a></li>
              <li>موبایل: <a className="font-semibold" dir="ltr" href={`tel:${contact.mobile}`}>{contact.mobileDisplay}</a></li>
            </ul>
            <QuickContact className="mt-4" size="sm" />
          </Reveal>
          <Reveal delay={160} className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest-900"><Clock className="size-5 text-brass-600" aria-hidden /> ساعت کاری</h2>
            <HoursTable className="mt-3" />
          </Reveal>
        </div>
        <Reveal><MapEmbed className="h-full min-h-[26rem]" /></Reveal>
      </Container>
      <FinalCta />
    </>
  );
}
