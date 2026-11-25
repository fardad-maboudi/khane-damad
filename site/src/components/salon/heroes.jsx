import { ArrowLeft, ArrowUpLeft, Clock, MapPin, Phone, Scissors, Plus, Navigation } from "lucide-react";
import { Btn, Container, Photo, Stars } from "@/components/salon/ui.jsx";
import { about, contact, hours, portfolio, reviews } from "@/content/salon.js";
import { formatPrice, toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

/**
 * Page heroes.
 *
 * Every main page gets its own composition instead of the same green band with a
 * heading: a paper ledger (services), an image wall on near-black (portfolio), an
 * arched editorial portrait (about), a floating quote wall (reviews), a split
 * wayfinding panel (contact) and a typographic index (FAQ).
 *
 * Shared language keeps them one product: ivory paper / deep forest / brass,
 * Estedad for headings, Aref Ruqaa only for calligraphic accents, brass rules,
 * one lead-lined entrance per hero (--i staggers the lead, support, decoration).
 */

/* ---------------------------------- shared --------------------------------- */

export function HeroEyebrow({ children, tone = "dark", className }) {
  return (
    <p
      className={cn(
        "enter inline-flex items-center gap-3 text-[0.72rem] font-bold tracking-[0.18em]",
        tone === "light" ? "text-brass-300" : "text-brass-700",
        className,
      )}
      style={{ "--i": 0 }}
    >
      <span aria-hidden className={cn("h-px w-8", tone === "light" ? "bg-brass-400/70" : "bg-brass-600/60")} />
      {children}
    </p>
  );
}

/** Brass hairline frame used as a quiet offset around arched portraits. */
function ArchFrame({ className }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-t-[999px] rounded-b-[2rem] border border-brass-500/45", className)}
    />
  );
}

const H1 = "text-forest-900";

/* -------------------------------- services -------------------------------- */

