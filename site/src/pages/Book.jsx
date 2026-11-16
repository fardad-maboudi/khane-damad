import Seo from "@/components/salon/Seo.jsx";
import { Container } from "@/components/salon/ui.jsx";
import BookingFlow from "@/components/salon/booking/BookingFlow.jsx";

export default function Book() {
  return (
    <>
      <Seo title="رزرو نوبت آنلاین" description="خدمت، آرایشگر، روز و ساعت دلخواه را انتخاب کنید و نوبت خود را در خانه داماد لاهیجان آنلاین رزرو کنید." />
      <section className="border-b border-ivory-300 bg-ivory-50 py-8 sm:py-12">
        <Container>
          <p className="text-sm font-semibold text-brass-700">رزرو آنلاین</p>
          <h1 className="mt-1 text-3xl font-extrabold text-forest-900 sm:text-4xl">نوبتت را در چند قدم بگیر</h1>
        </Container>
      </section>
      <Container className="py-8 sm:py-12"><BookingFlow /></Container>
    </>
  );
}
