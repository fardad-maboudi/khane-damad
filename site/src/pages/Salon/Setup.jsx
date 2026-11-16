import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, EmptyState, Spinner } from "@/components/salon/ui.jsx";
import { getMyMembership } from "@/api/backoffice/team";
import { applySeedPack } from "@/lib/seed-apply.js";
import { useCatalog } from "@/lib/salon-api.js";
import { toFa } from "@/lib/fa.js";

export default function Setup() {
  const client = useQueryClient();
  const catalog = useCatalog();
  const membership = useQuery({ queryKey: ["salon", "membership"], queryFn: getMyMembership, retry: false });
  const member = membership.data?.membership || membership.data;
  const canManage = Boolean(member?.capabilities?.includes("booking:manage"));
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
      setError(e?.message || "راه‌اندازی کامل نشد؛ دوباره تلاش کنید.");
      setState("idle");
    }
  }
  const ready = catalog.data && !catalog.data.demo && catalog.data.services.length > 0;
  return (
    <>
      <Seo title="راه‌اندازی اولیه" noindex />
      <Container className="max-w-2xl py-16">
        <h1 className="text-3xl font-extrabold text-forest-900">راه‌اندازی اولیه نوبت‌دهی</h1>
        <p className="mt-3 leading-8 text-neutral-700">با یک کلیک، خدمات، تعرفه، آرایشگرها، ساعت کاری و مرخصی نمونه‌ی خانه داماد در بخش نوبت‌دهی همین سایت ساخته می‌شود. پس از آن همه چیز از بخش مدیریت قابل ویرایش است. اجرای دوباره، داده‌ای را تکراری نمی‌کند.</p>
        <div className="mt-8">
          {membership.isLoading ? <Spinner /> : null}
          {membership.isError || (membership.data && !canManage) ? <EmptyState title="برای راه‌اندازی وارد شوید" text="فقط صاحب سایت یا مدیر می‌تواند این کار را انجام دهد." action={<Btn to="/admin/login" size="sm">ورود مدیر</Btn>} /> : null}
          {canManage ? (
            <div className="rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
              <p className="text-sm text-neutral-700">{ready ? `همین حالا ${toFa(catalog.data.services.length)} خدمت و ${toFa(catalog.data.barbers.length)} آرایشگر تعریف شده است.` : "هنوز خدمتی تعریف نشده است."}</p>
              {state === "running" && progress ? (
                <div className="mt-4" role="status" aria-live="polite">
                  <div className="h-2 overflow-hidden rounded-full bg-ivory-200"><div className="h-full rounded-full bg-forest-700 transition-[width] duration-300" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} /></div>
                  <p className="mt-2 text-sm text-neutral-700">{progress.label} ({toFa(progress.done)} از {toFa(progress.total)})</p>
                </div>
              ) : null}
              {state === "done" ? <p role="status" className="mt-4 flex items-center gap-2 font-semibold text-forest-800"><Check className="size-5" aria-hidden /> راه‌اندازی انجام شد.</p> : null}
              {error ? <p role="alert" className="mt-4 rounded-xl bg-[#fbeeea] px-4 py-2 text-sm text-[#5c1b16]">{error}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Btn onClick={run} disabled={state === "running"}>{state === "running" ? "در حال راه‌اندازی…" : ready ? "اجرای دوباره" : "راه‌اندازی با داده‌های نمونه"}</Btn>
                {state === "done" || ready ? <Btn to="/salon/appointments" variant="outline">مدیریت نوبت‌ها</Btn> : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}
