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
      <PageHero title="تجربه مشتری‌هایمان">
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <p className="text-6xl font-extrabold text-forest-900 num">{toFa(rating.toFixed(1))}</p>
          <div><Stars value={rating} size={22} /><p className="mt-1 text-neutral-700">میانگین {toFa(reviews.items.length)} نظر</p></div>
          <ReviewLink className="ms-auto" />
        </div>
      </PageHero>
      <Container className="py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((r, i) => (<Reveal key={r.name + r.date} delay={(i % 3) * 80}><ReviewCard review={r} /></Reveal>))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
