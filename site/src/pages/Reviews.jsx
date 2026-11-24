import Seo from "@/components/salon/Seo.jsx";
import { Container, Reveal, Stars } from "@/components/salon/ui.jsx";
import { FinalCta, PageHero, ReviewCard, ReviewLink } from "@/components/salon/sections.jsx";
import { averageRating } from "@/lib/salon-helpers.js";
import { reviews } from "@/content/salon.js";
import { toFa } from "@/lib/fa.js";

export default function Reviews() {
  const rating = averageRating();
  return (
    <>
      <Seo title="نظرات مشتری‌ها" description="تجربه مشتری‌های خانه داماد از کات، ریش و پکیج داماد." />
      <PageHero
        eyebrow="صدای مشتریان استودیو"
        title="تجربه واقعی مراجعان خانه داماد"
        lead="رضایت مراجعه‌کنندگان، معتبرترین سند کیفیت کار ما در لاهیجان است."
      >
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-ivory-50/15 bg-ivory-50/10 p-5 backdrop-blur-sm sm:px-7">
          <div className="flex items-center gap-5">
            <p className="num text-5xl font-extrabold text-brass-300 sm:text-6xl">{toFa(rating.toFixed(1))}</p>
            <div>
              <Stars value={rating} size={20} />
              <p className="mt-1.5 text-sm text-ivory-200">میانگین امتیاز از {toFa(reviews.items.length)} دیدگاه ثبت‌شده</p>
            </div>
          </div>
          <ReviewLink className="border-ivory-50/35 bg-transparent text-ivory-50 hover:border-brass-300 hover:bg-ivory-50/15 hover:text-ivory-50" />
        </div>
      </PageHero>
      <Container className="py-14 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((r, i) => (
            <Reveal key={r.name + r.date} delay={(i % 3) * 80}>
              <ReviewCard review={r} featured={i === 1} />
            </Reveal>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
