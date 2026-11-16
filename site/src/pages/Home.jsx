import { Fragment } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, Photo, Reveal, SectionHeading, Stars } from "@/components/salon/ui.jsx";
import {
  BarberCard,
  CatalogEmpty,
  FinalCta,
  LocationSection,
  LoyaltyBand,
  PortfolioTile,
  ReviewCard,
  ReviewLink,
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/salon/sections.jsx";
import { averageRating } from "@/lib/salon-helpers.js";
import { brand, contact, hero, offer, portfolio, reviews } from "@/content/salon.js";
import { toFa } from "@/lib/fa.js";
import { groupServices, useCatalog } from "@/lib/salon-api.js";

function Hero({ counts }) {
  const words = hero.title.split(" ");
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div aria-hidden className="pointer-events-none absolute -start-40 top-10 size-[34rem] rounded-full bg-brass-200/40 blur-3xl" />
      <Container className="relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pb-28 lg:pt-16">
        <div>
          <p className="hero-rise text-sm font-semibold text-brass-700" style={{ "--i": 0 }}>{hero.eyebrow}</p>
          <h1 id="hero-title" className="mt-5 text-[2.9rem] font-extrabold leading-[1.22] text-forest-900 sm:text-6xl lg:text-[4.6rem]">
            {words.map((word, i) => (
              <Fragment key={word + i}>
              <span className="hero-rise inline-block" style={{ "--i": i + 1 }}>
                {i === 1 ? (
                  <span className="relative inline-block">
                    {word}
                    <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1 h-3 w-full text-brass-500">
                      <path className="hero-stroke" d="M2 9 C 50 2, 120 14, 198 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="1" />
                    </svg>
                  </span>
                ) : word}
              </span>
              {" "}
              </Fragment>
            ))}
          </h1>
          <p className="hero-rise mt-7 max-w-xl text-lg leading-9 text-neutral-700" style={{ "--i": 5 }}>{hero.lead}</p>
          <div className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 6 }}>
            <Btn to="/book" size="lg">رزرو نوبت <ArrowLeft className="size-5" aria-hidden /></Btn>
            <Btn to="/services" variant="outline" size="lg">خدمات و تعرفه</Btn>
          </div>
          <ul className="hero-rise mt-9 flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-neutral-800" style={{ "--i": 7 }}>
            {hero.points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check className="size-4 text-brass-600" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-[2rem] border border-brass-500/70 sm:translate-x-6 sm:translate-y-6" />
          <div className="hero-arch relative overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[0_30px_60px_-30px_rgb(15_32_25/0.55)]">
            <Photo id={hero.image.id} alt={hero.image.alt} ratio="4 / 5" priority sizes="(min-width: 1024px) 42vw, 90vw" className="hero-photo" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-900/35 via-transparent to-transparent" />
          </div>
          <div className="hero-rise absolute -bottom-6 end-2 flex items-center gap-3 rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 shadow-[0_18px_40px_-18px_rgb(15_32_25/0.5)] sm:end-6" style={{ "--i": 8 }}>
            <Stars value={averageRating()} size={15} />
            <div className="text-sm leading-tight">
              <p className="font-bold text-forest-900 num">{toFa(averageRating().toFixed(1))} از ۵</p>
              <p className="text-neutral-600">{counts}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ServicesSection({ catalog }) {
  const { data, isLoading, isError, refetch } = catalog;
  const featured = data ? groupServices(data.services).map((g) => g.items[0]).slice(0, 4) : [];
  const [lead, ...rest] = featured;
  return (
    <section aria-labelledby="services-title" className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading title={<span id="services-title">هر آنچه برای ظاهری مرتب لازم داری</span>} lead="از یک کات ساده تا پکیج کامل داماد؛ مدت و قیمت هر خدمت شفاف است." />
          <Link to="/services" className="inline-flex items-center gap-2 font-semibold text-forest-800 underline decoration-brass-500 decoration-2 underline-offset-8 hover:text-forest-900">
            همه خدمات و تعرفه <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr_1fr] lg:grid-rows-2">
          {isLoading ? [0, 1, 2, 3].map((n) => <ServiceCardSkeleton key={n} />) : null}
          {isError ? (
            <div className="col-span-full"><p role="alert" className="rounded-2xl border border-[#8a2a22]/30 bg-[#fbeeea] p-6 text-[#5c1b16]">دریافت خدمات ممکن نشد. <button type="button" className="font-bold underline" onClick={() => refetch()}>تلاش دوباره</button></p></div>
          ) : null}
          {lead ? <Reveal className="lg:row-span-2"><ServiceCard service={lead} className="h-full" large /></Reveal> : null}
          {rest.map((service, index) => (
            <Reveal key={service.id} delay={(index + 1) * 90} className={index === 2 ? "lg:col-span-2" : ""}><ServiceCard service={service} className="h-full" wide={index === 2} /></Reveal>
          ))}
          {data && !featured.length ? <div className="col-span-full"><CatalogEmpty /></div> : null}
        </div>
      </Container>
    </section>
  );
}

