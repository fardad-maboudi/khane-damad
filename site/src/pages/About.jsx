import Seo from "@/components/salon/Seo.jsx";
import { Container, Photo, Reveal, SectionHeading, Spinner } from "@/components/salon/ui.jsx";
import { BarberCard, FinalCta, PageHero } from "@/components/salon/sections.jsx";
import { about, pexelsUrl } from "@/content/salon.js";
import { useCatalog } from "@/lib/salon-api.js";

export default function About() {
  const { data, isLoading } = useCatalog();
  return (
    <>
      <Seo title="درباره ما و تیم" description="با استودیو خانه داماد و آرایشگرهای متخصص آن در لاهیجان آشنا شوید؛ هر آرایشگر با عکس، معرفی، تخصص و امکان رزرو مستقیم." image={pexelsUrl(about.image.id, 1200)} />
      <PageHero title={about.title} />
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-2">
        <Reveal className="space-y-5 text-lg leading-9 text-neutral-800">{about.story.map((p) => <p key={p}>{p}</p>)}</Reveal>
        <Reveal delay={100}><Photo id={about.image.id} alt={about.image.alt} ratio="4 / 3.4" className="rounded-2xl" sizes="(min-width:1024px) 45vw, 90vw" /></Reveal>
      </Container>
      <section className="bg-ivory-50 py-16" aria-labelledby="approach">
        <Container>
          <SectionHeading title={<span id="approach">سه اصلی که هر نوبت با آن شروع می‌شود</span>} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {about.pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="rounded-2xl border border-ivory-300 bg-ivory-100 p-6">
                <p className="font-[var(--font-display)] text-3xl text-brass-600">{(i + 1).toLocaleString("fa-IR")}</p>
                <h3 className="mt-2 text-lg font-bold text-forest-900">{p.title}</h3>
                <p className="mt-2 leading-8 text-neutral-700">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section className="py-16" aria-labelledby="team-h">
        <Container>
          <SectionHeading title={<span id="team-h">آرایشگرهای خانه داماد</span>} lead="هر آرایشگر تقویم مستقل دارد؛ می‌توانید مستقیم با او رزرو کنید." />
          {isLoading ? <Spinner /> : null}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {data?.barbers.map((b, i) => (<Reveal key={b.id} delay={i * 80}><BarberCard barber={b} services={data.services} detailed /></Reveal>))}
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
