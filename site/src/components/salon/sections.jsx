import { Clock, Navigation, Phone, ExternalLink, ArrowLeft, Quote, Scissors, Sparkles, MapPin } from "lucide-react";
import { Btn, Container, EmptyState, Photo, Reveal, SectionHeading, Stars, WhatsappIcon, TelegramIcon, InstagramIcon } from "@/components/salon/ui.jsx";
import { contact, hours, loyalty, teamExtras, pexelsUrl } from "@/content/salon.js";
import { formatDuration, formatPrice, toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";
import { directionLinks, specialtiesOf } from "@/lib/salon-helpers.js";

/* ---------------- Services ---------------- */

export function ServiceCard({ service, className, large = false, wide = false }) {
  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-[1.5rem] border border-ivory-300 bg-ivory-50 transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brass-400 hover:shadow-[0_24px_48px_-24px_rgb(15_32_25/0.45)]",
        wide ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      {/* Media grows to absorb any spare height of a stretched grid cell, so a card never
          shows an empty band above or below the photo. */}
      <div
        className={cn(
          "img-zoom relative flex overflow-hidden",
          wide
            ? "aspect-[16/10] sm:aspect-auto sm:w-[45%] sm:shrink-0 sm:self-stretch sm:min-h-[15rem]"
            : large
              ? "aspect-[16/10] lg:aspect-auto lg:min-h-[24rem] lg:flex-1"
              : "aspect-[16/10] lg:aspect-auto lg:min-h-[10rem] lg:flex-1",
        )}
      >
        <Photo
          src={service.image}
          alt={`${service.name} در خانه داماد`}
          fill
          sizes="(min-width: 1024px) 32vw, 92vw"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent" />
        <span className="absolute start-3.5 top-3.5 rounded-full border border-ivory-50/25 bg-forest-900/80 px-3 py-1 text-[0.72rem] font-bold text-brass-200 backdrop-blur-sm">
          {service.group}
        </span>
        {large ? (
          <span className="absolute end-3.5 top-3.5 hidden items-center gap-1.5 rounded-full border border-brass-300/40 bg-brass-400 px-3 py-1 text-[0.72rem] font-extrabold text-charcoal-900 sm:inline-flex">
            <Sparkles className="size-3" aria-hidden /> پیشنهاد استودیو
          </span>
        ) : null}
        {service.package ? (
          <span className="absolute bottom-3 end-3 rounded-full bg-brass-400 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-charcoal-900">
            دارای بسته تخفیفی
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col p-6",
          large && "sm:p-7",
          wide && "sm:flex-1 sm:justify-center sm:p-7",
        )}
      >
        <h3 className={cn("font-bold leading-snug text-forest-900 transition-colors group-hover:text-forest-700", large ? "text-2xl sm:text-[1.7rem]" : "text-lg sm:text-xl")}>
          {service.name}
        </h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-7 text-neutral-700">{service.description}</p>
        <dl className="mt-5 flex items-center justify-between border-t border-ivory-200 pt-4 text-sm">
          <div>
            <dt className="sr-only">مدت</dt>
            <dd className="flex items-center gap-1.5 font-medium text-neutral-700 num">
              <Clock className="size-4 text-brass-600" aria-hidden /> {formatDuration(service.durationMinutes)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">قیمت</dt>
            <dd className="text-base font-extrabold text-forest-900 num">{formatPrice(service.price, service.currency)}</dd>
          </div>
        </dl>
        <Btn to={`/book?service=${encodeURIComponent(service.id)}`} variant={large ? "primary" : "outline"} size="sm" className="mt-5 w-full">
          رزرو این خدمت <ArrowLeft className="size-4" aria-hidden />
        </Btn>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[1.5rem] border border-ivory-300 bg-ivory-50">
      <div className="animate-pulse bg-ivory-200" style={{ aspectRatio: "16 / 10" }} />
      <div className="space-y-3 p-6">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ivory-300 bg-ivory-50 transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-brass-400 hover:shadow-[0_24px_48px_-24px_rgb(15_32_25/0.4)]">
      <div className="img-zoom relative">
        <Photo src={barber.avatar} alt={`${barber.name}، ${barber.title}`} ratio="4 / 4.5" sizes="(min-width: 1024px) 30vw, 90vw" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
        {extras?.experience ? (
          <span className="num absolute bottom-3.5 start-3.5 rounded-full border border-ivory-50/25 bg-forest-900/85 px-3 py-1 text-xs font-bold text-brass-200 backdrop-blur-sm">
            {extras.experience}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-extrabold text-forest-900">{barber.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brass-700">{barber.title}</p>
        {detailed && barber.bio ? <p className="mt-3.5 text-sm leading-7 text-neutral-700">{barber.bio}</p> : null}
        {specialties.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="تخصص‌ها">
            {specialties.map((item) => (
              <li key={item} className="rounded-full border border-forest-700/20 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800">
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto pt-6">
          <Btn to={`/book?barber=${encodeURIComponent(barber.id)}`} variant="outline" size="sm" className="w-full">
            رزرو مستقیم با {barber.name.split(" ")[0]} <ArrowLeft className="size-4" aria-hidden />
          </Btn>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Reviews ---------------- */

export function ReviewCard({ review, featured = false }) {
  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-[1.5rem] border p-6 sm:p-7 transition-colors",
        featured
          ? "forest-canvas border-brass-500/30 text-ivory-50 shadow-[0_24px_48px_-24px_rgb(15_32_25/0.6)]"
          : "border-ivory-300 bg-ivory-50 hover:border-brass-400/70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Quote className={cn("size-7", featured ? "text-brass-400" : "text-brass-500")} aria-hidden />
        <Stars value={review.rating} size={15} />
      </div>
      <blockquote className={cn("mt-4 flex-1 text-[0.95rem] leading-8", featured ? "text-ivory-100" : "text-charcoal-800")}>
        «{review.text}»
      </blockquote>
      <figcaption className={cn("mt-6 flex items-center justify-between gap-3 border-t pt-4", featured ? "border-ivory-50/15" : "border-ivory-200")}>
        <div>
          <p className={cn("font-bold", featured ? "text-ivory-50" : "text-forest-900")}>{review.name}</p>
          <p className={cn("mt-0.5 text-xs", featured ? "text-brass-200" : "text-neutral-600")}>
            {review.service} · <span className="num">{review.date}</span>
          </p>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold", featured ? "bg-ivory-50/10 text-brass-200" : "bg-forest-50 text-forest-800")}>
          مراجعه ثبت‌شده
        </span>
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
          <tr key={row.day} className={cn("border-b last:border-0", light ? "border-ivory-50/12" : "border-ivory-200")}>
            <th scope="row" className="py-3 text-start font-semibold">{row.day}</th>
            <td className={cn("py-3 text-end num font-medium", light ? "text-ivory-200" : row.note ? "text-brass-700" : "text-forest-900")}>
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
    <div className={cn("group relative overflow-hidden rounded-[1.5rem] border border-ivory-300 bg-ivory-200 p-2 shadow-[0_20px_44px_-24px_rgb(15_32_25/0.35)]", className)}>
      <div className="relative h-full min-h-[19rem] w-full overflow-hidden rounded-[1.1rem] border border-ivory-300/80">
        <iframe title="نقشه موقعیت خانه داماد در لاهیجان" src={src} loading="lazy" referrerPolicy="no-referrer" className="map-warm block h-full min-h-[19rem] w-full" />
        <div className="pointer-events-none absolute bottom-3 start-3 flex items-center gap-2 rounded-full border border-ivory-300/90 bg-ivory-50/95 px-3.5 py-1.5 text-xs font-bold text-forest-900 shadow-sm backdrop-blur-sm">
          <MapPin className="size-3.5 text-brass-600" aria-hidden />
          <span>{contact.addressShort}</span>
        </div>
      </div>
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

export function LocationSection({ heading = true, className }) {
  return (
    <section aria-labelledby="location-title" className={cn("pt-6 pb-8 sm:pt-8 sm:pb-10", className)}>
      <Container>
        {heading ? (
          <SectionHeading
            eyebrow="نشانی و ساعت کاری"
            id="location-title"
            title="ما را در قلب لاهیجان پیدا کنید"
            lead={contact.address}
          />
        ) : null}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Reveal><MapEmbed className="h-full min-h-[22rem]" /></Reveal>
          <Reveal delay={120} className="flex flex-col justify-between rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
            <div>
              <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-forest-900">
                <Clock className="size-5 text-brass-600" aria-hidden /> ساعت پذیرش استودیو
              </h3>
              <HoursTable className="mt-4" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-ivory-200 pt-5">
              {directionLinks().map((link) => (
                <Btn key={link.href} href={link.href} variant="outline" size="sm">
                  <Navigation className="size-4" aria-hidden /> {link.label}
                </Btn>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Portfolio grid ---------------- */

export function PortfolioTile({ item, onOpen, ratio, fill = false, className }) {
  const categoryLabels = {
    haircut: "مدل مو",
    beard: "ریش و تیغ",
    groom: "داماد",
    studio: "فضای استودیو",
  };
  const content = (
    <>
      <Photo
        id={item.id}
        alt={item.alt}
        fill={fill}
        ratio={fill ? null : ratio || `${item.width} / ${item.height}`}
        sizes="(min-width: 1024px) 30vw, 48vw"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-forest-950/90 via-forest-950/35 to-transparent p-4 pt-14 text-ivory-50 opacity-95 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
        <span className="text-[0.7rem] font-bold text-brass-300">{categoryLabels[item.category] || "نمونه‌کار"}</span>
        <span className="mt-0.5 text-sm font-bold">{item.title}</span>
      </span>
    </>
  );

  const sharedClasses = cn(
    "img-zoom group relative block w-full overflow-hidden rounded-[1.35rem] border border-ivory-300/80 bg-ivory-200 text-start transition-[border-color,box-shadow] duration-300 hover:border-brass-400 hover:shadow-[0_20px_40px_-22px_rgb(15_32_25/0.45)]",
    className,
  );

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(item)} className={sharedClasses} aria-label={`مشاهده تصویر بزرگ‌تر: ${item.title}`}>
        {content}
      </button>
    );
  }

  return <div className={sharedClasses}>{content}</div>;
}

/* ---------------- Final CTA ---------------- */

export function FinalCta({
  title = "نوبت بعدی‌ات را بدون انتظار رزرو کن",
  text = "خدمت و استاد پیرایشگر دلخواهت را انتخاب کن؛ فقط ساعت‌های واقعاً آزاد نمایش داده می‌شود.",
  className,
}) {
  return (
    <section aria-labelledby="final-cta" className={cn("pt-6 sm:pt-8", className)}>
      <Container>
        <Reveal className="forest-canvas relative overflow-hidden rounded-[2rem] border border-brass-500/35 px-6 py-14 text-center text-ivory-50 shadow-[0_32px_64px_-28px_rgb(15_32_25/0.65)] sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${pexelsUrl(30547746, 1200)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "luminosity",
            }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-900/80 to-forest-900/75" />
          <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-brass-400/20 sm:inset-5" />
          <div className="relative mx-auto max-w-xl">
            <p className="font-[var(--font-display)] text-3xl text-brass-300 sm:text-4xl">بهترین ورژن خودت باش</p>
            <h2 id="final-cta" className="mt-4 text-2xl font-extrabold leading-[1.45] sm:text-4xl">{title}</h2>
            <p className="mt-3.5 text-base leading-8 text-ivory-200/90">{text}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Btn to="/book" variant="brass" size="lg">
                رزرو نوبت آنلاین <ArrowLeft className="size-5" aria-hidden />
              </Btn>
              <Btn href={`tel:${contact.phone}`} variant="outlineLight" size="lg">
                <Phone className="size-5" aria-hidden /> <span dir="ltr" className="num">{contact.phoneDisplay}</span>
              </Btn>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------------- Editorial Subpage Hero (Valid single <h1>, dark forest luxury) ---------------- */

export function PageHero({ eyebrow = "خانه داماد · لاهیجان", title, lead, children }) {
  return (
    <section className="forest-canvas relative overflow-hidden border-b border-brass-500/25 py-14 text-ivory-50 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute -end-28 -top-24 size-96 rounded-full border border-brass-400/15" />
      <div aria-hidden className="pointer-events-none absolute -end-16 -top-12 size-72 rounded-full border border-brass-400/10" />
      <Container className="relative">
        <SectionHeading
          as="h1"
          size="xl"
          tone="light"
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          className="max-w-3xl"
        />
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

/** Stamp card: bespoke gentleman's club membership card with 5 brass seals. */
export function LoyaltyBand({ className }) {
  return (
    <section aria-labelledby="loyalty-title" className={cn("py-0", className)}>
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-brass-400/60 bg-ivory-50 p-6 shadow-[0_24px_50px_-28px_rgb(15_32_25/0.3)] sm:p-10 lg:p-12">
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.5rem] border border-brass-400/25" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1.15fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brass-400/50 bg-brass-100 px-3.5 py-1 text-xs font-bold text-brass-700">
                <Sparkles className="size-3.5" aria-hidden /> باشگاه مشتریان وفادار
              </p>
              <h2 id="loyalty-title" className="mt-4 text-3xl font-extrabold leading-[1.35] text-forest-900 sm:text-4xl">
                {loyalty.title}
              </h2>
              <p className="mt-4 max-w-lg leading-8 text-neutral-700">{loyalty.text}</p>
              <Btn to="/book" className="mt-7">
                اولین مهر را ثبت کن <ArrowLeft className="size-5" aria-hidden />
              </Btn>
            </div>
            <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-100/80 p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>کارت عضویت خانه داماد</span>
                <span className="num text-brass-700">{toFa(loyalty.every)} مراجعه = {toFa(loyalty.discountPercent)}٪ هدیه</span>
              </div>
              <ol aria-label="مراحل کارت وفاداری" className="grid grid-cols-5 gap-2.5 sm:gap-4">
                {Array.from({ length: loyalty.every }, (_, i) => {
                  const last = i === loyalty.every - 1;
                  return (
                    <li key={i} className="flex flex-col items-center gap-2.5 text-center">
                      <span
                        className={cn(
                          "grid aspect-square w-full place-items-center rounded-full border-2 transition-transform duration-300 hover:scale-105",
                          last
                            ? "border-brass-500 bg-brass-200/70 text-brass-700 shadow-[0_8px_20px_-6px_rgb(176_141_87/0.5)]"
                            : "border-dashed border-forest-700/35 bg-ivory-50 text-forest-800",
                        )}
                      >
                        {last ? (
                          <span className="num text-sm font-extrabold leading-tight sm:text-lg">{toFa(loyalty.discountPercent)}٪</span>
                        ) : (
                          <Scissors className="size-4 sm:size-5" aria-hidden />
                        )}
                      </span>
                      <span className={cn("text-xs font-semibold sm:text-sm", last ? "text-brass-700 font-bold" : "text-neutral-700")}>
                        {last ? "هدیه وفاداری" : `مهر ${toFa(i + 1)}`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
