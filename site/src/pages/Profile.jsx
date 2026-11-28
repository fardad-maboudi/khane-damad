import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, CalendarPlus, Check, CreditCard, LogOut, ShieldCheck, Sparkles, Ticket, User, UserCheck } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { PageHero } from "@/components/salon/sections.jsx";
import { Btn, Container, EmptyState, Spinner } from "@/components/salon/ui.jsx";
import {
  getAuthHeaders,
  getMe,
  isSignedIn,
  loginCustomerWithPassword,
  requestCustomerOtp,
  signOut,
  updateMe,
  verifyCustomerOtp,
} from "@/api/auth.js";
import { hasBackend, statusOf } from "@/api/joorchin.js";
import {
  cancelMyBooking,
  cancelMyEventRegistration,
  listMyBookings,
  listMyEvents,
  myCredits,
} from "@/api/plugins/bookings.js";
import { canManageBookings, getMyMembership } from "@/api/backoffice/team.js";
import { readRecentBookings, useCatalog } from "@/lib/salon-api.js";
import { formatDateLong, formatPrice, formatTime, toEnDigits, toFa, toFaDigits } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-[1rem] border border-ivory-300 bg-ivory-50 px-4 text-base text-forest-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brass-400";

const TABS = [
  { id: "account", label: "اطلاعات حساب", icon: User },
  { id: "bookings", label: "نوبت‌های من", icon: Calendar },
  { id: "credits", label: "بسته‌های اعتباری", icon: CreditCard },
  { id: "events", label: "رویدادهای من", icon: Ticket },
];

const BOOKING_STATUS = {
  pending: { label: "در انتظار تأیید", tone: "border-brass-300 bg-brass-100 text-forest-900" },
  confirmed: { label: "تأیید‌شده", tone: "border-forest-200 bg-forest-50 text-forest-900" },
  completed: { label: "تکمیل‌شده", tone: "border-ivory-300 bg-ivory-200 text-charcoal-800" },
  cancelled: { label: "لغوشده", tone: "border-danger-100 bg-danger-50 text-danger-900" },
  no_show: { label: "عدم حضور", tone: "border-danger-100 bg-danger-50 text-danger-900" },
  rescheduled: { label: "جابه‌جاشده", tone: "border-ivory-300 bg-ivory-100 text-neutral-700" },
};

const CREDIT_STATUS = {
  active: { label: "فعال", tone: "border-forest-200 bg-forest-50 text-forest-900" },
  exhausted: { label: "مصرف‌شده", tone: "border-ivory-300 bg-ivory-200 text-charcoal-800" },
  expired: { label: "منقضی", tone: "border-danger-100 bg-danger-50 text-danger-900" },
  revoked: { label: "لغوشده", tone: "border-danger-100 bg-danger-50 text-danger-900" },
};

const idOf = (row) => String(row?._id ?? row?.id ?? "");

const authErrorText = (error) => {
  const status = statusOf(error);
  if (status === 0) return "اتصال به سرور برقرار نشد؛ دسترسی به API را بررسی کنید.";
  if (status === 400) return "اطلاعات واردشده معتبر نیست.";
  if (status === 401) return "کد تأیید یا رمز عبور درست نیست.";
  if (status === 429) return "تلاش بیش از حد؛ چند دقیقه بعد دوباره امتحان کنید.";
  return error?.message || "عملیات انجام نشد؛ دوباره تلاش کنید.";
};