export function ServicesHero({ groups = [] }) {
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  const prices = groups.flatMap((g) => g.items.map((i) => i.price)).filter((p) => p > 0);
  const from = prices.length ? Math.min(...prices) : null;

  return (
    <section aria-labelledby="services-hero-title" className="relative overflow-hidden border-b border-ivory-300/80">
      <div aria-hidden className="paper-canvas pointer-events-none absolute inset-0" />
      <Container className="relative pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
          <div>
            <HeroEyebrow>دفتر خدمات · لاهیجان</HeroEyebrow>

            <h1
              id="services-hero-title"
              className={cn("enter mt-5 text-[2rem] font-extrabold leading-[1.4] sm:text-[2.55rem] sm:leading-[1.34] lg:text-[2.95rem] lg:leading-[1.30]", H1)}
              style={{ "--i": 1 }}
            >
              خدماتی دقیق،
              <br className="hidden sm:block" />{" "}
              <span className="relative inline-block">
                شفاف
                <svg aria-hidden viewBox="0 0 120 12" preserveAspectRatio="none" className="absolute -bottom-1.5 start-0 h-2.5 w-full text-brass-500/70">
                  <path d="M2 8C26 3 60 2 118 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>{" "}
              و بی‌واسطه قابل رزرو
            </h1>

            <p className="enter mt-6 max-w-xl text-base leading-8 text-neutral-700 sm:text-lg" style={{ "--i": 2 }}>
              مدت‌زمان و تعرفه هر خدمت پیش روی شماست؛ هر خدمت را که انتخاب کنید مستقیم وارد تقویم رزرو همان خدمت می‌شوید.
            </p>

            <div className="enter mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 3 }}>
              <Btn to="/book" size="lg">
                رزرو نوبت آنلاین <ArrowLeft className="size-5" aria-hidden />
              </Btn>
              <a href="#services-list" className="u-link inline-flex items-center gap-2 px-2 py-2 text-sm font-bold text-forest-900">
                دیدن جدول کامل تعرفه
              </a>
            </div>

            {/* Ledger index — the page identity: a printed menu rather than chips. */}
            {groups.length ? (
              <nav aria-label="دسته‌بندی خدمات" className="enter mt-10" style={{ "--i": 4 }}>
                <ul className="divide-y divide-ivory-300/90 border-y border-ivory-300/90">
                  {groups.map((g, i) => (
                    <li key={g.name}>
                      <a
                        href={`#g-${g.name}`}
                        className="group flex items-center gap-3 py-3 text-sm transition-colors duration-200 hover:text-forest-700"
                      >
                        <span className="num w-5 shrink-0 text-[0.7rem] font-bold text-brass-600">{toFa(i + 1)}</span>
                        <span className="font-bold text-forest-900 transition-colors group-hover:text-forest-700">{g.name}</span>
                        <span aria-hidden className="mx-1 h-px flex-1 border-b border-dotted border-brass-400/60" />
                        <span className="num shrink-0 text-xs text-neutral-600">{toFa(g.items.length)} خدمت</span>
                        <ArrowUpLeft
                          className="size-3.5 shrink-0 -translate-y-px text-brass-600 transition-transform duration-200 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          {/* Arch portrait + a printed price plate overlapping the frame. */}
          <div className="relative mx-auto w-full max-w-sm pb-10 pe-4 sm:pe-6 lg:max-w-md lg:pb-14">
            <div aria-hidden className="paper-canvas pointer-events-none absolute inset-x-6 top-6 bottom-16 rounded-t-[999px] rounded-b-[2rem] opacity-80" />
            <div className="enter-clip relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] border border-brass-400/50 shadow-[0_30px_60px_-30px_rgb(15_32_25/0.55)]" style={{ "--i": 2 }}>
              <Photo id={portfolio[2].id} alt="فرم‌دهی ریش با قیچی در خانه داماد" fill priority sizes="(min-width: 1024px) 34vw, 80vw" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/35 via-transparent to-transparent" />
            </div>
            <ArchFrame className="-inset-x-2 inset-y-3 rounded-t-[999px] rounded-b-[2rem]" />

            <div className="enter absolute bottom-0 start-0 rounded-2xl border border-ivory-300 bg-ivory-50/95 px-4 py-3 shadow-[0_18px_40px_-22px_rgb(15_32_25/0.45)] backdrop-blur-sm" style={{ "--i": 3 }}>
              <p className="flex items-center gap-2 text-[0.68rem] font-bold text-brass-700">
                <Scissors className="size-3.5" aria-hidden /> {total ? `${toFa(total)} خدمت در ${toFa(groups.length)} دسته` : "منوی کامل استودیو"}
              </p>
              <p className="num mt-1 text-sm font-extrabold text-forest-900">
                {from ? `شروع از ${formatPrice(from, "IRT")}` : "تعرفه شفاف، بدون هزینه پنهان"}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------- portfolio ------------------------------- */

export function PortfolioHero({ children, count = portfolio.length }) {
  const shots = [portfolio[0], portfolio[3], portfolio[7]];
  return (
    <section aria-labelledby="portfolio-hero-title" className="ink-canvas relative overflow-hidden text-ivory-50">
      <Container className="relative pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <HeroEyebrow tone="light">آرشیو استودیو · نمونه‌کارها</HeroEyebrow>

            <h1
              id="portfolio-hero-title"
              className="enter mt-5 text-[2rem] font-extrabold leading-[1.4] text-ivory-50 sm:text-[2.55rem] sm:leading-[1.34] lg:text-[2.95rem] lg:leading-[1.30]"
              style={{ "--i": 1 }}
            >
              گالری کات، ریش و
              <span className="block font-[var(--font-display)] text-[1.35em] font-normal leading-[1.15] text-brass-300">
                تشریفات داماد
              </span>
            </h1>

            <p className="enter mt-5 max-w-lg text-base leading-8 text-ivory-200/85 sm:text-lg" style={{ "--i": 2 }}>
              هر قاب، یک نوبت واقعی در استودیو است؛ از فید روزمره تا آماده‌سازی کامل روز مراسم. روی هر تصویر بزنید تا در اندازه کامل ببینید.
            </p>

            <div className="enter mt-8" style={{ "--i": 3 }}>
              {children}
            </div>

            <dl className="enter mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ivory-50/[0.12] pt-6" style={{ "--i": 4 }}>
              <div className="flex items-baseline gap-2">
                <dt className="sr-only">تعداد نمونه‌کار</dt>
                <dd className="num text-2xl font-extrabold text-brass-300">{toFa(count)}</dd>
                <span className="text-xs text-ivory-200/70">نمونه‌کار ثبت‌شده</span>
              </div>
              <div aria-hidden className="h-8 w-px bg-ivory-50/[0.12]" />
              <div className="flex items-baseline gap-2">
                <dt className="sr-only">دسته‌بندی</dt>
                <dd className="num text-2xl font-extrabold text-brass-300">{toFa(4)}</dd>
                <span className="text-xs text-ivory-200/70">دسته‌بندی استایل</span>
              </div>
            </dl>
          </div>

          {/* Image wall: three frames at different scales, one arched — no grid rhythm. */}
          <div className="relative h-[21rem] sm:h-[26rem] lg:h-[31rem]">
            <div aria-hidden className="pointer-events-none absolute end-6 top-2 size-40 rounded-full border border-brass-400/25 sm:size-52" />
            <figure
              className="enter-clip absolute start-0 top-0 h-[68%] w-[54%] overflow-hidden rounded-t-[999px] rounded-b-[1.25rem] border border-ivory-50/15 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]"
              style={{ "--i": 2 }}
            >
              <Photo id={shots[0].id} alt={shots[0].alt} fill priority sizes="(min-width: 1024px) 26vw, 54vw" />
            </figure>
            <figure
              className="enter-clip absolute end-0 top-[12%] h-[56%] w-[46%] overflow-hidden rounded-[1.25rem] border border-ivory-50/15 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.85)]"
              style={{ "--i": 3 }}
            >
              <Photo id={shots[1].id} alt={shots[1].alt} fill sizes="(min-width: 1024px) 22vw, 46vw" />
            </figure>
            <figure
              className="enter-clip absolute bottom-0 start-[22%] h-[46%] w-[50%] overflow-hidden rounded-[1.25rem] border border-brass-500/30 shadow-[0_34px_70px_-30px_rgb(0_0_0/0.9)]"
              style={{ "--i": 4 }}
            >
              <Photo id={shots[2].id} alt={shots[2].alt} fill sizes="(min-width: 1024px) 24vw, 50vw" />
            </figure>
            <span className="enter-fade absolute bottom-[4%] end-[38%] hidden size-14 place-items-center rounded-full border border-brass-400/50 bg-forest-950/70 text-brass-300 backdrop-blur-sm sm:grid" style={{ "--i": 5 }} aria-hidden>
              <Plus className="size-5" />
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------- about --------------------------------- */

export function AboutHero() {
  return (
    <section aria-labelledby="about-hero-title" className="relative overflow-hidden border-b border-ivory-300/80">
      <div aria-hidden className="paper-canvas pointer-events-none absolute inset-0" />
      <Container className="relative grid gap-12 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-20">
        {/* Arch portrait with a brass offset frame and a calligraphic seal. */}
        <div className="relative order-2 mx-auto w-full max-w-sm pb-8 lg:order-1 lg:mb-0 lg:max-w-none">
          <div className="enter-clip relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] border border-brass-400/50 shadow-[0_30px_64px_-32px_rgb(15_32_25/0.5)]" style={{ "--i": 1 }}>
            <Photo id={about.image.id} alt={about.image.alt} fill priority sizes="(min-width: 1024px) 34vw, 82vw" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/30 via-transparent to-transparent" />
          </div>
          <ArchFrame className="-inset-x-2 inset-y-3" />
          <span className="enter-fade absolute -bottom-2 end-2 grid size-20 place-items-center rounded-full border border-brass-400/60 bg-ivory-50 text-center shadow-[0_16px_32px_-18px_rgb(15_32_25/0.4)]" style={{ "--i": 3 }} aria-hidden>
            <span className="font-[var(--font-display)] text-lg leading-tight text-brass-700">
              از
              <br />
              ۱۳۹۰
            </span>
          </span>
        </div>

        <div className="order-1 lg:order-2">
          <HeroEyebrow>داستان و فلسفه استودیو</HeroEyebrow>
          <h1
            id="about-hero-title"
            className={cn("enter mt-5 text-[1.9rem] font-extrabold leading-[1.45] sm:text-[2.4rem] sm:leading-[1.38] lg:text-[2.8rem] lg:leading-[1.32]", H1)}
            style={{ "--i": 1 }}
          >
            {about.title}
          </h1>

          <p className="enter mt-6 max-w-xl text-base leading-9 text-neutral-700 sm:text-lg" style={{ "--i": 2 }}>
            آرامش یک آرایشگاه اصیل مردانه در کنار استانداردهای روز گرومینگ؛ جایی که پیش از هر قیچی، درباره فرم صورت و سبک زندگی شما حرف می‌زنیم.
          </p>

          {/* Calligraphic pull-quote keeps the heritage voice without another card. */}
          <figure className="enter relative mt-8 border-s border-brass-500/50 ps-6" style={{ "--i": 3 }}>
            <blockquote className="font-[var(--font-display)] text-2xl leading-[1.7] text-forest-800 sm:text-[1.75rem]">
              «اصالت در جزئیات نهفته است»
            </blockquote>
            <figcaption className="mt-2 text-xs font-semibold text-neutral-600">منشور استودیو خانه داماد</figcaption>
          </figure>

          <div className="enter mt-9 flex flex-wrap items-center gap-3" style={{ "--i": 4 }}>
            <Btn to="/book" size="lg">
              رزرو نوبت <ArrowLeft className="size-5" aria-hidden />
            </Btn>
            <a href="#team" className="u-link inline-flex items-center gap-2 px-2 py-2 text-sm font-bold text-forest-900">
              آشنایی با استادکاران
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------- reviews -------------------------------- */

export function ReviewsHero({ rating = 5 }) {
  const quotes = [reviews.items[0], reviews.items[2]];
  return (
    <section aria-labelledby="reviews-hero-title" className="relative overflow-hidden border-b border-ivory-300/80">
      <div aria-hidden className="paper-canvas pointer-events-none absolute inset-0" />
      <Container className="relative grid gap-12 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:grid-cols-[1fr_0.98fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-20">
        <div>
          <HeroEyebrow>صدای مشتریان استودیو</HeroEyebrow>
          <h1
            id="reviews-hero-title"
            className={cn("enter mt-5 text-[2rem] font-extrabold leading-[1.4] sm:text-[2.5rem] sm:leading-[1.34] lg:text-[2.9rem] lg:leading-[1.30]", H1)}
            style={{ "--i": 1 }}
          >
            تجربه‌ای که ارزش
            <span className="font-[var(--font-display)] font-normal text-brass-600"> تکرار </span>
            دارد
          </h1>

          <p className="enter mt-5 max-w-lg text-base leading-8 text-neutral-700 sm:text-lg" style={{ "--i": 2 }}>
            رضایت مراجعان، معتبرترین سند کیفیت کار ما در لاهیجان است. این‌ها تجربه‌های واقعی کسانی است که نوبت گرفتند و برگشتند.
          </p>

          <div className="enter mt-8 flex items-end gap-6 border-t border-ivory-300 pt-6" style={{ "--i": 3 }}>
            <div>
              <p className="num text-5xl font-extrabold leading-none text-forest-900">{toFa(rating.toFixed(1))}</p>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={rating} size={16} />
                <span className="text-xs font-semibold text-neutral-600">از ۵</span>
              </div>
            </div>
            <p className="pb-1 text-sm leading-7 text-neutral-700">
              میانگین امتیاز از <span className="num font-bold text-forest-900">{toFa(reviews.items.length)}</span> دیدگاه ثبت‌شده
            </p>
          </div>
        </div>

        {/* Floating quote wall: two real testimonials, slightly rotated, stacked with air. */}
        <div className="relative h-[21rem] sm:h-[23rem]">
          <p aria-hidden className="enter-fade pointer-events-none absolute -top-8 end-0 num text-[8rem] font-extrabold leading-none text-forest-900/[0.06] sm:text-[10rem]" style={{ "--i": 1 }}>
            {toFa(rating.toFixed(1))}
          </p>
          {quotes.map((q, i) => (
            <figure
              key={q.name}
              className={cn(
                "enter-fade absolute w-[86%] rounded-[1.4rem] border border-ivory-300 bg-ivory-50 p-5 shadow-[0_26px_50px_-30px_rgb(15_32_25/0.5)] sm:p-6",
                i === 0 ? "start-0 top-0 -rotate-2" : "end-0 bottom-0 rotate-1",
              )}
              style={{ "--i": i + 2 }}
            >
              <div className="flex items-center justify-between gap-3">
                <Stars value={q.rating} size={13} />
                <span className="text-[0.68rem] font-bold text-brass-700">{q.service}</span>
              </div>
              <blockquote className="mt-3 line-clamp-3 text-sm leading-7 text-charcoal-800">«{q.text}»</blockquote>
              <figcaption className="mt-3 flex items-center gap-2 text-xs font-bold text-forest-900">
                <span className="grid size-7 place-items-center rounded-full bg-forest-800/[0.08] text-[0.7rem] font-extrabold text-forest-800">
                  {q.name.slice(0, 1)}
                </span>
                {q.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------- contact -------------------------------- */

export function ContactHero() {
  const today = hours[0];
  return (
    <section aria-labelledby="contact-hero-title" className="relative bg-ivory-100 pb-12 pt-8 sm:pb-16 sm:pt-10">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-brass-500/35 shadow-[0_36px_70px_-40px_rgb(15_32_25/0.6)]">
          <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
            <div className="forest-canvas order-2 p-7 text-ivory-50 sm:p-10 lg:order-1 lg:p-12">
              <HeroEyebrow tone="light">راه‌های ارتباطی و مسیریابی</HeroEyebrow>
              <h1
                id="contact-hero-title"
                className="enter mt-5 text-[1.95rem] font-extrabold leading-[1.42] text-ivory-50 sm:text-[2.4rem] sm:leading-[1.36] lg:text-[2.7rem] lg:leading-[1.32]"
                style={{ "--i": 1 }}
              >
                میزبان شما در قلب لاهیجان هستیم
              </h1>
              <p className="enter mt-5 max-w-lg text-base leading-8 text-ivory-200/85" style={{ "--i": 2 }}>
                برای مشاوره پکیج داماد، هماهنگی نوبت یا تغییر زمان حضور، با ما در ارتباط باشید؛ تلفن را برمی‌داریم و همان روز راهنمایی می‌کنیم.
              </p>

              <div className="enter mt-8 flex flex-wrap gap-3" style={{ "--i": 3 }}>
                <Btn href={`tel:${contact.phone}`} variant="brass" size="lg">
                  <Phone className="size-4" aria-hidden /> تماس مستقیم
                </Btn>
                <Btn to="/book" variant="outlineLight" size="lg">
                  رزرو نوبت آنلاین <ArrowLeft className="size-4" aria-hidden />
                </Btn>
              </div>

              <dl className="enter mt-9 grid gap-3 border-t border-ivory-50/[0.12] pt-6 text-sm sm:grid-cols-2" style={{ "--i": 4 }}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brass-400/35 text-brass-300">
                    <Clock className="size-4" aria-hidden />
                  </span>
                  <div>
                    <dt className="text-[0.68rem] font-semibold text-ivory-200/60">ساعت کاری</dt>
                    <dd className="num font-bold">
                      {today.open} تا {today.close}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brass-400/35 text-brass-300">
                    <Phone className="size-4" aria-hidden />
                  </span>
                  <div>
                    <dt className="text-[0.68rem] font-semibold text-ivory-200/60">تلفن استودیو</dt>
                    <dd className="num font-bold" dir="ltr">
                      {contact.phoneDisplay}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="relative order-1 min-h-[17rem] lg:order-2 lg:min-h-full">
              <Photo id={portfolio[11].id} alt="فضای استودیو خانه داماد در لاهیجان" fill priority sizes="(min-width: 1024px) 40vw, 92vw" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/15 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-forest-950/45" />
              <div className="enter absolute bottom-4 start-4 end-4 rounded-2xl border border-ivory-300/70 bg-ivory-50/95 p-4 shadow-[0_18px_40px_-22px_rgb(15_32_25/0.55)] backdrop-blur-sm sm:start-5 sm:end-auto sm:max-w-[19rem]" style={{ "--i": 3 }}>
                <p className="flex items-center gap-2 text-[0.68rem] font-bold text-brass-700">
                  <MapPin className="size-3.5" aria-hidden /> نشانی استودیو
                </p>
                <address className="mt-1.5 text-[0.8rem] not-italic leading-6 font-semibold text-forest-900">{contact.addressShort}</address>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-ivory-200 pt-2.5">
                  <span className="text-[0.68rem] font-semibold text-neutral-600">پارکینگ مقابل ساختمان</span>
                  <a href={`https://maps.google.com/?q=${contact.coordinates.lat},${contact.coordinates.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-forest-900 hover:text-brass-700">
                    <Navigation className="size-3" aria-hidden /> مسیریابی
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------- faq ---------------------------------- */

export function FaqHero({ groups = [] }) {
  return (
    <section aria-labelledby="faq-hero-title" className="relative overflow-hidden border-b border-ivory-300/80 bg-ivory-50">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_50%_-10%,rgb(194_160_100/0.14),transparent_58%)]" />
      <p aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 text-center font-[var(--font-display)] text-[16rem] leading-none text-brass-500/[0.08] sm:text-[22rem]">
        ؟
      </p>
      <Container className="relative pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="enter inline-flex items-center justify-center gap-3 text-[0.72rem] font-bold tracking-[0.18em] text-brass-700" style={{ "--i": 0 }}>
            <span aria-hidden className="h-px w-8 bg-brass-600/60" />
            راهنمای مراجعان
            <span aria-hidden className="h-px w-8 bg-brass-600/60" />
          </p>
          <h1
            id="faq-hero-title"
            className={cn("enter mt-5 text-[2rem] font-extrabold leading-[1.42] sm:text-[2.6rem] sm:leading-[1.36] lg:text-[3rem] lg:leading-[1.3]", H1)}
            style={{ "--i": 1 }}
          >
            پاسخ پرسش‌های <span className="font-[var(--font-display)] font-normal text-brass-600">متداول</span>
          </h1>
          <p className="enter mt-5 text-base leading-8 text-neutral-700 sm:text-lg" style={{ "--i": 2 }}>
            همه آنچه پیش از رزرو نوبت، تغییر زمان حضور یا انتخاب پکیج داماد خوب است بدانید.
          </p>
        </div>

        {groups.length ? (
          <nav aria-label="دسته‌بندی پرسش‌ها" className="enter mt-10 border-y border-ivory-300/90 py-3" style={{ "--i": 3 }}>
            <ul className="no-bar flex items-center justify-start gap-x-6 gap-y-2 overflow-x-auto sm:justify-center">
              {groups.map((g, i) => (
                <li key={g} className="flex shrink-0 items-center gap-2 text-xs font-semibold text-neutral-700">
                  <span className="num text-[0.68rem] font-bold text-brass-600">{toFa(i + 1)}</span>
                  <a href={`#faq-${g}`} className="u-link transition-colors hover:text-forest-900">
                    {g}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </section>
  );
}

/* ------------------------------ services page ------------------------------ */

/** Kept for backwards compatibility with any page still importing PageHero. */
export function PageHero({ eyebrow = "خانه داماد · لاهیجان", title, lead, children }) {
  return (
    <section className="forest-canvas relative overflow-hidden border-b border-brass-500/25 py-14 text-ivory-50 sm:py-20">
      <Container className="relative">
        <p className="enter inline-flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-brass-300" style={{ "--i": 0 }}>
          <span aria-hidden className="h-px w-8 bg-brass-400/70" />
          {eyebrow}
        </p>
        <h1 className="enter mt-4 max-w-3xl text-3xl font-extrabold leading-[1.4] text-ivory-50 sm:text-5xl sm:leading-[1.34]" style={{ "--i": 1 }}>
          {title}
        </h1>
        {lead ? (
          <p className="enter mt-4 max-w-2xl text-base leading-8 text-ivory-200/90 sm:text-lg" style={{ "--i": 2 }}>
            {lead}
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
