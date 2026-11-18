import { Clock, Navigation, Phone, ExternalLink, ArrowLeft, Quote, Scissors } from "lucide-react";
import { Btn, Container, EmptyState, Photo, Reveal, SectionHeading, Stars, WhatsappIcon, TelegramIcon, InstagramIcon } from "@/components/salon/ui.jsx";
import { contact, hours, loyalty, teamExtras, pexelsUrl } from "@/content/salon.js";
import { formatDuration, formatPrice, toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";
import { directionLinks, specialtiesOf } from "@/lib/salon-helpers.js";

/* ---------------- Services ---------------- */

export function ServiceCard({ service, className, large = false, wide = false }) {
  return (
    <article className={cn("group flex overflow-hidden rounded-2xl border border-ivory-300 bg-ivory-50 transition-[box-shadow,transform] duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(15_32_25/0.45)]", wide ? "flex-col sm:flex-row" : "flex-col", className)}>
      <div className={cn("img-zoom", wide && "sm:w-2/5 sm:shrink-0", large && "lg:flex lg:min-h-[22rem] lg:flex-1 lg:flex-col")}>
        <Photo src={service.image} alt={`${service.name} در خانه داماد`} ratio="16 / 10" sizes="(min-width: 1024px) 30vw, 90vw" className={cn(wide && "sm:!aspect-auto sm:h-full sm:min-h-[12rem]", large && "lg:!aspect-auto lg:h-full lg:flex-1")} />
      </div>
      <div className={cn("flex flex-1 flex-col p-5", large && "p-7")}>
        <p className="text-xs font-semibold text-brass-700">{service.group}</p>
        <h3 className={cn("mt-1 font-bold leading-snug text-forest-900", large ? "text-2xl" : "text-lg")}>{service.name}</h3>
        <p className={cn("mt-2 line-clamp-3 text-sm leading-7 text-neutral-700", !large && "flex-1")}>{service.description}</p>
        <dl className="mt-4 flex items-center justify-between border-t border-ivory-300 pt-4 text-sm">
          <div>
            <dt className="sr-only">مدت</dt>
            <dd className="flex items-center gap-1.5 text-neutral-700"><Clock className="size-4 text-brass-600" aria-hidden /> {formatDuration(service.durationMinutes)}</dd>
          </div>
          <div>
            <dt className="sr-only">قیمت</dt>
            <dd className="font-bold text-forest-800">{formatPrice(service.price, service.currency)}</dd>
          </div>
        </dl>
        <Btn to={`/book?service=${encodeURIComponent(service.id)}`} variant="outline" size="sm" className="mt-4 w-full">
          رزرو این خدمت
        </Btn>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-ivory-300 bg-ivory-50">
      <div className="animate-pulse bg-ivory-200" style={{ aspectRatio: "16 / 11" }} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-ivory-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-ivory-200" />
        <div className="h-3 w-full animate-pulse rounded bg-ivory-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-ivory-200" />
      </div>
    </div>
  );
}

/* ---------------- Team ---------------- */

export function BarberCard({ barber, services = [], detailed = false }) {
  const extras = teamExtras[barber.name];
  const specialties = specialtiesOf(barber, services);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ivory-300 bg-ivory-50">
      <div className="img-zoom">
        <Photo src={barber.avatar} alt={`${barber.name}، ${barber.title}`} ratio="4 / 4.4" sizes="(min-width: 1024px) 30vw, 90vw" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-forest-900">{barber.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brass-700">{barber.title}{extras?.experience ? ` · ${extras.experience}` : ""}</p>
        {detailed && barber.bio ? <p className="mt-3 text-sm leading-7 text-neutral-700">{barber.bio}</p> : null}
        {specialties.length ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="تخصص‌ها">
            {specialties.map((item) => (
              <li key={item} className="rounded-full border border-forest-700/25 bg-forest-50 px-3 py-1 text-xs font-medium text-forest-800">{item}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto pt-5">
          <Btn to={`/book?barber=${encodeURIComponent(barber.id)}`} variant="outline" size="sm" className="w-full">
            رزرو با {barber.name.split(" ")[0]}
          </Btn>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Reviews ---------------- */

export function ReviewCard({ review }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
      <Quote className="size-7 text-brass-400" aria-hidden />
      <blockquote className="mt-3 flex-1 text-[0.95rem] leading-8 text-charcoal-800">{review.text}</blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-ivory-300 pt-4">
        <div>
          <p className="font-bold text-forest-900">{review.name}</p>
          <p className="text-xs text-neutral-600">{review.service} · {review.date}</p>
        </div>
        <Stars value={review.rating} size={15} />
      </figcaption>
    </figure>
  );
}

export function ReviewLink({ className }) {
  if (!contact.reviewPageUrl) return null;
  return (
    <Btn href={contact.reviewPageUrl} variant="outline" className={className}>
      <ExternalLink className="size-4" aria-hidden /> دیدن و ثبت نظر در صفحه نقشه
    </Btn>
  );
}

/* ---------------- Location, hours, contact ---------------- */

export function HoursTable({ className, light = false }) {
  return (
    <table className={cn("w-full text-sm", className)}>
      <caption className="sr-only">ساعت کاری خانه داماد</caption>
      <tbody>
        {hours.map((row) => (
          <tr key={row.day} className={cn("border-b last:border-0", light ? "border-ivory-50/12" : "border-ivory-300")}>
            <th scope="row" className="py-2.5 text-start font-semibold">{row.day}</th>
            <td className={cn("py-2.5 text-end num", light ? "text-ivory-200" : "text-neutral-700")}>
              {row.note ? row.note : <span>{row.open} تا {row.close}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MapEmbed({ className }) {
  const { lat, lng } = contact.coordinates;
  const d = 0.0045;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 1.6}%2C${lat - d}%2C${lng + d * 1.6}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-ivory-300 bg-ivory-200", className)}>
      <iframe title="نقشه موقعیت خانه داماد در لاهیجان" src={src} loading="lazy" referrerPolicy="no-referrer" className="block h-full min-h-[18rem] w-full" />
    </div>
  );
}

export function QuickContact({ className, size = "md" }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Btn href={`tel:${contact.phone}`} size={size}><Phone className="size-4" aria-hidden /> تماس تلفنی</Btn>
      {contact.whatsapp ? <Btn href={`https://wa.me/${contact.whatsapp}`} variant="outline" size={size}><WhatsappIcon className="size-4" /> واتس‌اپ</Btn> : null}
      {contact.telegram ? <Btn href={`https://t.me/${contact.telegram}`} variant="outline" size={size}><TelegramIcon className="size-4" /> تلگرام</Btn> : null}
      {contact.instagram ? <Btn href={`https://instagram.com/${contact.instagram}`} variant="outline" size={size}><InstagramIcon className="size-4" /> اینستاگرام</Btn> : null}
    </div>
  );
}

export function LocationSection({ heading = true }) {
  return (
    <section aria-labelledby="location-title" className="py-[var(--space-section)]">
      <Container>
        {heading ? <SectionHeading title={<span id="location-title">ما را در قلب لاهیجان پیدا کنید</span>} lead={contact.address} /> : null}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Reveal><MapEmbed className="h-full min-h-[20rem]" /></Reveal>
          <Reveal delay={120} className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-forest-900"><Clock className="size-5 text-brass-600" aria-hidden /> ساعت کاری</h3>
            <HoursTable className="mt-3" />
            <div className="mt-5 flex flex-wrap gap-3">
              {directionLinks().map((link) => (
                <Btn key={link.href} href={link.href} variant="outline" size="sm"><Navigation className="size-4" aria-hidden /> {link.label}</Btn>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Portfolio grid ---------------- */

export function PortfolioTile({ item, onOpen, className }) {
  const content = (
    <>
      <Photo id={item.id} alt={item.alt} ratio={`${item.width} / ${item.height}`} sizes="(min-width: 1024px) 25vw, 45vw" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/80 to-transparent p-4 pt-12 text-sm font-semibold text-ivory-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        {item.title}
      </span>
    </>
  );

  const sharedClasses = cn("img-zoom group relative block w-full overflow-hidden rounded-2xl text-start", className);

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(item)} className={sharedClasses} aria-label={`مشاهده تصویر: ${item.title}`}>
        {content}
      </button>
    );
  }

  return (
    <div className={sharedClasses} aria-hidden="true">
      {content}
    </div>
  );
}

/* ---------------- Final CTA ---------------- */

export function FinalCta({ title = "نوبت بعدی‌ات را همین حالا بگیر", text = "خدمت و آرایشگر دلخواه را انتخاب کن؛ فقط ساعت‌های واقعاً خالی نمایش داده می‌شود." }) {
  return (
    <section aria-labelledby="final-cta">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[1.75rem] bg-forest-800 px-6 py-14 text-center text-ivory-50 sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${pexelsUrl(30547746, 800)})`, backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "luminosity" }} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest-900/70 to-forest-900/90" />
          <div className="relative mx-auto max-w-xl">
            <p className="font-[var(--font-display)] text-3xl text-brass-300 sm:text-4xl">بهترین ورژن خودت باش</p>
            <h2 id="final-cta" className="mt-4 text-2xl font-bold leading-[1.5] sm:text-3xl">{title}</h2>
            <p className="mt-3 text-ivory-200">{text}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Btn to="/book" variant="brass" size="lg">رزرو نوبت <ArrowLeft className="size-5" aria-hidden /></Btn>
              <Btn href={`tel:${contact.phone}`} variant="outlineLight" size="lg"><Phone className="size-5" aria-hidden /> {contact.phoneDisplay}</Btn>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------------- Misc ---------------- */

export function PageHero({ title, lead, children }) {
  return (
    <section className="border-b border-ivory-300 bg-ivory-50 py-14 sm:py-20">
      <Container>
        <SectionHeading title={<h1 className="inline">{title}</h1>} lead={lead} className="max-w-3xl [&>h2]:text-4xl sm:[&>h2]:text-5xl" />
        {children}
      </Container>
    </section>
  );
}

export function CatalogEmpty() {
  return (
    <EmptyState
      title="خدمات هنوز تعریف نشده است"
      text="صاحب سایت از بخش مدیریت نوبت، خدمت‌ها و آرایشگرها را اضافه می‌کند. همین حالا می‌توانید با ما تماس بگیرید."
      action={<Btn href={`tel:${contact.phone}`} size="sm"><Phone className="size-4" aria-hidden /> تماس با استودیو</Btn>}
    />
  );
}

function CountBadge({ children }) {
  return <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-800 num">{typeof children === "number" ? toFa(children) : children}</span>;
}

/** Stamp card: five seals, the fifth is the reward. Staff stamp it when an appointment is completed. */
export function LoyaltyBand() {
  return (
    <section aria-labelledby="loyalty-title" className="py-[var(--space-section)]">
      <Container>
        <Reveal className="grid items-center gap-8 rounded-[1.75rem] border border-brass-400/60 bg-ivory-50 p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:p-12">
          <div>
            <h2 id="loyalty-title" className="text-3xl font-bold leading-[1.4] text-forest-900 sm:text-4xl">{loyalty.title}</h2>
            <p className="mt-4 max-w-lg leading-8 text-neutral-700">{loyalty.text}</p>
            <Btn to="/book" className="mt-7">اولین مهر را بگیر <ArrowLeft className="size-5" aria-hidden /></Btn>
          </div>
          <ol aria-label="مراحل کارت وفاداری" className="grid grid-cols-5 gap-2 sm:gap-4">
            {Array.from({ length: loyalty.every }, (_, i) => {
              const last = i === loyalty.every - 1;
              return (
                <li key={i} className="flex flex-col items-center gap-2 text-center">
                  <span className={cn("grid aspect-square w-full place-items-center rounded-full border-2 border-dashed", last ? "border-brass-500 bg-brass-200/50 text-brass-700" : "border-forest-700/35 text-forest-700")}>
                    {last ? <span className="num text-sm font-extrabold leading-tight sm:text-base">{toFa(loyalty.discountPercent)}٪</span> : <Scissors className="size-5" aria-hidden />}
                  </span>
                  <span className="text-xs font-medium text-neutral-700 sm:text-sm">{last ? "تخفیف" : `مهر ${toFa(i + 1)}`}</span>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