function AccountTab({ me, signedIn, canManage, onAuthChange }) {
  const [authMode, setAuthMode] = useState("otp");
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullNameLogin, setFullNameLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);

  const [fullName, setFullName] = useState(me?.fullName ?? me?.name ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setFullName(me?.fullName ?? me?.name ?? "");
    setEmail(me?.email ?? "");
  }, [me]);

  const saveMutation = useMutation({
    mutationFn: (payload) => updateMe(payload),
    onSuccess: () => {
      setSavedNotice(true);
      onAuthChange();
      window.setTimeout(() => setSavedNotice(false), 3000);
    },
  });

  async function handleSendOtp(event) {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      const normalized = toEnDigits(phone.trim());
      await requestCustomerOtp(normalized);
      setStep("code");
      setAuthNotice(`کد تأیید به ${toFaDigits(normalized)} پیامک شد.`);
    } catch (e) {
      setAuthError(authErrorText(e));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await verifyCustomerOtp({
        phone: toEnDigits(phone.trim()),
        otpCode: toEnDigits(code.trim()),
        fullName: fullNameLogin.trim() || undefined,
      });
      setStep("phone");
      setCode("");
      setAuthNotice(null);
      onAuthChange();
    } catch (e) {
      setAuthError(authErrorText(e));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePasswordLogin(event) {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await loginCustomerWithPassword(toEnDigits(phone.trim()), password);
      setPassword("");
      onAuthChange();
    } catch (e) {
      setAuthError(authErrorText(e));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    setAuthBusy(true);
    await signOut();
    setAuthBusy(false);
    onAuthChange();
  }

  if (signedIn) {
    const displayName = me?.fullName || me?.name || "مشتری گرامی";
    const displayPhone = me?.phone || me?.phoneNumber || "";
    const initial = String(displayName).trim().charAt(0) || "خ";
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-full border border-brass-400/50 bg-forest-900 font-heading text-2xl font-bold text-brass-200">
              {initial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-forest-900">{displayName}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3 py-0.5 text-xs font-semibold text-forest-800">
                  <UserCheck className="size-3.5 text-forest-700" aria-hidden /> واردشده
                </span>
              </div>
              {displayPhone ? (
                <p dir="ltr" className="mt-1 text-end text-sm text-neutral-600 num">
                  {toFaDigits(displayPhone)}
                </p>
              ) : null}
              {me?.email ? <p className="mt-0.5 text-sm text-neutral-600">{me.email}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {canManage ? (
              <Btn to="/salon/appointments" variant="outline" size="sm">
                <ShieldCheck className="size-4" aria-hidden /> پنل مدیریت نوبت‌ها
              </Btn>
            ) : null}
            <Btn type="button" variant="outline" size="sm" onClick={handleSignOut} disabled={authBusy}>
              <LogOut className="size-4" aria-hidden /> خروج از حساب
            </Btn>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({ fullName: fullName.trim(), email: email.trim() || undefined });
          }}
          className="space-y-5 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8"
        >
          <div>
            <h3 className="font-heading text-lg font-bold text-forest-900">ویرایش مشخصات فردی</h3>
            <p className="mt-1 text-sm text-neutral-600">این اطلاعات هنگام رزرو نوبت‌های بعدی به‌صورت خودکار استفاده می‌شود.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>نام و نام خانوادگی</span>
              <input
                type="text"
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثلاً کیارش محمدی"
              />
            </label>
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>ایمیل (اختیاری)</span>
              <input
                type="email"
                dir="ltr"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </label>
          </div>

          {saveMutation.isError ? (
            <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">
              {authErrorText(saveMutation.error)}
            </p>
          ) : null}
          {savedNotice ? (
            <p role="status" className="flex items-center gap-2 text-sm font-semibold text-forest-800">
              <Check className="size-4 text-brass-600" aria-hidden /> تغییرات با موفقیت ذخیره شد.
            </p>
          ) : null}

          <div className="flex justify-end">
            <Btn type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </Btn>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-forest-900">ورود به حساب کاربری</h2>
            <p className="mt-1 text-sm text-neutral-600">برای همگام‌سازی نوبت‌ها و بسته‌های اعتباری وارد شوید.</p>
          </div>
          {hasBackend ? (
            <div className="flex rounded-full border border-ivory-300 bg-ivory-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setAuthError(null);
                }}
                className={cn(
                  "min-h-9 rounded-full px-3.5 transition-colors",
                  authMode === "otp" ? "bg-forest-900 text-ivory-50" : "text-neutral-700 hover:text-forest-900",
                )}
              >
                کد پیامکی
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setAuthError(null);
                }}
                className={cn(
                  "min-h-9 rounded-full px-3.5 transition-colors",
                  authMode === "password" ? "bg-forest-900 text-ivory-50" : "text-neutral-700 hover:text-forest-900",
                )}
              >
                رمز عبور
              </button>
            </div>
          ) : null}
        </div>

        {!hasBackend ? (
          <p className="mt-5 rounded-xl border border-ivory-300 bg-ivory-100 px-4 py-3 text-sm text-neutral-700">
            سرویس ورود سرور متصل نیست؛ نوبت‌ها و بسته‌های ثبت‌شده در این مرورگر در تب‌های دیگر نمایش داده می‌شوند.
          </p>
        ) : authMode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>شماره موبایل</span>
              <input
                type="tel"
                dir="ltr"
                required
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
              />
            </label>
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>رمز عبور</span>
              <input
                type="password"
                dir="ltr"
                required
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {authError ? <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{authError}</p> : null}
            <Btn type="submit" disabled={authBusy} className="w-full sm:w-auto">
              {authBusy ? "در حال ورود…" : "ورود به حساب"}
            </Btn>
          </form>
        ) : step === "phone" ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>شماره موبایل</span>
              <input
                type="tel"
                dir="ltr"
                required
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
              />
            </label>
            {authError ? <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{authError}</p> : null}
            <Btn type="submit" disabled={authBusy} className="w-full sm:w-auto">
              {authBusy ? "در حال ارسال…" : "ارسال کد تأیید"}
            </Btn>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            {authNotice ? (
              <p role="status" className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-2.5 text-sm text-forest-900">
                {authNotice}
              </p>
            ) : null}
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>کد تأیید پیامکی</span>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                required
                className={inputClass}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </label>
            <label className="block space-y-2 text-sm font-semibold text-forest-900">
              <span>نام و نام خانوادگی (برای ثبت‌نام اولیه)</span>
              <input
                type="text"
                className={inputClass}
                value={fullNameLogin}
                onChange={(e) => setFullNameLogin(e.target.value)}
                placeholder="مثلاً کیارش محمدی"
              />
            </label>
            {authError ? <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-900">{authError}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <Btn type="submit" disabled={authBusy}>
                {authBusy ? "در حال بررسی…" : "تأیید و ورود"}
              </Btn>
              <Btn
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setAuthError(null);
                }}
              >
                تغییر شماره
              </Btn>
            </div>
          </form>
        )}
      </div>

      <aside className="flex flex-col justify-between rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brass-300 bg-brass-100 px-3 py-1 text-xs font-bold text-forest-900">
            <Sparkles className="size-3.5 text-brass-600" aria-hidden /> وضعیت مهمان
          </span>
          <h3 className="mt-4 font-heading text-lg font-bold text-forest-900">پیگیری بدون ورود</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-600">
            حتی پیش از ورود به حساب، نوبت‌ها و بسته‌های ثبت‌شده در همین مرورگر در تب‌های «نوبت‌های من» و «بسته‌های اعتباری» در دسترس هستند.
          </p>
        </div>
        <div className="mt-6 space-y-3 border-t border-ivory-200 pt-5">
          <Btn to="/book" className="w-full">
            <CalendarPlus className="size-4" aria-hidden /> رزرو نوبت جدید
          </Btn>
          <Link
            to="/salon/login"
            className="block text-center text-xs font-semibold text-neutral-600 underline decoration-brass-500/50 underline-offset-4 hover:text-forest-900"
          >
            ورود پرسنل و مدیریت سالن
          </Link>
        </div>
      </aside>
    </div>
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("upcoming");
  const catalogQuery = useCatalog();
  const bookingsQuery = useQuery({
    queryKey: ["profile", "bookings", getAuthHeaders()],
    queryFn: async () => {
      try {
        const remote = await listMyBookings();
        if (Array.isArray(remote) && remote.length > 0) return remote;
      } catch {
        // Fall back to recent bookings stored in this browser.
      }
      return readRecentBookings();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelMyBooking(id, "لغو توسط مشتری از پروفایل"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "bookings"] }),
  });

  const servicesMap = useMemo(
    () => new Map((catalogQuery.data?.services ?? []).map((s) => [s.id, s])),
    [catalogQuery.data],
  );
  const barbersMap = useMemo(
    () => new Map((catalogQuery.data?.barbers ?? []).map((b) => [b.id, b])),
    [catalogQuery.data],
  );

  const rows = (bookingsQuery.data ?? []).filter((row) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return row.status === "cancelled";
    return ["pending", "confirmed"].includes(row.status) && new Date(row.startsAt).getTime() >= Date.now();
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "upcoming", label: "پیش رو" },
            { id: "all", label: "همه نوبت‌ها" },
            { id: "cancelled", label: "لغوشده" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                filter === item.id
                  ? "border-forest-900 bg-forest-900 text-ivory-50"
                  : "border-ivory-300 bg-ivory-50 text-neutral-700 hover:border-brass-400 hover:text-forest-900",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Btn to="/book" size="sm">
          <CalendarPlus className="size-4" aria-hidden /> نوبت جدید
        </Btn>
      </div>

      {bookingsQuery.isLoading ? <Spinner /> : null}
      {!bookingsQuery.isLoading && rows.length === 0 ? (
        <EmptyState
          title="نوبتی در این بخش ثبت نشده است"
          text="می‌توانید همین حالا زمان دلخواه خود را از صفحه رزرو انتخاب کنید."
          action={<Btn to="/book" size="sm">رزرو نوبت آنلاین</Btn>}
        />
      ) : null}

      <ul className="space-y-4">
        {rows.map((row) => {
          const id = idOf(row);
          const srv = servicesMap.get(idOf(row.service));
          const barber = barbersMap.get(idOf(row.resource));
          const title = row.serviceName || srv?.name || "خدمت آرایشگاه";
          const barberName = row.barberName || barber?.name || "";
          const badge = BOOKING_STATUS[row.status] ?? BOOKING_STATUS.pending;
          const canCancel = ["pending", "confirmed"].includes(row.status) && !row.demo;
          return (
            <li
              key={id || row.startsAt}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-5 sm:p-6"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-heading text-lg font-bold text-forest-900">{title}</h3>
                  <span className={cn("rounded-full border px-3 py-0.5 text-xs font-semibold", badge.tone)}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 num">
                  {formatDateLong(row.startsAt)} · ساعت {formatTime(row.startsAt)}
                  {barberName ? ` · با ${barberName}` : ""}
                </p>
                {row.price ? (
                  <p className="text-sm font-semibold text-forest-800 num">
                    {formatPrice(row.price, row.currency || "IRT")}
                  </p>
                ) : null}
              </div>
              {canCancel ? (
                <Btn
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(id)}
                >
                  لغو نوبت
                </Btn>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CreditsTab() {
  const creditsQuery = useQuery({
    queryKey: ["profile", "credits", getAuthHeaders()],
    queryFn: async () => {
      let local = [];
      try {
        local = JSON.parse(localStorage.getItem("khane-credits") || "[]");
      } catch {
        local = [];
      }
      try {
        const remote = await myCredits();
        const list = Array.isArray(remote) ? remote : remote?.items ?? [];
        if (list.length > 0) return list;
      } catch {
        // Keep local fallback if unauthenticated or offline.
      }
      return local;
    },
  });

  const rows = creditsQuery.data ?? [];
  if (creditsQuery.isLoading) return <Spinner />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="بسته اعتباری فعالی ندارید"
        text="با خرید بسته‌های چندجلسه‌ای از صفحه خدمات، جلسات شما در این بخش ذخیره می‌شوند."
        action={<Btn to="/services" size="sm">مشاهده خدمات و بسته‌ها</Btn>}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((credit) => {
        const id = idOf(credit);
        const total = Number(credit.totalSessions ?? credit.total ?? 0);
        const remaining = Number(credit.remainingSessions ?? credit.remaining ?? 0);
        const badge = CREDIT_STATUS[credit.status] ?? (remaining > 0 ? CREDIT_STATUS.active : CREDIT_STATUS.exhausted);
        return (
          <div key={id} className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-bold text-forest-900">
                {credit.packageName || "بسته اعتباری خدمت"}
              </h3>
              <span className={cn("shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold", badge.tone)}>
                {badge.label}
              </span>
            </div>
            <p className="mt-3 text-sm text-neutral-700 num">
              <strong className="text-lg font-bold text-forest-900">{toFa(remaining)}</strong> جلسه باقی‌مانده از{" "}
              {toFa(total)} جلسه
            </p>
            {credit.expiresAt ? (
              <p className="mt-2 text-xs text-neutral-500 num">
                اعتبار تا {formatDateLong(credit.expiresAt)}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function EventsTab() {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({
    queryKey: ["profile", "events", getAuthHeaders()],
    queryFn: async () => {
      try {
        return await listMyEvents();
      } catch {
        return [];
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelMyEventRegistration(id, "لغو توسط کاربر از پروفایل"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "events"] }),
  });

  const rows = eventsQuery.data ?? [];
  if (eventsQuery.isLoading) return <Spinner />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="ثبت‌نامی در رویدادها ندارید"
        text="در صورت ثبت‌نام در رویدادها و ورکشاپ‌های سالن، جزئیات آن‌ها اینجا نمایش داده می‌شود."
        action={<Btn to="/bookings/events" size="sm">مشاهده رویدادها</Btn>}
      />
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((reg) => {
        const id = idOf(reg);
        const isCancelled = reg.status === "cancelled";
        return (
          <li
            key={id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-5 sm:p-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-heading text-lg font-bold text-forest-900">
                  {reg.eventTitle || "ثبت‌نام رویداد"}
                </h3>
                <span
                  className={cn(
                    "rounded-full border px-3 py-0.5 text-xs font-semibold",
                    isCancelled
                      ? "border-danger-100 bg-danger-50 text-danger-900"
                      : "border-forest-200 bg-forest-50 text-forest-900",
                  )}
                >
                  {isCancelled ? "لغوشده" : "تأیید‌شده"}
                </span>
              </div>
              <p className="text-sm text-neutral-600 num">
                تعداد صندلی: {toFa(reg.seats ?? 1)}
                {reg.totalPrice ? ` · ${formatPrice(reg.totalPrice)}` : ""}
              </p>
            </div>
            {!isCancelled ? (
              <Btn
                type="button"
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(id)}
              >
                لغو ثبت‌نام
              </Btn>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function Profile() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const activeTab = TABS.some((t) => t.id === requestedTab) ? requestedTab : "account";
  const [signedIn, setSignedIn] = useState(isSignedIn);

  const meQuery = useQuery({
    queryKey: ["profile", "me", getAuthHeaders()],
    queryFn: getMe,
    enabled: signedIn,
    retry: false,
  });

  const membershipQuery = useQuery({
    queryKey: ["salon", "membership", getAuthHeaders()],
    queryFn: getMyMembership,
    enabled: signedIn,
    retry: false,
  });

  const canManage = signedIn && canManageBookings(membershipQuery.data);

  function handleAuthChange() {
    setSignedIn(isSignedIn());
    queryClient.invalidateQueries();
  }

  function selectTab(id) {
    const next = new URLSearchParams(params);
    if (id === "account") next.delete("tab");
    else next.set("tab", id);
    setParams(next);
  }

  return (
    <>
      <Seo title="پروفایل کاربری" noindex />
      <PageHero
        eyebrow="حساب کاربری"
        title="پروفایل و رزروهای من"
        lead="مشخصات حساب، نوبت‌های پیش رو، بسته‌های اعتباری و ثبت‌نام‌های خود را یک‌جا مدیریت کنید."
      />
      <Container className="py-12 sm:py-16">
        <div
          role="tablist"
          aria-label="بخش‌های پروفایل"
          className="mb-8 flex flex-wrap gap-2 border-b border-ivory-300 pb-4"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={cn(
                  "btn-press inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-bold transition-colors",
                  selected
                    ? "border-forest-900 bg-forest-900 text-ivory-50"
                    : "border-ivory-300 bg-ivory-50 text-forest-900 hover:border-brass-400",
                )}
              >
                <Icon className={cn("size-4", selected ? "text-brass-300" : "text-brass-600")} aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "account" ? (
            meQuery.isLoading && signedIn ? (
              <Spinner />
            ) : (
              <AccountTab
                me={meQuery.data}
                signedIn={signedIn}
                canManage={canManage}
                onAuthChange={handleAuthChange}
              />
            )
          ) : null}
          {activeTab === "bookings" ? <BookingsTab /> : null}
          {activeTab === "credits" ? <CreditsTab /> : null}
          {activeTab === "events" ? <EventsTab /> : null}
        </div>
      </Container>
    </>
  );
}
