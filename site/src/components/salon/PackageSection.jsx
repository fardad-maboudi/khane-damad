import { useState } from "react";
import { Check, Package } from "lucide-react";
import { Btn, SectionHeading } from "@/components/salon/ui.jsx";
import { buyPackage } from "@/lib/salon-api.js";
import { formatPrice, normalizeMobile, toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

const inputCls = (error) => cn("h-12 w-full rounded-xl border bg-ivory-50 px-4 text-base outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/30", error ? "border-[#8a2a22]" : "border-neutral-300");

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
    <form noValidate onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <label htmlFor={`pn-${service.id}`} className="mb-1 block text-sm font-semibold text-forest-900">نام و نام خانوادگی</label>
        <input id={`pn-${service.id}`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} className={inputCls(errors.name)} />
        {errors.name ? <p role="alert" className="mt-1 text-sm text-[#8a2a22]">{errors.name}</p> : null}
      </div>
      <div>
        <label htmlFor={`pp-${service.id}`} className="mb-1 block text-sm font-semibold text-forest-900">شماره موبایل</label>
        <input id={`pp-${service.id}`} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} className={cn(inputCls(errors.phone), "text-end")} />
        {errors.phone ? <p role="alert" className="mt-1 text-sm text-[#8a2a22]">{errors.phone}</p> : null}
      </div>
      {error ? <p role="alert" className="rounded-xl bg-[#fbeeea] px-4 py-2 text-sm text-[#5c1b16]">{error}</p> : null}
      <Btn type="submit" disabled={state === "loading"}>{state === "loading" ? "در حال ثبت…" : "ثبت بسته"}</Btn>
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
    <article className="flex flex-col rounded-2xl border border-ivory-300 bg-ivory-50 p-6">
      <Package className="size-6 text-brass-600" aria-hidden />
      <h3 className="mt-3 text-lg font-bold text-forest-900">{pk.name || `بسته ${toFa(pk.sessions)} جلسه‌ای ${service.name}`}</h3>
      <p className="mt-1 text-sm text-neutral-700">{toFa(pk.sessions)} جلسه {service.name}، معتبر تا {toFa(pk.validityDays)} روز؛ هر جلسه را خودتان زمان‌بندی می‌کنید.</p>
      <p className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-extrabold text-forest-800">{formatPrice(pk.price, service.currency)}</span>
        {saving ? <span className="rounded-full bg-brass-200 px-2.5 py-0.5 text-xs font-bold text-brass-700">{toFa(saving)}٪ ارزان‌تر</span> : null}
      </p>
      {credit ? (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-900">
          <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> بسته شما ثبت شد و {toFa(credit.sessions)} جلسه اعتبار دارید. هنگام رزرو همین موبایل و دستگاه، گزینه استفاده از اعتبار نمایش داده می‌شود.
        </p>
      ) : open ? <BuyForm service={service} onDone={setCredit} /> : (
        <Btn variant="outline" size="sm" className="mt-4 w-full" onClick={() => setOpen(true)}>خرید بسته</Btn>
      )}
    </article>
  );
}

export default function PackageSection({ services }) {
  const list = services.filter((s) => s.package);
  if (!list.length) return null;
  return (
    <section aria-labelledby="packages" className="mt-6 mb-16">
      <SectionHeading title={<span id="packages">بسته‌های چندجلسه‌ای</span>} lead="برای مشتری‌های ثابت: چند جلسه را یکجا بخرید و ارزان‌تر تمام می‌شود." />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {list.map((s) => (<PackageCard key={s.id} service={s} />))}
      </div>
    </section>
  );
}
