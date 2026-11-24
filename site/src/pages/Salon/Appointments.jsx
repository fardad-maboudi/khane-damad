import { createPortal } from "react-dom";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, Clock, MessageCircle, MessageSquareText, Phone, Scissors, Stamp, User, X, RefreshCw, Ban, UserX, CheckCheck } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, EmptyState, ErrorState, Spinner, useDialogFocusTrap } from "@/components/salon/ui.jsx";
import { PageHero } from "@/components/salon/sections.jsx";
import { getMyMembership } from "@/api/backoffice/team";
import { cancelBooking, completeBooking, confirmBooking, getCalendar, noShowBooking, rescheduleBooking } from "@/api/backoffice/bookings";
import { loadDayTimes, useCatalog } from "@/lib/salon-api.js";
import { discountedPrice, loyaltyState, reminderLinks, reminderText } from "@/lib/salon-helpers.js";
import { staffList } from "@/lib/staff-data.js";
import { loyalty } from "@/content/salon.js";
import { addDays, dateChip, dayRange, formatDateLong, formatPrice, formatTime, toFa, todayKey } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: { label: "در انتظار تأیید", cls: "bg-brass-200 text-brass-700" },
  confirmed: { label: "تأییدشده", cls: "bg-forest-100 text-forest-800" },
  completed: { label: "انجام‌شده", cls: "bg-ivory-200 text-charcoal-700" },
  cancelled: { label: "لغوشده", cls: "bg-danger-100 text-danger-700" },
  no_show: { label: "غیبت", cls: "bg-danger-100 text-danger-700" },
  rescheduled: { label: "جابه‌جاشده", cls: "bg-ivory-200 text-charcoal-700" },
};
const STATUS_FILTERS = [["all", "همه"], ["pending", "در انتظار"], ["confirmed", "تأییدشده"], ["completed", "انجام‌شده"], ["cancelled", "لغوشده"], ["no_show", "غیبت"]];
const DAY_FILTERS = [["today", "امروز"], ["tomorrow", "فردا (صف یادآوری)"], ["week", "۷ روز آینده"], ["all", "همه نوبت‌های پیش‌رو"]];

const idOf = (row) => String(row?._id ?? row?.id ?? "");