function OfferSection({ services }) {
  if (!offer.active) return null;
  const target = services?.find((s) => s.name === offer.serviceName);
  const href = target ? `/book?service=${encodeURIComponent(target.id)}` : "/book";
  return (
    <section aria-labelledby="offer-title">
      <Container>
        <Reveal className="grid overflow-hidden rounded-[1.75rem] bg-forest-900 text-ivory-50 md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 sm:p-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-brass-400/50 px-3 py-1 text-xs font-semibold text-brass-300"><Sparkles className="size-3.5" aria-hidden /> {offer.badge}</p>
            <h2 id="offer-title" className="mt-5 text-3xl font-bold leading-[1.4] sm:text-4xl">{offer.title}</h2>
            <p className="mt-4 max-w-lg text-ivory-200 leading-8">{offer.text}</p>
            <p className="mt-3 text-sm text-brass-300">{offer.until}</p>
            <Btn to={href} variant="brass" size="lg" className="mt-7">{offer.cta} <ArrowLeft className="size-5" aria-hidden /></Btn>
          </div>
          <Photo id={offer.image.id} alt={offer.image.alt} ratio="4 / 3" sizes="(min-width: 768px) 35vw, 90vw" className="min-h-[16rem] md:!aspect-auto md:h-full" />
        </Reveal>
      </Container>
    </section>
  );
}

function WorkSection() {
  const picks = [portfolio[0], portfolio[3], portfolio[2], portfolio[7], portfolio[4], portfolio[5]];
  return (
    <section aria-labelledby="work-title" className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading title={<span id="work-title">نتیجه، بهتر از هر توضیحی حرف می‌زند</span>} lead="چند نمونه از کات، ریش و آماده‌سازی داماد در استودیو." />
          <Link to="/portfolio" className="inline-flex items-center gap-2 font-semibold text-forest-800 underline decoration-brass-500 decoration-2 underline-offset-8 hover:text-forest-900">
            مشاهده همه نمونه‌کارها <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {picks.map((item, index) => (
            <li key={item.id} className={index === 0 || index === 3 ? "lg:row-span-1" : ""}>
              <Reveal delay={(index % 3) * 80}>
                <Link to={`/portfolio?photo=${item.id}`} className="block"><PortfolioTile item={item} /></Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function ReviewsSection() {
  const rating = averageRating();
  return (
    <section aria-labelledby="reviews-title" className="bg-ivory-50 py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading title={<span id="reviews-title">مشتری‌هایمان چه می‌گویند</span>} />
          <div className="flex items-center gap-4">
            <p className="text-5xl font-extrabold text-forest-900 num">{toFa(rating.toFixed(1))}</p>
            <div><Stars value={rating} size={18} /><p className="mt-1 text-sm text-neutral-600">میانگین {toFa(reviews.items.length)} نظر نمونه</p></div>
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.items.slice(0, 3).map((review, index) => (
            <Reveal key={review.name + review.date} delay={index * 90}><ReviewCard review={review} /></Reveal>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Btn to="/reviews" variant="outline">همه نظرات</Btn>
          <ReviewLink />
        </div>
      </Container>
    </section>
  );
}

function TeamSection({ catalog }) {
  const { data } = catalog;
  if (!data?.barbers.length) return null;
  return (
    <section aria-labelledby="team-title" className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading title={<span id="team-title">دست‌های حرفه‌ای پشت هر کات</span>} lead="هر آرایشگر تخصص مشخص و تقویم مستقل دارد؛ مستقیم با او نوبت بگیرید." />
          <Link to="/about" className="inline-flex items-center gap-2 font-semibold text-forest-800 underline decoration-brass-500 decoration-2 underline-offset-8 hover:text-forest-900">
            آشنایی با تیم <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {data.barbers.map((barber, index) => (
            <Reveal key={barber.id} delay={index * 90}><BarberCard barber={barber} services={data.services} /></Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  const catalog = useCatalog();
  const counts = catalog.data ? `${toFa(catalog.data.barbers.length)} آرایشگر · ${toFa(catalog.data.services.length)} خدمت` : "تیم حرفه‌ای لاهیجان";
  return (
    <>
      <Seo title={null} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HairSalon",
            name: brand.name,
            description: brand.description,
            telephone: `+98${contact.phone.slice(1)}`,
            address: { "@type": "PostalAddress", addressLocality: brand.city, addressCountry: "IR", streetAddress: contact.addressShort },
            geo: { "@type": "GeoCoordinates", latitude: contact.coordinates.lat, longitude: contact.coordinates.lng },
            openingHours: "Sa-Th 10:00-21:00",
            priceRange: "۲۰۰٬۰۰۰ تا ۴٬۵۰۰٬۰۰۰ تومان",
          }),
        }}
      />
      <Hero counts={counts} />
      <ServicesSection catalog={catalog} />
      <OfferSection services={catalog.data?.services} />
      <WorkSection />
      <ReviewsSection />
      <TeamSection catalog={catalog} />
      <LoyaltyBand />
      <LocationSection />
      <FinalCta />
    </>
  );
}
