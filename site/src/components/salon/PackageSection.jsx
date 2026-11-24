import { useState } from "react";
import { Check, Package, ArrowLeft } from "lucide-react";
import { Btn, SectionHeading } from "@/components/salon/ui.jsx";
import { buyPackage } from "@/lib/salon-api.js";
import { formatPrice, normalizeMobile, toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

const inputCls = (error) =>
  cn(
    "h-12 w-full rounded-xl border bg-ivory-50 px-4 text-base text-charcoal-900 transition-colors focus:border-forest-700",
    error ? "border-danger-600" : "border-neutral-300",
  );

function BuyForm({ service, onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);
  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 3) next.name = "نام و نام خانوادگی را وارد کنید.";
    if (!normalizeMobile(phone)) next.phone = "شماره موبایل معتبر نیست.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("loading");
    setError(null);
    try {
      const credit = await buyPackage({ service, customer: { name: name.trim(), phone: normalizeMobile(phone) } });
      onDone(credit);
    } catch (err) {
      setError(err?.kind === "offline" ? "اتصال برقرار نشد؛ دوباره تلاش کنید." : err?.message || "ثبت بسته انجام نشد.");
      setState("idle");
    }
  }
  return (
    <form noValidate onSubmit={submit} className="mt-5 space-y-3.5 border-t border-ivory-200 pt-4">
      <div>
        <label htmlFor={`pn-${service.id}`} className="mb-1.5 block text-sm font-semibold text-forest-900">نام و نام خانوادگی</label>
        <input id={`pn-${service.id}`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} className={inputCls(errors.name)} />
        {errors.name ? <p role="alert" className="mt-1 text-sm text-danger-600">{errors.name}</p> : null}
      </div>
      <div>
        <label htmlFor={`pp-${service.id}`} className="mb-1.5 block text-sm font-semibold text-forest-900">شماره موبایل</label>
        <input id={`pp-${service.id}`} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09121234567" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} className={cn(inputCls(errors.phone), "text-end num")} />
        {errors.phone ? <p role="alert" className="mt-1 text-sm text-danger-600">{errors.phone}</p> : null}
      </div>
      {error ? <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{error}</p> : null}
      <div className="flex items-center gap-3 pt-1">
        <Btn type="submit" size="sm" disabled={state === "loading"}>{state === "loading" ? "در حال ثبت…" : "تأیید و فعال‌سازی بسته"}</Btn>
      </div>
    </form>
  );
}

function PackageCard({ service }) {
  const [open, setOpen] = useState(false);
  const [credit, setCredit] = useState(null);
  const pk = service.package;
  const full = service.price * pk.sessions;
  const saving = full > pk.price ? Math.round(((full - pk.price) / full) * 100) : 0;
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-brass-400/50 bg-ivory-50 p-6 sm:p-7 shadow-[0_18px_40px_-24px_rgb(15_32_25/0.3)]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl border border-brass-400/40 bg-brass-100 text-brass-700">
          <Package className="size-6" aria-hidden />
        </span>
        {saving ? (
          <span className="num rounded-full bg-brass-200 px-3 py-1 text-xs font-extrabold text-brass-700">
            {toFa(saving)}٪ صرفه‌جویی
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-forest-900">{pk.name || `بسته ${toFa(pk.sessions)} جلسه‌ای ${service.name}`}</h3>
      <p className="mt-2 text-sm leading-7 text-neutral-700">
        شامل {toFa(pk.sessions)} جلسه «{service.name}» با اعتبار {toFa(pk.validityDays)} روز؛ زمان هر جلسه را به‌دلخواه خودتان در تقویم رزرو می‌کنید.
      </p>
      <div className="mt-5 flex flex-wrap items-baseline gap-3 border-t border-ivory-200 pt-4">
        <span className="num text-2xl font-extrabold text-forest-900">{formatPrice(pk.price, service.currency)}</span>
        {saving ? <s className="num text-sm text-neutral-500">{formatPrice(full, service.currency)}</s> : null}
      </div>
      {credit ? (
        <div role="status" className="mt-5 space-y-3 rounded-2xl border border-forest-700/25 bg-forest-50 p-4 text-sm text-forest-900">
          <p className="flex items-start gap-2 leading-7">
            <Check className="mt-1 size-4 shrink-0 text-forest-700" aria-hidden />
            <span>
              بسته شما فعال شد و <strong className="num">{toFa(credit.sessions)} جلسه</strong> اعتبار دارید. هنگام رزرو با همین شماره موبایل، گزینه «استفاده از اعتبار بسته» خودکار نمایش داده می‌شود.
            </span>
          </p>
          <Btn to={`/book?service=${encodeURIComponent(service.id)}`} size="sm" className="w-full">
            رزرو اولین جلسه با اعتبار بسته <ArrowLeft className="size-4" aria-hidden />
          </Btn>
        </div>
      ) : open ? (
        <BuyForm service={service} onDone={setCredit} />
      ) : (
        <Btn variant="outline" size="sm" className="mt-5 w-full" onClick={() => setOpen(true)}>
          تهیه و فعال‌سازی این بسته
        </Btn>
      )}
    </article>
  );
}

export default function PackageSection({ services }) {
  const list = services.filter((s) => s.package);
  if (!list.length) return null;
  return (
    <section aria-labelledby="packages" className="my-16">
      <SectionHeading
        eyebrow="اشتراک چندجلسه‌ای"
        id="packages"
        title="بسته‌های اقتصادی مشتریان ثابت"
        lead="چند نوبت کات یا فرم ریش را یکجا تهیه کنید و هر جلسه را در روز و ساعت دلخواهتان رزرو کنید."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {list.map((s) => (
          <PackageCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
}
