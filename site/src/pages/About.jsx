import Seo from "@/components/salon/Seo.jsx";
import { Container, Photo, Reveal, SectionHeading, Spinner } from "@/components/salon/ui.jsx";
import { BarberCard, FinalCta, PageHero } from "@/components/salon/sections.jsx";
import { about, pexelsUrl } from "@/content/salon.js";
import { useCatalog } from "@/lib/salon-api.js";
import { toFa } from "@/lib/fa.js";

export default function About() {
  const { data, isLoading } = useCatalog();
  return (
    <>
      <Seo
        title="درباره ما و تیم"
        description="با استودیو خانه داماد و آرایشگرهای متخصص آن در لاهیجان آشنا شوید؛ هر آرایشگر با عکس، معرفی، تخصص و امکان رزرو مستقیم."
        image={pexelsUrl(about.image.id, 1200)}
      />
      <PageHero
        eyebrow="داستان و فلسفه استودیو"
        title={about.title}
        lead="آرامش یک آرایشگاه اصیل مردانه در کنار استانداردهای روز گرومینگ و نوبت‌دهی دقیق آنلاین در لاهیجان."
      />

      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <Reveal className="space-y-6">
          <p className="font-[var(--font-display)] text-3xl text-brass-600">اصالت در جزئیات نهفته است</p>
          <div className="space-y-5 text-lg leading-9 text-neutral-800">
            {about.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-ivory-300 pt-6">
            <div>
              <dt className="text-xs font-semibold text-neutral-600">سابقه حرفه‌ای</dt>
              <dd className="num mt-1 text-2xl font-extrabold text-forest-900">+{toFa(15)} سال</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-neutral-600">تیم تخصصی</dt>
              <dd className="num mt-1 text-2xl font-extrabold text-forest-900">{toFa(3)} استادکار</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-neutral-600">رضایت مراجعان</dt>
              <dd className="num mt-1 text-2xl font-extrabold text-forest-900">{toFa(98)}٪</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal delay={100} className="relative">
          <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[2rem] border border-brass-400/40" />
          <Photo
            id={about.image.id}
            alt={about.image.alt}
            ratio="4 / 3.5"
            className="rounded-[1.6rem] shadow-[0_24px_50px_-24px_rgb(15_32_25/0.45)]"
            sizes="(min-width:1024px) 45vw, 92vw"
          />
        </Reveal>
      </Container>

      <section className="border-y border-ivory-300/80 bg-ivory-50 py-16 sm:py-20" aria-labelledby="approach">
        <Container>
          <SectionHeading
            eyebrow="منشور حرفه‌ای ما"
            id="approach"
            title="سه اصلی که هر نوبت با آن آغاز می‌شود"
            lead="چه برای یک اصلاح کوتاه هفتگی بیایید و چه برای تشریفات روز دامادی، این سه اصل تغییرناپذیر است."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {about.pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="rounded-[1.5rem] border border-ivory-300 bg-ivory-100/80 p-7">
                <span className="num grid size-11 place-items-center rounded-full border border-brass-400/60 bg-ivory-50 font-[var(--font-display)] text-2xl text-brass-700">
                  {toFa(i + 1)}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-forest-900">{p.title}</h3>
                <p className="mt-2.5 leading-8 text-neutral-700">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="team-h">
        <Container>
          <SectionHeading
            eyebrow="اعضای تیم"
            id="team-h"
            title="استادکاران خانه داماد"
            lead="هر آرایشگر تقویم مستقل و تخصص مشخص دارد؛ می‌توانید مستقیم با استاد دلخواهتان نوبت بگیرید."
          />
          {isLoading ? <Spinner /> : null}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {data?.barbers.map((b, i) => (
              <Reveal key={b.id} delay={i * 80}>
                <BarberCard barber={b} services={data.services} detailed />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
