import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, EmptyState, Spinner } from "@/components/salon/ui.jsx";
import { PageHero } from "@/components/salon/sections.jsx";
import { canManageBookings, getMyMembership } from "@/api/backoffice/team";
import { applySeedPack } from "@/lib/seed-apply.js";
import { useCatalog } from "@/lib/salon-api.js";
import { toFa } from "@/lib/fa.js";

export default function Setup() {
  const client = useQueryClient();
  const catalog = useCatalog();
  const membership = useQuery({ queryKey: ["salon", "membership"], queryFn: getMyMembership, retry: false });
  const canManage = canManageBookings(membership.data);
  const [progress, setProgress] = useState(null);
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  async function run() {
    setState("running");
    setError(null);
    try {
      await applySeedPack(setProgress);
      await client.invalidateQueries({ queryKey: ["salon"] });
      setState("done");
    } catch (e) {
      const status = Number(e?.status ?? 0);
      if (status === 401 || status === 403) {
        setError("دسترسی مدیریت منقضی شده است؛ دوباره وارد شوید.");
        await membership.refetch();
      } else if (status === 0) {
        setError("اتصال به سرور برقرار نشد؛ شبکه یا دسترسی به API را بررسی کنید.");
      } else {
        setError(e?.message || "راه‌اندازی کامل نشد؛ دوباره تلاش کنید.");
      }
      setState("idle");
    }
  }
  const ready = catalog.data && catalog.data.services.length > 0;
  return (
    <>
      <Seo title="راه‌اندازی اولیه" noindex />
      <PageHero
        eyebrow="تنظیمات اولیه سامانه"
        title="راه‌اندازی داده‌های نمونه نوبت‌دهی"
        lead="با یک کلیک، خدمات، تعرفه، اساتید، ساعت کاری و مرخصی نمونه‌ی خانه داماد ساخته یا بازنشانی می‌شود."
      />
      <Container className="max-w-2xl py-14">
        <div>
          {membership.isLoading ? <Spinner /> : null}
          {membership.isError || (membership.data && !canManage) ? (
            <EmptyState
              title="برای راه‌اندازی وارد شوید"
              text="فقط صاحب سایت یا مدیر می‌تواند این کار را انجام دهد."
              action={<Btn to="/salon/login" size="sm">ورود مدیر</Btn>}
            />
          ) : null}
          {canManage ? (
            <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
              <p className="text-sm leading-7 text-neutral-700">
                {ready
                  ? `همین حالا ${toFa(catalog.data.services.length)} خدمت و ${toFa(catalog.data.barbers.length)} استاد آرایشگر در کاتالوگ فعال است.`
                  : "هنوز خدمتی تعریف نشده است."}
              </p>
              {state === "running" && progress ? (
                <div className="mt-5" role="status" aria-live="polite">
                  <div className="h-2.5 overflow-hidden rounded-full bg-ivory-200">
                    <div
                      className="h-full rounded-full bg-forest-700 transition-[width] duration-300"
                      style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-neutral-700 num">
                    {progress.label} ({toFa(progress.done)} از {toFa(progress.total)})
                  </p>
                </div>
              ) : null}
              {state === "done" ? (
                <p role="status" className="mt-4 flex items-center gap-2 font-bold text-forest-800">
                  <Check className="size-5 text-brass-600" aria-hidden /> راه‌اندازی با موفقیت انجام شد.
                </p>
              ) : null}
              {error ? <p role="alert" className="mt-4 rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{error}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Btn onClick={run} disabled={state === "running"}>
                  {state === "running" ? "در حال راه‌اندازی…" : ready ? "اجرای دوباره داده‌های نمونه" : "راه‌اندازی با داده‌های نمونه"}
                </Btn>
                {state === "done" || ready ? (
                  <Btn to="/salon/appointments" variant="outline">
                    مشاهده پنل نوبت‌ها
                  </Btn>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}
