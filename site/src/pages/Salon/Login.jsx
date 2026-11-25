import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container } from "@/components/salon/ui.jsx";
import { PageHero } from "@/components/salon/sections.jsx";
import { API_HOST, APP_ID, hasBackend, statusOf } from "@/api/joorchin.js";
import { isSignedIn, loginStaff, loginStaffWithPassword, requestStaffOtp, signOut } from "@/api/auth.js";
import { toFa } from "@/lib/fa.js";

const inputClass =
  "h-12 w-full rounded-[1rem] border border-ivory-300 bg-ivory-50 px-4 text-base text-forest-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brass-400";

const ERROR_TEXT = {
  0: "اتصال به سرور برقرار نشد؛ اینترنت یا دسترسی به API را بررسی کنید.",
  400: "شماره یا کد وارد‌شده معتبر نیست.",
  401: "کد تأیید درست نیست یا منقضی شده است.",
  403: "این شماره عضو تیم این سایت نیست.",
  404: "این شماره عضو تیم این سایت نیست.",
  429: "تلاش بیش از حد؛ چند دقیقه بعد دوباره امتحان کنید.",
};

const messageFor = (error) =>
  ERROR_TEXT[statusOf(error)] ?? error?.message ?? "ورود انجام نشد؛ دوباره تلاش کنید.";

export default function StaffLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const [mode, setMode] = useState("otp");
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function sendCode(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestStaffOtp(phone.trim());
      setStep("code");
      setNotice(`کد تأیید به ${toFa(phone.trim())} پیامک شد.`);
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  async function withPassword(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await loginStaffWithPassword(phone.trim(), password);
      await queryClient.invalidateQueries();
      setSignedIn(true);
      navigate("/salon/setup", { replace: true });
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await loginStaff(phone.trim(), code.trim());
      await queryClient.invalidateQueries();
      setSignedIn(true);
      navigate("/salon/setup", { replace: true });
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    setBusy(true);
    await signOut();
    await queryClient.invalidateQueries();
    setSignedIn(false);
    setStep("phone");
    setCode("");
    setNotice(null);
    setBusy(false);
  }

  return (
    <>
      <Seo title="ورود تیم استودیو" noindex />
      <PageHero
        eyebrow="پنل مدیریت"
        title="ورود تیم خانه داماد"
        lead="ورود با شماره موبایل صاحب سایت یا اعضای دعوت‌شده انجام می‌شود؛ کد تأیید پیامک می‌شود."
      />
      <Container className="max-w-xl py-14 sm:py-16">
        {!hasBackend ? (
          <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-forest-900">
              <ShieldCheck className="size-5 text-brass-600" aria-hidden />
              بک‌اند متصل نیست
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              برای فعال‌کردن ورود و پنل مدیریت، شناسه اپ Joorchin را در متغیر محیطی
              <code className="mx-1 rounded bg-ivory-200 px-1.5 py-0.5 text-[0.8rem]" dir="ltr">
                VITE_JOORCHIN_APP_ID
              </code>
              قرار دهید و برنامه را دوباره اجرا کنید.
            </p>
          </div>
        ) : signedIn ? (
          <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-forest-900">
              <ShieldCheck className="size-5 text-brass-600" aria-hidden />
              شما وارد شده‌اید
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              دسترسی مدیریت نوبت فعال است. می‌توانید داده‌های نمونه را راه‌اندازی کنید یا پنل نوبت‌ها را ببینید.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn to="/salon/setup">راه‌اندازی داده‌ها</Btn>
              <Btn to="/salon/appointments" variant="outline">
                پنل نوبت‌ها
              </Btn>
              <Btn onClick={leave} disabled={busy} variant="ghost">
                <LogOut className="size-4" aria-hidden /> خروج
              </Btn>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-ivory-300 bg-ivory-50 p-6 sm:p-8">
            <form onSubmit={mode === "password" ? withPassword : step === "phone" ? sendCode : verify} className="space-y-4">
              <div className="flex gap-2" role="tablist" aria-label="روش ورود">
                {[
                  ["otp", "کد پیامکی"],
                  ["password", "رمز عبور"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                      mode === value ? "bg-forest-800 text-ivory-50" : "border border-ivory-300 text-forest-800"
                    }`}
                    onClick={() => {
                      setMode(value);
                      setStep("phone");
                      setCode("");
                      setPassword("");
                      setError(null);
                      setNotice(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="staff-phone" className="mb-2 block text-sm font-bold text-forest-900">
                  شماره موبایل
                </label>
                <input
                  id="staff-phone"
                  className={inputClass}
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0912…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={mode === "otp" && step === "code"}
                  required
                />
              </div>

              {mode === "password" ? (
                <div>
                  <label htmlFor="staff-password" className="mb-2 block text-sm font-bold text-forest-900">
                    رمز عبور
                  </label>
                  <input
                    id="staff-password"
                    className={inputClass}
                    dir="ltr"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              ) : null}

              {mode === "otp" && step === "code" ? (
                <div className="enter">
                  <label htmlFor="staff-code" className="mb-2 block text-sm font-bold text-forest-900">
                    کد تأیید
                  </label>
                  <input
                    id="staff-code"
                    className={inputClass}
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="------"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="u-link mt-3 inline-flex text-xs font-bold text-forest-800"
                    onClick={() => {
                      setStep("phone");
                      setCode("");
                      setNotice(null);
                    }}
                  >
                    تغییر شماره
                  </button>
                </div>
              ) : null}

              {notice ? (
                <p role="status" className="rounded-xl bg-forest-900/[0.06] px-4 py-2.5 text-sm text-forest-900">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2.5 text-sm text-danger-900">
                  {error}
                </p>
              ) : null}

              <Btn
                type="submit"
                size="lg"
                disabled={busy || (mode === "otp" && step === "code" && code.length < 4) || (mode === "password" && password.length < 4)}
              >
                {busy ? "در حال بررسی…" : mode === "password" ? "ورود" : step === "phone" ? "ارسال کد تأیید" : "ورود"}
                {!busy ? <ArrowLeft className="size-5" aria-hidden /> : null}
              </Btn>
            </form>
            <p className="mt-5 text-xs leading-6 text-neutral-500">
              ورود مخصوص تیم استودیو است؛ ورود مراجعان از همین صفحه انجام نمی‌شود.
            </p>
            <p className="mt-3 text-[0.7rem] leading-6 text-neutral-400" dir="ltr">
              {API_HOST} · app {APP_ID.slice(0, 8)}…
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
