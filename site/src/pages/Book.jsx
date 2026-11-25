import Seo from "@/components/salon/Seo.jsx";
import { Container } from "@/components/salon/ui.jsx";
import { PageHero } from "@/components/salon/sections.jsx";
import BookingFlow from "@/components/salon/booking/BookingFlow.jsx";

export default function Book() {
  return (
    <>
      <Seo
        title="رزرو نوبت آنلاین"
        description="خدمت، آرایشگر، روز و ساعت دلخواه را انتخاب کنید و نوبت خود را در خانه داماد لاهیجان آنلاین رزرو کنید."
      />
      <PageHero
        eyebrow="سامانه نوبت‌دهی آنلاین"
        title="نوبت اختصاصی‌ات را در چند گام رزرو کن"
        lead="فقط ساعت‌های واقعاً آزاد هر استادکار نمایش داده می‌شود؛ بدون تداخل و بدون انتظار در سالن."
      />
      <Container className="py-10 sm:py-14">
        <BookingFlow />
      </Container>
    </>
  );
}
