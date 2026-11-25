import Seo from "@/components/salon/Seo.jsx";
import { Container, Reveal } from "@/components/salon/ui.jsx";
import { FinalCta, ReviewCard } from "@/components/salon/sections.jsx";
import { ReviewsHero } from "@/components/salon/heroes.jsx";
import { averageRating } from "@/lib/salon-helpers.js";
import { reviews } from "@/content/salon.js";
import { cn } from "@/lib/utils";

export default function Reviews() {
  const rating = averageRating();
  return (
    <>
      <Seo title="نظرات مشتری‌ها" description="تجربه مشتری‌های خانه داماد از کات، ریش و پکیج داماد." />
      <ReviewsHero rating={rating} />
      <Container className="py-14 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((r, i) => (
            <Reveal
              key={r.name + r.date}
              delay={i === 0 ? 0 : ((i - 1) % 3) * 80}
              className={cn("h-full", i === 0 && "md:col-span-2")}
            >
              <ReviewCard review={r} featured={i === 0} />
            </Reveal>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
