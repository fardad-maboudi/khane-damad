import { Fragment } from "react";
import { ArrowLeft, Check, Sparkles, ShieldCheck, Clock, Award, Scissors } from "lucide-react";
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
    <section className="relative overflow-hidden border-b border-ivory-300/70 bg-ivory-50/70" aria-labelledby="hero-title">
      <div aria-hidden className="pointer-events-none absolute -start-40 top-6 size-[36rem] rounded-full bg-brass-200/35 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -end-32 bottom-0 size-[28rem] rounded-full bg-forest-100/50 blur-3xl" />
      <Container className="relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-20 lg:pb-28 lg:pt-16">
        <div>
          <p className="hero-rise inline-flex items-center gap-2 rounded-full border border-brass-400/50 bg-ivory-100 px-4 py-1.5 text-xs font-bold text-brass-700" style={{ "--i": 0 }}>
            <Scissors className="size-3.5 text-brass-600" aria-hidden />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-5 text-[2.45rem] font-extrabold !leading-[1.36] text-forest-900 sm:text-5xl sm:!leading-[1.34] lg:text-[4.35rem] lg:!leading-[1.28]">
            {words.map((word, i) => (
              <Fragment key={word + i}>
                <span className="hero-rise inline-block" style={{ "--i": i + 1 }}>
                  {i === 1 ? (
                    <span className="relative inline-block text-forest-800">
                      {word}
                      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1.5 h-3.5 w-full text-brass-500">
                        <path className="hero-stroke" d="M2 9 C 50 2, 120 14, 198 5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" pathLength="1" />
                      </svg>
                    </span>
                  ) : (
                    word
                  )}
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className="hero-rise mt-6 max-w-xl text-lg leading-9 text-neutral-700" style={{ "--i": 5 }}>{hero.lead}</p>
          <div className="hero-rise mt-8 flex flex-col gap-3.5 sm:flex-row" style={{ "--i": 6 }}>
            <Btn to="/book" size="lg">
              رزرو نوبت آنلاین <ArrowLeft className="size-5" aria-hidden />
            </Btn>
            <Btn to="/services" variant="outline" size="lg">
              خدمات و تعرفه شفاف
            </Btn>
          </div>
          <ul className="hero-rise mt-9 grid gap-3 border-t border-ivory-300/80 pt-6 text-sm font-medium text-neutral-800 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-3" style={{ "--i": 7 }}>
            {hero.points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-forest-800/10 text-forest-800">
                  <Check className="size-3.5 text-brass-700" aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* RTL-safe logical arch framing (no physical translate-x) */}
        <div className="relative mx-auto w-full max-w-md pe-3 pb-6 sm:pe-6 lg:max-w-none">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-3 end-0 start-3 rounded-t-[999px] rounded-b-[2rem] border border-brass-500/65 sm:inset-y-5 sm:start-6"
          />
          <div className="hero-arch relative overflow-hidden rounded-t-[999px] rounded-b-[2rem] border border-ivory-300/60 shadow-[0_32px_64px_-28px_rgb(15_32_25/0.55)]">
            <Photo id={hero.image.id} alt={hero.image.alt} ratio="4 / 5" priority sizes="(min-width: 1024px) 42vw, 90vw" className="hero-photo" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-950/45 via-transparent to-transparent" />
            {/* Calligraphic brand seal badge inside top-start */}
            <div className="absolute start-5 top-6 rounded-full border border-ivory-50/25 bg-forest-950/70 px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-[var(--font-display)] text-sm text-brass-200">خانه داماد · لاهیجان</span>
            </div>
          </div>

          {/* Floating social proof plaque */}
          <div
            className="hero-rise absolute bottom-0 end-2 flex items-center gap-3.5 rounded-2xl border border-brass-400/50 bg-ivory-50/95 px-4 py-3.5 shadow-[0_20px_44px_-18px_rgb(15_32_25/0.5)] backdrop-blur-md sm:end-8"
            style={{ "--i": 8 }}
          >
            <Stars value={averageRating()} size={16} />
            <div className="border-s border-ivory-300 ps-3.5 text-sm leading-tight">
              <p className="font-extrabold text-forest-900 num">{toFa(averageRating().toFixed(1))} از ۵ امتیاز رضایت</p>
              <p className="mt-0.5 text-xs text-neutral-600">{counts}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Heritage Craftsmanship Ribbon — anchors the Savile Row / Lahijan mood immediately below the fold */
function CraftRibbon() {
  const items = [
    { icon: Clock, title: "نوبت‌دهی دقیق، بدون معطلی", desc: "ساعت شروع هر نوبت متعلق به شماست" },
    { icon: ShieldCheck, title: "استریل اختصاصی ابزار", desc: "پک بهداشتی و تیغ نو برای هر مراجعه‌کننده" },
    { icon: Award, title: "استادکاران باسابقه لاهیجان", desc: "بیش از ۱۵ سال تجربه در کات کلاسیک و مدرن" },
    { icon: Sparkles, title: "تشریفات ویژه داماد", desc: "مشاوره استایل، پاکسازی و آماده‌سازی روز مراسم" },
  ];
  return (
    <section aria-label="ارزش‌های استودیو خانه داماد" className="forest-canvas border-b border-brass-500/25 py-8 text-ivory-50 sm:py-10">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brass-400/30 bg-ivory-50/5 text-brass-300">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-ivory-50">{title}</p>
                <p className="mt-1 text-xs leading-6 text-ivory-300/85">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
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
          <SectionHeading
            eyebrow="گزیده خدمات و تعرفه"
            id="services-title"
            title="هر آنچه برای ظاهری آراسته لازم دارید"
            lead="از یک کات دقیق روزمره تا پکیج تشریفاتی داماد؛ مدت‌زمان و تعرفه هر خدمت پیش از رزرو شفاف است."
          />
          <Link to="/services" className="inline-flex items-center gap-2 self-start rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:border-brass-500 hover:bg-ivory-200/50 sm:self-auto">
            همه خدمات و جدول تعرفه <ArrowLeft className="size-4 text-brass-600" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr_1fr] lg:grid-rows-2">
          {isLoading ? [0, 1, 2, 3].map((n) => <ServiceCardSkeleton key={n} />) : null}
          {isError ? (
            <div className="col-span-full">
              <p role="alert" className="rounded-2xl border border-danger-600/30 bg-danger-50 p-6 text-danger-900">
                دریافت خدمات ممکن نشد.{" "}
                <button type="button" className="font-bold underline" onClick={() => refetch()}>
                  تلاش دوباره
                </button>
              </p>
            </div>
          ) : null}
          {lead ? (
            <Reveal className="lg:row-span-2">
              <ServiceCard service={lead} className="h-full" large />
            </Reveal>
          ) : null}
          {rest.map((service, index) => (
            <Reveal key={service.id} delay={(index + 1) * 90} className={index === 2 ? "lg:col-span-2" : ""}>
              <ServiceCard service={service} className="h-full" wide={index === 2} />
            </Reveal>
          ))}
          {data && !featured.length ? (
            <div className="col-span-full">
              <CatalogEmpty />
            </div>
          ) : null}
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
    <section aria-labelledby="offer-title" className="py-4">
      <Container>
        <Reveal className="forest-canvas relative grid overflow-hidden rounded-[2rem] border border-brass-500/35 text-ivory-50 shadow-[0_30px_60px_-28px_rgb(15_32_25/0.6)] md:grid-cols-[1.18fr_0.82fr]">
          <div className="relative flex flex-col justify-center p-7 sm:p-11 lg:p-14">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brass-400/50 bg-ivory-50/5 px-3.5 py-1 text-xs font-bold text-brass-300">
              <Sparkles className="size-3.5" aria-hidden /> {offer.badge}
            </p>
            <p className="mt-5 font-[var(--font-display)] text-2xl text-brass-200 sm:text-3xl">تشریفات روز دامادی</p>
            <h2 id="offer-title" className="mt-2 text-3xl font-extrabold leading-[1.35] sm:text-4xl">{offer.title}</h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-ivory-200/90">{offer.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Btn to={href} variant="brass" size="lg">
                {offer.cta} <ArrowLeft className="size-5" aria-hidden />
              </Btn>
              <span className="text-sm font-semibold text-brass-300 num">{offer.until}</span>
            </div>
          </div>
          <div className="relative min-h-[18rem] md:min-h-[24rem]">
            <Photo id={offer.image.id} alt={offer.image.alt} ratio="4 / 3" sizes="(min-width: 768px) 38vw, 92vw" className="h-full min-h-[18rem] md:!aspect-auto" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent md:bg-gradient-to-e md:from-forest-900/60" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** Genuine editorial asymmetric gallery layout (replaces the no-op lg:row-span-1 bug) */
function WorkSection() {
  const picks = [portfolio[0], portfolio[3], portfolio[2], portfolio[7], portfolio[5]];
  return (
    <section aria-labelledby="work-title" className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="گالری استودیو"
            id="work-title"
            title="نتیجه، بهتر از هر توضیحی حرف می‌زند"
            lead="نمونه‌هایی از ظرافت کات، خط‌گیری ریش با تیغ و آماده‌سازی داماد در خانه داماد."
          />
          <Link to="/portfolio" className="inline-flex items-center gap-2 self-start rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:border-brass-500 hover:bg-ivory-200/50 sm:self-auto">
            مشاهده همه ۱۶ نمونه‌کار <ArrowLeft className="size-4 text-brass-600" aria-hidden />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-12">
          {/* Editorial lead portrait spanning 5 cols & 2 rows on desktop */}
          <li className="col-span-2 lg:col-span-5 lg:row-span-2">
            <Reveal className="h-full">
              <Link to={`/portfolio?photo=${picks[0].id}`} className="group block h-full rounded-[1.35rem]" aria-label={`مشاهده تصویر: ${picks[0].title}`}>
                <PortfolioTile item={picks[0]} ratio="4 / 4.8" className="h-full" />
              </Link>
            </Reveal>
          </li>
          {picks.slice(1).map((item, index) => (
            <li key={item.id} className={index === 0 || index === 3 ? "lg:col-span-4" : "lg:col-span-3"}>
              <Reveal delay={(index + 1) * 80} className="h-full">
                <Link to={`/portfolio?photo=${item.id}`} className="group block h-full rounded-[1.35rem]" aria-label={`مشاهده تصویر: ${item.title}`}>
                  <PortfolioTile item={item} ratio="4 / 4.2" className="h-full" />
                </Link>
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
    <section aria-labelledby="reviews-title" className="border-y border-ivory-300/80 bg-ivory-50 py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="دیدگاه مراجعان"
            id="reviews-title"
            title="اعتمادی که روی صندلی استودیو ساخته شده"
            lead="تجربه مشتری‌های ثابت و دامادهایی که روز مراسمشان را به تیم ما سپرده‌اند."
          />
          <div className="flex items-center gap-4 rounded-2xl border border-ivory-300 bg-ivory-100/80 px-5 py-3.5">
            <p className="text-4xl font-extrabold text-forest-900 num sm:text-5xl">{toFa(rating.toFixed(1))}</p>
            <div>
              <Stars value={rating} size={17} />
              <p className="mt-1 text-xs font-semibold text-neutral-600">میانگین {toFa(reviews.items.length)} دیدگاه ثبت‌شده</p>
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.items.slice(0, 3).map((review, index) => (
            <Reveal key={review.name + review.date} delay={index * 90}>
              <ReviewCard review={review} featured={index === 1} />
            </Reveal>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Btn to="/reviews" variant="outline">خواندن همه نظرات</Btn>
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
    <section aria-labelledby="team-title" className="pt-[var(--space-section)] pb-6 sm:pb-8">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="استادکاران استودیو"
            id="team-title"
            title="دست‌های حرفه‌ای پشت هر استایل"
            lead="هر آرایشگر تخصص مشخص و تقویم مستقل دارد؛ مستقیم با استاد دلخواهتان نوبت بگیرید."
          />
          <Link to="/about" className="inline-flex items-center gap-2 self-start rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:border-brass-500 hover:bg-ivory-200/50 sm:self-auto">
            داستان ما و معرفی کامل تیم <ArrowLeft className="size-4 text-brass-600" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {data.barbers.map((barber, index) => (
            <Reveal key={barber.id} delay={index * 90}>
              <BarberCard barber={barber} services={data.services} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  const catalog = useCatalog();
  const counts = catalog.data ? `${toFa(catalog.data.barbers.length)} استادکار · ${toFa(catalog.data.services.length)} خدمت تخصصی` : "تیم حرفه‌ای لاهیجان";
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
      <CraftRibbon />
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
