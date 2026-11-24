import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, Reveal, Spinner, ErrorState, SectionHeading } from "@/components/salon/ui.jsx";
import PackageSection from "@/components/salon/PackageSection.jsx";
import { CatalogEmpty, FinalCta, LoyaltyBand, PageHero, ServiceCard } from "@/components/salon/sections.jsx";
import { groupServices, useCatalog } from "@/lib/salon-api.js";
import { formatDuration, formatPrice, toFa } from "@/lib/fa.js";

export default function Services() {
  const { data, isLoading, isError, refetch } = useCatalog();
  const groups = data ? groupServices(data.services) : [];
  return (
    <>
      <Seo
        title="خدمات و تعرفه"
        description="کات و فید، فرم‌دهی ریش، اصلاح با تیغ، مراقبت پوست و پکیج‌های داماد در خانه داماد لاهیجان؛ با مدت و قیمت شفاف و رزرو آنلاین."
      />
      <PageHero
        eyebrow="منوی تخصصی خدمات · لاهیجان"
        title="خدماتی که دقیق، شفاف و بی‌واسطه قابل رزرو است"
        lead="مدت‌زمان و تعرفه هر خدمت پیش روی شماست. هر خدمت را که انتخاب کنید، مستقیم وارد تقویم رزرو همان خدمت می‌شوید."
      >
        {groups.length ? (
          <nav aria-label="دسته‌بندی خدمات" className="mt-8 flex flex-wrap gap-2.5">
            {groups.map((g) => (
              <a
                key={g.name}
                href={`#g-${g.name}`}
                className="btn-press rounded-full border border-ivory-50/25 bg-ivory-50/10 px-4 py-2 text-sm font-semibold text-ivory-50 backdrop-blur-sm transition-colors hover:border-brass-300 hover:bg-ivory-50/20"
              >
                {g.name} <span className="num ms-1 text-brass-300">({toFa(g.items.length)})</span>
              </a>
            ))}
          </nav>
        ) : null}
      </PageHero>

      <Container className="py-14 sm:py-16">
        {isLoading ? <Spinner label="در حال دریافت خدمات…" /> : null}
        {isError ? <ErrorState title="دریافت خدمات ممکن نشد" text="اتصال به سرور برقرار نشد." onRetry={() => refetch()} /> : null}
        {data && !groups.length ? <CatalogEmpty /> : null}

        {groups.map((group) => (
          <section key={group.name} id={`g-${group.name}`} aria-labelledby={`h-${group.name}`} className="mb-16 scroll-mt-28">
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-ivory-300 pb-4">
              <h2 id={`h-${group.name}`} className="flex items-center gap-2.5 text-2xl font-extrabold text-forest-900 sm:text-3xl">
                <span aria-hidden className="size-2 rotate-45 bg-brass-500" />
                {group.name}
              </h2>
              <span className="num rounded-full bg-ivory-200 px-3 py-1 text-xs font-bold text-neutral-700">
                {toFa(group.items.length)} خدمت
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 70}>
                  <ServiceCard service={s} className="h-full" />
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        {/* Show multi-session packages in both live AND demo modes so visitors can explore & purchase */}
        {data?.services?.length ? <PackageSection services={data.services} /> : null}

        {data?.services.length ? (
          <section aria-labelledby="price-table" className="relative overflow-hidden rounded-[2rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="نمای یکپارچه"
                id="price-table"
                title="فهرست کامل تعرفه استودیو"
                lead="تمام قیمت‌ها به تومان و شامل مشاوره اولیه فرم صورت و شستشو است."
              />
              <Btn to="/book" size="md">
                شروع رزرو نوبت <ArrowLeft className="size-4" aria-hidden />
              </Btn>
            </div>

            <div className="mt-8 divide-y divide-ivory-200 border-t border-ivory-300">
              {data.services.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:bg-ivory-100/70 sm:px-3 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-forest-900">{s.name}</h3>
                      <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[0.7rem] font-semibold text-neutral-700">{s.group}</span>
                      {s.package ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brass-200/70 px-2.5 py-0.5 text-[0.7rem] font-bold text-brass-700">
                          <Sparkles className="size-3" aria-hidden /> بسته چندجلسه‌ای
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600 num">
                      <Clock className="size-3.5 text-brass-600" aria-hidden /> مدت زمان حدودی: {formatDuration(s.durationMinutes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="num text-base font-extrabold text-forest-900 sm:text-lg">{formatPrice(s.price, s.currency)}</span>
                    <Link
                      className="btn-press rounded-full border border-forest-700/35 px-4 py-1.5 text-xs font-bold text-forest-900 transition-colors hover:bg-forest-800 hover:text-ivory-50"
                      to={`/book?service=${encodeURIComponent(s.id)}`}
                    >
                      رزرو
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
      <LoyaltyBand />
      <FinalCta />
    </>
  );
}