function rangeFor(day, custom) {
  const today = todayKey();
  if (custom) return dayRange(custom).from && { from: dayRange(custom).from, to: dayRange(custom).to };
  if (day === "today") return { from: dayRange(today).from, to: dayRange(addDays(today, 1)).from };
  if (day === "tomorrow") return { from: dayRange(addDays(today, 1)).from, to: dayRange(addDays(today, 2)).from };
  if (day === "week") return { from: dayRange(today).from, to: dayRange(addDays(today, 7)).from };
  return { from: dayRange(today).from, to: dayRange(addDays(today, 45)).from };
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useDialogFocusTrap(true, ref, onClose);
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-end bg-forest-950/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-6 page-enter" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-ivory-300 bg-ivory-50 p-6 focus:outline-none sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-ivory-200 pb-3.5">
          <h2 className="text-xl font-extrabold text-forest-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="بستن" className="btn-press grid size-11 place-items-center rounded-full border border-neutral-300 hover:border-forest-700">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function RescheduleDialog({ booking, catalog, onClose, onDone }) {
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(todayKey(), i)), []);
  const times = useQuery({
    queryKey: ["salon", "admin-times", idOf(booking), day],
    queryFn: () => loadDayTimes({ serviceId: String(booking.service), barberIds: [String(booking.resource)], dayKey: day }, catalog),
    enabled: Boolean(day && catalog),
  });
  const move = useMutation({
    mutationFn: (slotId) => rescheduleBooking(idOf(booking), { newSlotId: slotId, reason: "جابه‌جایی توسط استودیو" }),
    onSuccess: onDone,
    onError: (e) => setError(e?.message || "جابه‌جایی انجام نشد."),
  });
  return (
    <Modal title="جابه‌جایی نوبت" onClose={onClose}>
      <p className="text-sm text-neutral-700">برای {booking.customerName}، همان خدمت و همان آرایشگر. روز و ساعت جدید را انتخاب کنید.</p>
      <div className="no-bar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="روز جدید">
        {days.map((d) => {
          const chip = dateChip(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={d === day}
              onClick={() => {
                setDay(d);
                setError(null);
              }}
              className={cn(
                "btn-press flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5",
                d === day ? "border-forest-800 bg-forest-800 text-ivory-50" : "border-ivory-300 bg-ivory-100",
              )}
            >
              <span className="text-xs">{chip.weekday}</span>
              <span className="num text-xl font-extrabold">{chip.day}</span>
              <span className="text-xs">{chip.month}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 min-h-24" aria-live="polite">
        {!day ? <p className="text-sm text-neutral-600">یک روز انتخاب کنید.</p> : null}
        {times.isLoading ? <Spinner label="در حال بررسی…" className="py-6" /> : null}
        {times.isError ? <ErrorState title="دریافت ساعت‌ها ممکن نشد" onRetry={() => times.refetch()} /> : null}
        {times.data && !times.data.length ? <p className="text-sm text-neutral-700">این روز زمان خالی ندارد.</p> : null}
        <div className="grid grid-cols-4 gap-2">
          {times.data?.map((t) => (
            <button
              key={t.startsAt}
              type="button"
              disabled={move.isPending}
              onClick={() => move.mutate(t.options[0].slotId)}
              className="btn-press num h-11 rounded-xl border border-ivory-300 bg-ivory-100 font-bold text-forest-900 hover:border-forest-700 disabled:opacity-50"
            >
              {formatTime(t.startsAt)}
            </button>
          ))}
        </div>
      </div>
      {error ? <p role="alert" className="mt-3 rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{error}</p> : null}
    </Modal>
  );
}

function CancelDialog({ booking, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const cancel = useMutation({
    mutationFn: () => cancelBooking(idOf(booking), { reason: reason.trim() || "لغو توسط استودیو" }),
    onSuccess: onDone,
    onError: (e) => setError(e?.message || "لغو انجام نشد."),
  });
  return (
    <Modal title="لغو نوبت" onClose={onClose}>
      <p className="text-sm leading-7 text-neutral-700">
        نوبت «{booking.customerName}» در {formatDateLong(booking.startsAt)}، ساعت {formatTime(booking.startsAt)} لغو می‌شود و این زمان دوباره آزاد خواهد شد.
      </p>
      <label htmlFor="reason" className="mt-4 block text-sm font-bold text-forest-900">دلیل لغو (اختیاری)</label>
      <textarea
        id="reason"
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-ivory-100/60 p-3 focus:border-forest-700 focus:bg-ivory-50"
      />
      {error ? <p role="alert" className="mt-3 rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{error}</p> : null}
      <div className="mt-5 flex gap-3">
        <Btn variant="danger" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
          {cancel.isPending ? "در حال لغو…" : "لغو نوبت"}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
      </div>
    </Modal>
  );
}

function Row({ booking, services, barbers, clients, rewardFirst, busy, onAction }) {
  const service = services.get(String(booking.service));
  const barber = barbers.get(String(booking.resource));
  const st = STATUS[booking.status] ?? { label: booking.status, cls: "bg-ivory-200 text-charcoal-700" };
  const open = booking.status === "pending" || booking.status === "confirmed";
  const client = clients.get(String(booking.client)) ?? clients.get(String(booking.customerPhone));
  const state = loyaltyState(client?.visitCount);
  const card = state.rewardReady && !rewardFirst ? { ...state, rewardReady: false } : state;
  const price = service ? discountedPrice(booking.price || service.price, open ? card : { rewardReady: false }) : booking.price;
  const links = reminderLinks(booking.customerPhone, reminderText({ booking, service, barber }));
  return (
    <li className="grid gap-4 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-5 sm:p-6 md:grid-cols-[9.5rem_1fr_auto] md:items-center">
      <div>
        <p className="num text-2xl font-extrabold text-forest-900">{formatTime(booking.startsAt)}</p>
        <p className="mt-0.5 text-sm text-neutral-700">{formatDateLong(booking.startsAt)}</p>
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex items-center gap-1.5 font-bold text-charcoal-900">
            <User className="size-4 text-brass-600" aria-hidden />
            {booking.customerName}
          </p>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", st.cls)}>{st.label}</span>
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-700">
          <span className="inline-flex items-center gap-1.5">
            <Scissors className="size-4 text-brass-600" aria-hidden />
            {service?.name ?? booking.serviceTitle ?? "خدمت"}
            {barber ? ` با ${barber.name}` : ""}
          </span>
          <a href={`tel:${booking.customerPhone}`} dir="ltr" className="num inline-flex items-center gap-1.5 font-bold text-forest-800">
            <Phone className="size-4 text-brass-600" aria-hidden />
            {String(booking.customerPhone || "").replace("+98", "0")}
          </a>
          {price ? (
            <span className="inline-flex items-center gap-2 num">
              {open && card.rewardReady ? <s className="text-neutral-500">{formatPrice(booking.price || service?.price, service?.currency)}</s> : null}
              <span className={cn(open && card.rewardReady && "font-extrabold text-forest-800")}>{formatPrice(price, service?.currency)}</span>
            </span>
          ) : null}
        </p>
        {open ? (
          <p className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", card.rewardReady ? "bg-brass-200 text-brass-700" : "bg-ivory-200 text-charcoal-700")}>
            <Stamp className="size-3.5" aria-hidden />
            {card.rewardReady ? `پاداش وفاداری: ${toFa(loyalty.discountPercent)}٪ تخفیف برای این نوبت` : `کارت وفاداری: ${toFa(card.stamps)} از ${toFa(loyalty.every)} مهر`}
            {client?.noShowCount ? <span className="text-danger-700"> · {toFa(client.noShowCount)} غیبت</span> : null}
          </p>
        ) : null}
        {booking.notes ? <p className="text-sm text-neutral-600">توضیحات: {booking.notes}</p> : null}
      </div>
      {open || booking.status === "completed" ? (
        <div className="flex flex-wrap gap-2 md:justify-end">
          {booking.status === "pending" ? (
            <Btn size="sm" disabled={busy} onClick={() => onAction("confirm", booking)}>
              <Check className="size-4" aria-hidden /> تأیید
            </Btn>
          ) : null}
          {open ? (
            <Btn size="sm" variant="outline" disabled={busy} onClick={() => onAction("reschedule", booking)}>
              <CalendarClock className="size-4" aria-hidden /> جابه‌جایی
            </Btn>
          ) : null}
          {booking.status === "confirmed" ? (
            <Btn size="sm" variant="outline" disabled={busy} onClick={() => onAction("complete", booking)}>
              <CheckCheck className="size-4" aria-hidden /> انجام شد
            </Btn>
          ) : null}
          {booking.status === "confirmed" ? (
            <Btn size="sm" variant="ghost" disabled={busy} onClick={() => onAction("no_show", booking)}>
              <UserX className="size-4" aria-hidden /> غیبت
            </Btn>
          ) : null}
          {open ? (
            <Btn size="sm" variant="ghost" disabled={busy} onClick={() => onAction("cancel", booking)} className="text-danger-700">
              <Ban className="size-4" aria-hidden /> لغو
            </Btn>
          ) : null}
          {open ? (
            <span className="flex gap-2" role="group" aria-label="ارسال یادآوری به مشتری">
              <Btn size="sm" variant="ghost" href={links.whatsapp} aria-label={`یادآوری واتس‌اپ برای ${booking.customerName}`}>
                <MessageCircle className="size-4" aria-hidden /> یادآوری
              </Btn>
              <Btn size="sm" variant="ghost" href={links.sms} aria-label={`یادآوری پیامکی برای ${booking.customerName}`}>
                <MessageSquareText className="size-4" aria-hidden /> پیامک
              </Btn>
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export default function Appointments() {
  const client = useQueryClient();
  const catalogQuery = useCatalog();
  const [dayFilter, setDayFilter] = useState("week");
  const [customDay, setCustomDay] = useState(null);
  const [status, setStatus] = useState("all");
  const [barber, setBarber] = useState("all");
  const [dialog, setDialog] = useState(null);
  const [flash, setFlash] = useState(null);

  const membership = useQuery({ queryKey: ["salon", "membership"], queryFn: getMyMembership, retry: false });
  const member = membership.data?.membership || membership.data;
  const canManage = Boolean(member?.capabilities?.includes("booking:manage"));
  const range = rangeFor(dayFilter, customDay);
  const calendar = useQuery({
    queryKey: ["salon", "admin-calendar", range.from, range.to, barber],
    queryFn: () => getCalendar({ from: range.from, to: range.to, resourceId: barber === "all" ? undefined : barber, limit: 200 }),
    enabled: canManage,
    refetchInterval: 30_000,
  });
  const clientsQuery = useQuery({
    queryKey: ["salon", "admin-clients"],
    queryFn: () => staffList("booking_client"),
    enabled: canManage,
    staleTime: 30_000,
  });
  const clients = useMemo(() => {
    const map = new Map();
    for (const c of clientsQuery.data ?? []) {
      map.set(String(c._id ?? c.id), c);
      map.set(String(c.phoneNumber), c);
    }
    return map;
  }, [clientsQuery.data]);
  const services = useMemo(() => new Map((catalogQuery.data?.services ?? []).map((s) => [s.id, s])), [catalogQuery.data]);
  const barbers = useMemo(() => new Map((catalogQuery.data?.barbers ?? []).map((b) => [b.id, b])), [catalogQuery.data]);
  const all = useMemo(() => [...(calendar.data?.bookings ?? [])].sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt))), [calendar.data]);
  const visible = status === "all" ? all : all.filter((b) => b.status === status);
  const rewardFirst = useMemo(() => {
    const seen = new Set();
    const first = new Set();
    for (const b of all) {
      if (b.status !== "pending" && b.status !== "confirmed") continue;
      const key = String(b.client ?? b.customerPhone);
      if (!seen.has(key)) {
        seen.add(key);
        first.add(idOf(b));
      }
    }
    return first;
  }, [all]);
  const counts = useMemo(() => all.reduce((m, b) => ({ ...m, [b.status]: (m[b.status] ?? 0) + 1 }), {}), [all]);

  const refresh = useCallback(async () => {
    await client.invalidateQueries({ queryKey: ["salon"] });
  }, [client]);
  const act = useMutation({
    mutationFn: ({ kind, booking }) => ({ confirm: confirmBooking, complete: completeBooking, no_show: noShowBooking }[kind](idOf(booking))),
    onSuccess: async (_r, vars) => {
      let text = { confirm: "نوبت تأیید شد.", complete: "نوبت به‌عنوان انجام‌شده ثبت شد.", no_show: "غیبت مشتری ثبت شد." }[vars.kind];
      if (vars.kind === "complete") {
        const currentClient = clients.get(String(vars.booking.client)) ?? clients.get(String(vars.booking.customerPhone)) ?? {};
        const visits = (Number(currentClient.visitCount) || 0) + 1;
        const card = loyaltyState(visits);
        text += card.rewardReady
          ? ` مهر ${toFa(loyalty.every)} از ${toFa(loyalty.every)} ثبت شد؛ مراجعه بعدی این مشتری ${toFa(loyalty.discountPercent)}٪ تخفیف دارد.`
          : ` مهر ${toFa(card.stamps)} از ${toFa(loyalty.every)} روی کارت وفاداری ثبت شد.`;
      }
      setFlash({ ok: true, text });
      await refresh();
    },
    onError: (e) => setFlash({ ok: false, text: e?.message || "عملیات انجام نشد." }),
  });
  function onAction(kind, booking) {
    setFlash(null);
    if (kind === "reschedule" || kind === "cancel") setDialog({ kind, booking });
    else act.mutate({ kind, booking });
  }
  const done = (text) => async () => {
    setDialog(null);
    setFlash({ ok: true, text });
    await refresh();
  };

  const pendingAll = counts.pending ?? 0;
  const strip = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(todayKey(), i)), []);

  return (
    <>
      <Seo title="مدیریت نوبت‌ها" description="مدیریت نوبت‌های خانه داماد" noindex />
      <PageHero
        eyebrow="پنل مدیریت استودیو"
        title="مدیریت نوبت‌ها و پذیرش"
        lead="فیلتر بر اساس روز، وضعیت و آرایشگر؛ تأیید، جابه‌جایی، ثبت مهر وفاداری و ارسال یادآوری."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Btn variant="brass" size="sm" onClick={refresh}>
            <RefreshCw className="size-4" aria-hidden /> به‌روزرسانی فهرست
          </Btn>
          <Btn to="/bookings/manage" variant="outlineLight" size="sm">
            نمای تقویم ماهانه
          </Btn>
        </div>
      </PageHero>

      <Container className="py-10">
        {membership.isLoading ? <Spinner label="در حال بررسی دسترسی…" className="py-20" /> : null}
        {membership.isError || (membership.data && !canManage) ? (
          <EmptyState
            title={membership.isError ? "برای مدیریت نوبت‌ها وارد شوید" : "دسترسی لازم را ندارید"}
            text={membership.isError ? "این بخش فقط برای صاحب سایت و اعضای تیم است." : "برای مدیریت نوبت‌ها به دسترسی مدیریت رزرو نیاز دارید."}
            action={<Btn to="/admin/login" size="sm">ورود مدیر</Btn>}
          />
        ) : null}
        {canManage ? (
          <>
            {pendingAll > 0 ? (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brass-400/60 bg-brass-100 px-5 py-3.5 text-sm text-forest-900">
                <Clock className="size-4 text-brass-700" aria-hidden /> <strong className="num">{toFa(pendingAll)}</strong> نوبت جدید در انتظار بررسی و تأیید شماست.
              </div>
            ) : null}
            <div className="space-y-4 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-4 sm:p-6">
              <div role="group" aria-label="فیلتر روز" className="flex flex-wrap gap-2">
                {DAY_FILTERS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={!customDay && dayFilter === key}
                    onClick={() => {
                      setDayFilter(key);
                      setCustomDay(null);
                    }}
                    className={cn(
                      "btn-press rounded-full border px-4 py-1.5 text-sm font-bold",
                      !customDay && dayFilter === key ? "border-forest-800 bg-forest-800 text-ivory-50" : "border-forest-700/30 text-forest-800 hover:bg-forest-50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="انتخاب روز مشخص" className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {strip.map((d) => {
                  const chip = dateChip(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={customDay === d}
                      onClick={() => setCustomDay(customDay === d ? null : d)}
                      className={cn(
                        "btn-press flex w-14 shrink-0 flex-col items-center rounded-xl border px-1.5 py-2 text-xs",
                        customDay === d ? "border-forest-800 bg-forest-800 text-ivory-50" : "border-ivory-300 bg-ivory-100",
                      )}
                    >
                      <span>{chip.weekday}</span>
                      <span className="num text-lg font-extrabold">{chip.day}</span>
                      <span>{chip.month}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div role="group" aria-label="فیلتر وضعیت" className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={status === key}
                      onClick={() => setStatus(key)}
                      className={cn(
                        "btn-press rounded-full border px-3.5 py-1.5 text-sm font-semibold",
                        status === key ? "border-brass-600 bg-brass-200 text-charcoal-900" : "border-neutral-300 text-neutral-700 hover:bg-ivory-100",
                      )}
                    >
                      {label}
                      {key !== "all" && counts[key] ? <span className="num ms-1.5 text-xs">{toFa(counts[key])}</span> : null}
                    </button>
                  ))}
                </div>
                <label className="ms-auto flex items-center gap-2 text-sm font-bold text-forest-900">
                  آرایشگر
                  <select
                    value={barber}
                    onChange={(e) => setBarber(e.target.value)}
                    className="h-11 rounded-xl border border-neutral-300 bg-ivory-100/70 px-3 text-sm font-semibold focus:border-forest-700 focus:bg-ivory-50"
                  >
                    <option value="all">همه اساتید</option>
                    {[...barbers.values()].map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6" aria-live="polite">
              {flash ? (
                <p role={flash.ok ? "status" : "alert"} className={cn("mb-4 rounded-xl px-4 py-3 text-sm font-semibold", flash.ok ? "bg-forest-50 text-forest-900 border border-forest-700/20" : "bg-danger-50 text-danger-900 border border-danger-600/30")}>
                  {flash.text}
                </p>
              ) : null}
              {calendar.isLoading ? <Spinner label="در حال دریافت نوبت‌ها…" className="py-16" /> : null}
              {calendar.isError ? <ErrorState title="دریافت نوبت‌ها ممکن نشد" text={calendar.error?.message} onRetry={() => calendar.refetch()} /> : null}
              {calendar.data && !visible.length ? <EmptyState title="نوبتی در این بازه پیدا نشد" text="با تغییر فیلتر روز، وضعیت یا آرایشگر دوباره جست‌وجو کنید." /> : null}
              <ul className="space-y-3.5">
                {visible.map((b) => (
                  <Row
                    key={idOf(b)}
                    booking={b}
                    services={services}
                    barbers={barbers}
                    clients={clients}
                    rewardFirst={rewardFirst.has(idOf(b))}
                    busy={act.isPending}
                    onAction={onAction}
                  />
                ))}
              </ul>
              {calendar.data && visible.length ? <p className="mt-4 text-sm text-neutral-600 num">{toFa(visible.length)} نوبت در این نما</p> : null}
            </div>
          </>
        ) : null}
      </Container>
      {dialog?.kind === "reschedule" ? <RescheduleDialog booking={dialog.booking} catalog={catalogQuery.data} onClose={() => setDialog(null)} onDone={done("نوبت با موفقیت جابه‌جا شد.")} /> : null}
      {dialog?.kind === "cancel" ? <CancelDialog booking={dialog.booking} onClose={() => setDialog(null)} onDone={done("نوبت لغو شد و زمان دوباره آزاد شد.")} /> : null}
    </>
  );
}
