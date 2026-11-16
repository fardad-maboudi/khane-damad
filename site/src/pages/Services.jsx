import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, Reveal, Spinner, ErrorState } from "@/components/salon/ui.jsx";
import PackageSection from "@/components/salon/PackageSection.jsx";
import { CatalogEmpty, FinalCta, LoyaltyBand, PageHero, ServiceCard } from "@/components/salon/sections.jsx";
import { groupServices, useCatalog } from "@/lib/salon-api.js";
import { formatDuration, formatPrice, toFa } from "@/lib/fa.js";
import { Link } from "react-router-dom";

export default function Services() {
  const { data, isLoading, isError, refetch } = useCatalog();
  const groups = data ? groupServices(data.services) : [];
  return (
    <>
      <Seo title="خدمات و تعرفه" description="کات و فید، فرم‌دهی ریش، اصلاح با تیغ، مراقبت پوست و پکیج‌های داماد در خانه داماد لاهیجان؛ با مدت و قیمت شفاف و رزرو آنلاین." />
      <PageHero title="خدماتی که دقیق، شفاف و قابل رزرو است" lead="مدت و قیمت هر خدمت را ببینید و همان‌جا نوبت بگیرید. هر خدمت به‌طور مستقیم وارد مراحل رزرو می‌شود." />
      <Container className="py-14">
        {isLoading ? <Spinner label="در حال دریافت خدمات…" /> : null}
        {isError ? <ErrorState title="دریافت خدمات ممکن نشد" text="اتصال به سرور برقرار نشد." onRetry={() => refetch()} /> : null}
        {data && !groups.length ? <CatalogEmpty /> : null}
        {data?.demo ? <p className="mb-8 rounded-xl border border-brass-400/60 bg-brass-200/30 px-4 py-3 text-sm text-charcoal-800">اتصال به سرور نوبت‌دهی برقرار نیست؛ اطلاعات نمایشی است.</p> : null}
        <nav aria-label="دسته‌بندی خدمات" className="mb-10 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.name} href={`#g-${g.name}`} className="rounded-full border border-forest-700/30 px-4 py-1.5 text-sm font-medium text-forest-800 hover:bg-forest-50">{g.name} <span className="num text-neutral-600">({toFa(g.items.length)})</span></a>
          ))}
        </nav>
        {groups.map((group) => (
          <section key={group.name} id={`g-${group.name}`} aria-labelledby={`h-${group.name}`} className="mb-16 scroll-mt-24">
            <h2 id={`h-${group.name}`} className="mb-6 text-2xl font-bold text-forest-900">{group.name}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((s, i) => (<Reveal key={s.id} delay={(i % 3) * 70}><ServiceCard service={s} className="h-full" /></Reveal>))}
            </div>
          </section>
        ))}
        {data && !data.demo ? <PackageSection services={data.services} /> : null}
        {data?.services.length ? (
          <section aria-labelledby="price-table" className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
            <h2 id="price-table" className="text-xl font-bold text-forest-900">جدول تعرفه</h2>
            <div className="relative mt-4 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <caption className="sr-only">تعرفه خدمات خانه داماد</caption>
                <thead><tr className="border-b border-ivory-300 text-start text-neutral-600"><th scope="col" className="py-2 text-start">خدمت</th><th scope="col" className="py-2 text-start">مدت</th><th scope="col" className="py-2 text-start">قیمت</th><th scope="col" className="py-2"><span className="sr-only">رزرو</span></th></tr></thead>
                <tbody>
                  {data.services.map((s) => (
                    <tr key={s.id} className="border-b border-ivory-300 last:border-0">
                      <th scope="row" className="py-3 text-start font-semibold">{s.name}</th>
                      <td className="py-3 text-neutral-700">{formatDuration(s.durationMinutes)}</td>
                      <td className="py-3 font-bold text-forest-800">{formatPrice(s.price, s.currency)}</td>
                      <td className="py-3 text-end"><Link className="font-semibold text-forest-800 underline decoration-brass-500 underline-offset-4" to={`/book?service=${encodeURIComponent(s.id)}`}>رزرو</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn to="/book" className="mt-6">رزرو نوبت</Btn>
          </section>
        ) : null}
      </Container>
      <LoyaltyBand />
      <FinalCta />
    </>
  );
}
