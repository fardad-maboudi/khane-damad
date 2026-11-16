import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Check, ChevronRight, Clock, Phone, User, Scissors } from "lucide-react";
import { Btn, EmptyState, ErrorState, Photo, Spinner, WhatsappIcon } from "@/components/salon/ui.jsx";
import { contact, loyalty } from "@/content/salon.js";
import {
  BOOKING_HORIZON_DAYS,
  CANCELLATION_POLICY,
  PERIOD_LABELS,
  createAppointment,
  groupServices,
  loadDayTimes,
  loadMyCredits,
  loadRangeSlots,
  timePeriod,
  useCatalog,
} from "@/lib/salon-api.js";
import { addDays, dateChip, downloadIcs, formatDateLong, formatDuration, formatPrice, formatTime, googleCalendarUrl, normalizeMobile, toFa, toFaDigits, todayKey } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

const STEPS = ["خدمت", "آرایشگر", "روز و ساعت", "مشخصات", "تأیید"];

function Stepper({ step, onJump }) {
  return (
    <ol aria-label="مراحل رزرو" className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className="flex items-center gap-1.5" aria-current={current ? "step" : undefined}>
            <button type="button" disabled={!done} onClick={() => onJump(i)} className={cn("flex items-center gap-2 rounded-full py-1.5 pe-3.5 ps-1.5 text-sm font-semibold whitespace-nowrap", current ? "bg-forest-700 text-ivory-50" : done ? "bg-forest-50 text-forest-800 hover:bg-forest-100" : "text-neutral-500")}>
              <span className={cn("grid size-6 place-items-center rounded-full text-xs num", current ? "bg-brass-400 text-charcoal-900" : done ? "bg-forest-700 text-ivory-50" : "border border-neutral-300")}>{done ? <Check className="size-3.5" aria-hidden /> : toFa(i + 1)}</span>
              <span className={cn(!current && "hidden sm:inline")}>{label}</span>
            </button>
            {i < STEPS.length - 1 ? <span aria-hidden className="h-px w-3 bg-neutral-300 sm:w-6" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Choice({ selected, onClick, children, className, ...rest }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cn("btn-press w-full rounded-2xl border p-4 text-start transition-colors", selected ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700" : "border-ivory-300 bg-ivory-50 hover:border-forest-700/50", className)} {...rest}>
      {children}
    </button>
  );
}

function Summary({ service, barber, start, className }) {
  if (!service) return null;
  return (
    <aside aria-label="خلاصه رزرو" className={cn("rounded-2xl border border-ivory-300 bg-ivory-50 p-5", className)}>
      <h2 className="text-base font-bold text-forest-900">خلاصه نوبت</h2>
      <dl className="mt-3 space-y-2.5 text-sm">
        <Row k="خدمت" v={service.name} />
        <Row k="مدت" v={formatDuration(service.durationMinutes)} />
        {barber ? <Row k="آرایشگر" v={barber.name} /> : null}
        {start ? <Row k="زمان" v={`${formatDateLong(start)}، ساعت ${formatTime(start)}`} /> : null}
        <div className="flex items-center justify-between border-t border-ivory-300 pt-3 text-base"><dt className="font-semibold">مبلغ</dt><dd className="font-extrabold text-forest-800">{formatPrice(service.price, service.currency)}</dd></div>
      </dl>
    </aside>
  );
}
const Row = ({ k, v }) => (<div className="flex justify-between gap-4"><dt className="text-neutral-600">{k}</dt><dd className="text-end font-semibold text-charcoal-900">{v}</dd></div>);

export default function BookingFlow() {
  const [params] = useSearchParams();
  const client = useQueryClient();
  const catalogQuery = useCatalog();
  const catalog = catalogQuery.data;
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(null);
  const [barberId, setBarberId] = useState("any");
  const [dayKey, setDayKey] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [details, setDetails] = useState({ name: "", phone: "", note: "", useCredit: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(null);
  const headingRef = useRef(null);
  const appliedParams = useRef(false);

  // Deep links from the services / team pages: ?service=<id|name>&barber=<id>
  useEffect(() => {
    if (!catalog || appliedParams.current) return;
    appliedParams.current = true;
    const wantedService = params.get("service");
    const wantedBarber = params.get("barber");
    const service = wantedService ? catalog.services.find((s) => s.id === wantedService || s.name === wantedService) : null;
    if (wantedBarber && catalog.barbers.some((b) => b.id === wantedBarber)) setBarberId(wantedBarber);
    if (service) {
      setServiceId(service.id);
      setStep(1);
    }
  }, [catalog, params]);

  useEffect(() => { headingRef.current?.focus(); }, [step, result]);

  const service = catalog?.services.find((s) => s.id === serviceId) ?? null;
  const allowed = useMemo(() => {
    if (!catalog || !service) return [];
    return service.resourceIds.length ? catalog.barbers.filter((b) => service.resourceIds.includes(b.id)) : catalog.barbers;
  }, [catalog, service]);
  const barber = allowed.find((b) => b.id === barberId) ?? null;
  const barberIds = barberId === "any" ? allowed.map((b) => b.id) : [barberId];

  const range = useQuery({
    queryKey: ["salon", "range", serviceId, barberId],
    queryFn: () => loadRangeSlots({ serviceId, resourceId: barberId === "any" ? undefined : barberId, days: BOOKING_HORIZON_DAYS }, catalog),
    enabled: Boolean(catalog && service && step === 2),
    refetchOnWindowFocus: true,
  });
  const times = useQuery({
    queryKey: ["salon", "times", serviceId, barberId, dayKey],
    queryFn: () => loadDayTimes({ serviceId, barberIds, dayKey }, catalog),
    enabled: Boolean(catalog && service && dayKey && step === 2),
    refetchOnWindowFocus: true,
  });

  const credits = useQuery({
    queryKey: ["salon", "credits", serviceId],
    queryFn: () => loadMyCredits(serviceId),
    enabled: Boolean(catalog && !catalog.demo && service && step >= 3),
  });
  const credit = credits.data?.find((c) => !c.phone || c.phone === normalizeMobile(details.phone)) ?? credits.data?.[0] ?? null;

  const days = useMemo(() => Array.from({ length: BOOKING_HORIZON_DAYS }, (_, i) => addDays(todayKey(), i)), []);

  const chosenBarber = chosen ? catalog?.barbers.find((b) => b.id === chosen.option.barberId) : null;

  function go(next) { setNotice(null); setSubmitError(null); setStep(next); }

  function pickService(s) {
    setServiceId(s.id);
    if (barberId !== "any" && s.resourceIds.length && !s.resourceIds.includes(barberId)) setBarberId("any");
    setDayKey(null); setChosen(null);
    go(1);
  }
  function pickBarber(id) { setBarberId(id); setDayKey(null); setChosen(null); go(2); }
  function pickTime(entry) {
    const preferred = barberId === "any" ? entry.options[0] : entry.options.find((o) => o.barberId === barberId) ?? entry.options[0];
    setChosen({ startsAt: entry.startsAt, endsAt: entry.endsAt, option: preferred });
    go(3);
  }

  function validate() {
    const next = {};
    if (details.name.trim().length < 3) next.name = "نام و نام خانوادگی را وارد کنید (حداقل ۳ حرف).";
    if (!normalizeMobile(details.phone)) next.phone = "شماره موبایل معتبر نیست؛ مثال: ۰۹۱۲۱۲۳۴۵۶۷";
    if (details.note.length > 300) next.note = "توضیحات حداکثر ۳۰۰ کاراکتر باشد.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function confirm() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const outcome = await createAppointment(
        { option: chosen.option, startsAt: chosen.startsAt, endsAt: chosen.endsAt, barber: chosenBarber, customer: { name: details.name.trim(), phone: normalizeMobile(details.phone), note: details.note.trim(), creditId: credit && details.useCredit ? credit.id : undefined } },
        catalog,
      );
      await client.invalidateQueries({ queryKey: ["salon", "range"] });
      await client.invalidateQueries({ queryKey: ["salon", "times"] });
      setResult({ ...outcome, startsAt: chosen.startsAt, endsAt: chosen.endsAt, service, barber: chosenBarber, customer: { ...details, phone: normalizeMobile(details.phone) } });
    } catch (error) {
      if (error?.kind === "taken") {
        await client.invalidateQueries({ queryKey: ["salon"] });
        setChosen(null);
        setNotice("این زمان همین الان توسط شخص دیگری رزرو شد. لطفاً زمان دیگری انتخاب کنید.");
        setStep(2);
      } else if (error?.kind === "busy") {
        setSubmitError("درخواست‌های زیادی از این دستگاه ثبت شده است. چند دقیقه بعد دوباره تلاش کنید یا با استودیو تماس بگیرید.");
      } else if (error?.kind === "offline") {
        setSubmitError("اتصال به سرور برقرار نشد. اینترنت خود را بررسی کنید و دوباره تلاش کنید؛ نوبت شما ثبت نشده است.");
      } else {
        setSubmitError(error?.message || "ثبت نوبت انجام نشد. لطفاً دوباره تلاش کنید یا تماس بگیرید.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setResult(null); setServiceId(null); setBarberId("any"); setDayKey(null); setChosen(null); setDetails({ name: "", phone: "", note: "" }); setStep(0);
  }

  if (catalogQuery.isLoading) return <Spinner label="در حال آماده‌سازی رزرو…" className="py-24" />;
  if (catalogQuery.isError) return <ErrorState title="رزرو آنلاین در دسترس نیست" text="دریافت اطلاعات خدمات ممکن نشد. لطفاً دوباره تلاش کنید یا تماس بگیرید." onRetry={() => catalogQuery.refetch()} />;
  if (!catalog.services.length) {
    return <EmptyState title="رزرو آنلاین هنوز راه‌اندازی نشده است" text="صاحب سایت باید ابتدا خدمت‌ها و آرایشگرها را تعریف کند. تا آن زمان با استودیو تماس بگیرید." action={<Btn href={`tel:${contact.phone}`} size="sm"><Phone className="size-4" aria-hidden /> {contact.phoneDisplay}</Btn>} />;
  }

  if (result) return <Success result={result} onRestart={restart} headingRef={headingRef} />;

  const heading = (text, lead) => (
    <div className="mb-6">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-forest-900 outline-none">{text}</h2>
      {lead ? <p className="mt-1 text-neutral-700">{lead}</p> : null}
    </div>
  );

  return (
    <div>
      {catalog.demo ? (
        <p role="status" className="mb-5 rounded-xl border border-brass-400/60 bg-brass-200/30 px-4 py-3 text-sm text-charcoal-800">
          حالت نمایشی: اتصال به سرور نوبت‌دهی برقرار نیست. نوبت‌ها فقط روی همین دستگاه ذخیره می‌شوند و به استودیو نمی‌رسند.
        </p>
      ) : null}
      <Stepper step={step} onJump={go} />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0" key={step}>
          <div className="page-enter">
            {step === 0 ? (
              <section aria-labelledby="s0">
                {heading("کدام خدمت را می‌خواهید؟", "یک خدمت را انتخاب کنید؛ مدت و قیمت کنار هر کدام آمده است.")}
                {groupServices(catalog.services).map((g) => (
                  <div key={g.name} className="mb-7">
                    <h3 className="mb-3 text-sm font-bold text-brass-700">{g.name}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {g.items.map((s) => (
                        <Choice key={s.id} selected={s.id === serviceId} onClick={() => pickService(s)}>
                          <span className="flex items-start gap-3">
                            <Photo src={s.image} alt="" ratio="1 / 1" className="size-16 shrink-0 rounded-xl" sizes="64px" />
                            <span className="min-w-0 flex-1">
                              <span className="block font-bold text-forest-900">{s.name}</span>
                              <span className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-neutral-700"><span className="inline-flex items-center gap-1"><Clock className="size-3.5 text-brass-600" aria-hidden />{formatDuration(s.durationMinutes)}</span><span className="font-bold text-forest-800">{formatPrice(s.price, s.currency)}</span></span>
                            </span>
                          </span>
                        </Choice>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {step === 1 && service ? (
              <section>
                {heading("با کدام آرایشگر؟", `برای «${service.name}» می‌توانید آرایشگر دلخواه را انتخاب کنید.`)}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice selected={barberId === "any"} onClick={() => pickBarber("any")}>
                    <span className="flex items-center gap-3"><span className="grid size-16 place-items-center rounded-xl bg-forest-700 text-ivory-50"><Scissors className="size-6" aria-hidden /></span><span><span className="block font-bold text-forest-900">هر آرایشگر آزاد</span><span className="text-sm text-neutral-700">نزدیک‌ترین زمان‌های خالی</span></span></span>
                  </Choice>
                  {allowed.map((b) => (
                    <Choice key={b.id} selected={barberId === b.id} onClick={() => pickBarber(b.id)}>
                      <span className="flex items-center gap-3"><Photo src={b.avatar} alt="" ratio="1 / 1" className="size-16 shrink-0 rounded-xl" sizes="64px" /><span><span className="block font-bold text-forest-900">{b.name}</span><span className="text-sm text-neutral-700">{b.title}</span></span></span>
                    </Choice>
                  ))}
                </div>
                <BackLink onClick={() => go(0)} />
              </section>
            ) : null}

            {step === 2 && service ? (
              <section>
                {heading("روز و ساعت نوبت", "فقط زمان‌های واقعاً خالی نمایش داده می‌شود.")}
                {notice ? <p role="alert" className="mb-5 rounded-xl border border-[#8a2a22]/30 bg-[#fbeeea] px-4 py-3 text-sm text-[#5c1b16]">{notice}</p> : null}
                {range.isLoading ? <Spinner label="در حال بررسی زمان‌های خالی…" /> : null}
                {range.isError ? <ErrorState title="دریافت زمان‌ها ممکن نشد" text="لطفاً دوباره تلاش کنید." onRetry={() => range.refetch()} /> : null}
                {range.data ? (
                  Object.keys(range.data).length === 0 ? (
                    <EmptyState title="زمان خالی پیدا نشد" text="در روزهای پیش‌رو برای این انتخاب زمان خالی نداریم. آرایشگر یا خدمت دیگری را امتحان کنید یا تماس بگیرید." action={<Btn variant="outline" size="sm" onClick={() => go(1)}>تغییر آرایشگر</Btn>} />
                  ) : (
                    <>
                      <div role="group" aria-label="انتخاب روز" className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
                        {days.map((d) => {
                          const n = range.data[d] ?? 0;
                          const chip = dateChip(d);
                          const sel = d === dayKey;
                          return (
                            <button key={d} type="button" disabled={!n} aria-pressed={sel} aria-label={`${formatDateLong(d)}${n ? "" : "، بدون زمان خالی"}`} onClick={() => { setDayKey(d); setChosen(null); }} className={cn("btn-press flex w-[4.6rem] shrink-0 flex-col items-center rounded-2xl border px-2 py-3 text-center", sel ? "border-forest-700 bg-forest-700 text-ivory-50" : n ? "border-ivory-300 bg-ivory-50 hover:border-forest-700/50" : "border-transparent bg-ivory-200/60 text-neutral-400")}>
                              <span className="text-xs">{chip.weekday}</span>
                              <span className="num text-2xl font-extrabold leading-tight">{chip.day}</span>
                              <span className="text-xs">{chip.month}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-5" aria-live="polite">
                        {!dayKey ? <p className="text-neutral-700">یک روز را انتخاب کنید تا ساعت‌ها نمایش داده شود.</p> : null}
                        {dayKey && times.isLoading ? <Spinner label="در حال دریافت ساعت‌ها…" /> : null}
                        {dayKey && times.isError ? <ErrorState title="دریافت ساعت‌ها ممکن نشد" onRetry={() => times.refetch()} /> : null}
                        {dayKey && times.data && !times.data.length ? <EmptyState title="این روز پر شده است" text="روز دیگری را انتخاب کنید." /> : null}
                        {dayKey && times.data?.length ? (
                          ["morning", "afternoon", "evening"].map((period) => {
                            const list = times.data.filter((t) => timePeriod(t.startsAt) === period);
                            if (!list.length) return null;
                            return (
                              <div key={period} className="mb-5">
                                <h3 className="mb-2 text-sm font-bold text-brass-700">{PERIOD_LABELS[period]}</h3>
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                  {list.map((t) => (
                                    <button key={t.startsAt} type="button" onClick={() => pickTime(t)} className="btn-press num h-12 rounded-xl border border-ivory-300 bg-ivory-50 font-bold text-forest-900 hover:border-forest-700 hover:bg-forest-50">{formatTime(t.startsAt)}</button>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : null}
                      </div>
                    </>
                  )
                ) : null}
                <BackLink onClick={() => go(1)} />
              </section>
            ) : null}

            {step === 3 && chosen ? (
              <section>
                {heading("مشخصات شما", "برای هماهنگی و یادآوری نوبت لازم است.")}
                <form noValidate onSubmit={(e) => { e.preventDefault(); if (validate()) go(4); }} className="space-y-5">
                  <Field id="name" label="نام و نام خانوادگی" icon={User} error={errors.name}>
                    <input id="name" autoComplete="name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-err" : undefined} className={inputCls(errors.name)} />
                  </Field>
                  <Field id="phone" label="شماره موبایل" icon={Phone} error={errors.phone}>
                    <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09121234567" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-err" : undefined} className={cn(inputCls(errors.phone), "text-end")} />
                  </Field>
                  <Field id="note" label="توضیحات (اختیاری)" error={errors.note}>
                    <textarea id="note" rows={3} maxLength={300} value={details.note} onChange={(e) => setDetails({ ...details, note: e.target.value })} placeholder="مثلاً مدل دلخواه یا حساسیت پوستی" className={cn(inputCls(errors.note), "h-auto py-3")} />
                  </Field>
                  {credit ? (
                    <label className="flex items-start gap-3 rounded-xl border border-forest-700/30 bg-forest-50 p-4 text-sm">
                      <input type="checkbox" checked={details.useCredit} onChange={(e) => setDetails({ ...details, useCredit: e.target.checked })} className="mt-1 size-4 accent-forest-700" />
                      <span><strong className="text-forest-900">استفاده از اعتبار بسته</strong><br />{toFa(credit.remaining)} جلسه از {toFa(credit.total)} جلسه باقی مانده است؛ این نوبت از اعتبار کم می‌شود.</span>
                    </label>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Btn type="submit" size="lg">ادامه و مشاهده خلاصه</Btn>
                    <BackLink onClick={() => go(2)} inline />
                  </div>
                </form>
              </section>
            ) : null}

            {step === 4 && chosen ? (
              <section>
                {heading("بررسی و تأیید نهایی", "قبل از ثبت، اطلاعات را مرور کنید.")}
                <div className="rounded-2xl border border-ivory-300 bg-ivory-50 p-5 text-sm">
                  <dl className="space-y-2.5">
                    <Row k="نام" v={details.name} />
                    <Row k="موبایل" v={<span dir="ltr" className="num">{toFaDigits(normalizeMobile(details.phone))}</span>} />
                    {details.note ? <Row k="توضیحات" v={details.note} /> : null}
                    {credit && details.useCredit ? <Row k="پرداخت" v="از اعتبار بسته" /> : null}
                  </dl>
                </div>
                <p className="mt-4 rounded-xl bg-forest-50 px-4 py-3 text-sm leading-7 text-forest-900">{CANCELLATION_POLICY}</p>
                {submitError ? <p role="alert" className="mt-4 rounded-xl border border-[#8a2a22]/30 bg-[#fbeeea] px-4 py-3 text-sm text-[#5c1b16]">{submitError}</p> : null}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Btn size="lg" onClick={confirm} disabled={submitting} aria-busy={submitting}>{submitting ? "در حال ثبت نوبت…" : "تأیید و ثبت نوبت"}</Btn>
                  <BackLink onClick={() => go(3)} inline />
                </div>
              </section>
            ) : null}
          </div>
        </div>
        <Summary service={service} barber={chosenBarber ?? barber} start={chosen?.startsAt} className="lg:sticky lg:top-24" />
      </div>
    </div>
  );
}

const inputCls = (error) => cn("h-12 w-full rounded-xl border bg-ivory-50 px-4 text-base outline-none transition-colors focus:border-forest-700 focus:ring-2 focus:ring-forest-700/30", error ? "border-[#8a2a22]" : "border-neutral-300");

function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-forest-900">{Icon ? <Icon className="size-4 text-brass-600" aria-hidden /> : null}{label}</label>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-[#8a2a22]">{error}</p> : null}
    </div>
  );
}

function BackLink({ onClick, inline }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1 text-sm font-semibold text-forest-800 underline decoration-brass-500 underline-offset-4", !inline && "mt-6")}>
      <ChevronRight className="size-4" aria-hidden /> مرحله قبل
    </button>
  );
}

function Success({ result, onRestart, headingRef }) {
  const title = `نوبت ${result.service.name} در خانه داماد`;
  const event = { id: result.id, title, startsAt: result.startsAt, endsAt: result.endsAt, location: contact.address, description: `آرایشگر: ${result.barber?.name ?? "-"}، تلفن ${contact.phoneDisplay}` };
  const confirmed = result.status === "confirmed";
  return (
    <section aria-labelledby="done" className="mx-auto max-w-2xl text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-forest-700 text-ivory-50"><Check className="size-8" aria-hidden /></div>
      <h2 id="done" ref={headingRef} tabIndex={-1} className="mt-5 text-3xl font-extrabold text-forest-900 outline-none">نوبت شما ثبت شد</h2>
      <p className="mt-2 text-neutral-700">{confirmed ? "نوبت شما تأیید شده است." : "نوبت شما در انتظار تأیید استودیو است؛ در صورت نیاز با شما تماس می‌گیریم."}</p>
      {result.demo ? <p className="mt-3 rounded-xl border border-brass-400/60 bg-brass-200/30 px-4 py-2 text-sm">حالت نمایشی: این نوبت فقط روی همین دستگاه ذخیره شد.</p> : null}
      <p className="mt-6 rounded-xl bg-forest-50 px-4 py-3 text-sm leading-7 text-forest-900">پس از انجام نوبت، یک مهر کارت وفاداری شما ثبت می‌شود؛ با {toFa(loyalty.every)} مهر، مراجعه بعدی {toFa(loyalty.discountPercent)}٪ تخفیف دارد.</p>
      <dl className="mt-4 space-y-3 rounded-2xl border border-ivory-300 bg-ivory-50 p-6 text-start text-sm">
        <Row k="کد پیگیری" v={<span className="num font-mono" dir="ltr">{String(result.id).slice(-6).toUpperCase()}</span>} />
        <Row k="خدمت" v={result.service.name} />
        <Row k="آرایشگر" v={result.barber?.name ?? "-"} />
        <Row k="تاریخ" v={formatDateLong(result.startsAt)} />
        <Row k="ساعت" v={`${formatTime(result.startsAt)} تا ${formatTime(result.endsAt)}`} />
        <Row k="مبلغ" v={result.paidWithCredit ? "از اعتبار بسته" : formatPrice(result.service.price, result.service.currency)} />
        <Row k="نشانی" v={contact.addressShort} />
      </dl>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Btn onClick={() => downloadIcs(event)}><CalendarPlus className="size-5" aria-hidden /> افزودن به تقویم (ICS)</Btn>
        <Btn href={googleCalendarUrl(event)} variant="outline">گوگل کلندر</Btn>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Btn href={`tel:${contact.phone}`} variant="outline" size="sm"><Phone className="size-4" aria-hidden /> تماس با استودیو</Btn>
        {contact.whatsapp ? <Btn href={`https://wa.me/${contact.whatsapp}`} variant="outline" size="sm"><WhatsappIcon className="size-4" /> واتس‌اپ</Btn> : null}
        <Btn variant="ghost" size="sm" onClick={onRestart}>رزرو نوبت جدید</Btn>
      </div>
    </section>
  );
}
