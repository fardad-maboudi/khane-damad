import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, MapPin, Clock, CalendarPlus, ArrowLeft, User, UserCheck, LogOut } from "lucide-react";
import { Btn, Container, Wordmark, InstagramIcon, TelegramIcon, WhatsappIcon, useDialogFocusTrap } from "@/components/salon/ui.jsx";
import { AUTH_CHANGE_EVENT, isSignedIn, signOut } from "@/api/auth.js";
import { brand, contact, nav } from "@/content/salon.js";
import { cn } from "@/lib/utils";

function useAuthStatus() {
  const [signedIn, setSignedIn] = useState(isSignedIn);
  useEffect(() => {
    const sync = () => setSignedIn(isSignedIn());
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return signedIn;
}

function ProfileStatusIcon({ signedIn, className }) {
  const Icon = signedIn ? UserCheck : User;
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Icon className={cn("size-4", signedIn ? "text-forest-700" : "text-brass-600")} aria-hidden />
      <span
        aria-hidden
        className={cn(
          "absolute -end-1 -top-1 size-2 rounded-full border border-ivory-50",
          signedIn ? "bg-forest-500" : "bg-neutral-400",
        )}
      />
    </span>
  );
}

const HIDE_STICKY = /^\/(book|bookings|salon)(\/|$)/;

function MobileMenu({ open, onClose, signedIn }) {
  const panelRef = useRef(null);
  useDialogFocusTrap(open, panelRef, onClose);
  if (!open) return null;
  return (
    <div id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" aria-label="منوی اصلی" className="forest-canvas fixed inset-0 z-50 flex flex-col text-ivory-50 lg:hidden page-enter">
      <div className="flex h-20 items-center justify-between border-b border-ivory-50/10 px-5">
        <Wordmark tone="light" subtitle />
        <button type="button" onClick={onClose} aria-label="بستن منو" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/25 text-ivory-50 hover:border-brass-300 hover:text-brass-300">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <nav aria-label="پیمایش اصلی" className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
        <ul className="divide-y divide-ivory-50/10">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center justify-between py-4 text-xl font-bold transition-colors",
                    isActive ? "text-brass-300" : "text-ivory-50 hover:text-brass-200",
                  )
                }
              >
                <span>{item.label}</span>
                <ArrowLeft className="size-4 text-brass-400/70 transition-transform group-hover:scale-110" aria-hidden />
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-8 space-y-3">
          <Btn to="/profile" variant="outlineLight" size="lg" className="w-full" onClick={onClose}>
            <ProfileStatusIcon signedIn={signedIn} />
            <span>مشاهده پروفایل</span>
            <span className="text-xs text-ivory-200/80">({signedIn ? "واردشده" : "مهمان"})</span>
          </Btn>
          <Btn to="/book" variant="brass" size="lg" className="w-full" onClick={onClose}>
            <CalendarPlus className="size-5" aria-hidden /> رزرو نوبت آنلاین
          </Btn>
          <Btn href={`tel:${contact.phone}`} variant="outlineLight" size="lg" className="w-full">
            <Phone className="size-5" aria-hidden /> تماس: <span dir="ltr" className="num">{contact.phoneDisplay}</span>
          </Btn>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-ivory-300/80">
          <Clock className="size-3.5 text-brass-400" aria-hidden /> شنبه تا پنج‌شنبه، ۱۰:۰۰ تا ۲۱:۰۰ · {brand.city}
        </p>
      </nav>
    </div>
  );
}

function ProfileMenu({ signedIn }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    if (busy || !signedIn) return;
    setBusy(true);
    await signOut();
    setBusy(false);
    setOpen(false);
    navigate("/");
  }

  if (!signedIn) {
    return (
      <Link
        to="/profile"
        aria-label="ورود به حساب کاربری"
        title="ورود به حساب کاربری"
        className="btn-press grid size-11 place-items-center rounded-full border border-ivory-300 bg-ivory-50/90 text-forest-900 transition-colors hover:border-brass-500"
      >
        <ProfileStatusIcon signedIn={false} />
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی حساب کاربری (واردشده)"
        title="واردشده"
        className="btn-press grid size-11 place-items-center rounded-full border border-ivory-300 bg-ivory-50/90 text-forest-900 transition-colors hover:border-brass-500"
      >
        <ProfileStatusIcon signedIn />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="حساب کاربری"
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-48 rounded-[1.25rem] border border-ivory-300 bg-ivory-50 p-2 shadow-[0_18px_40px_-18px_rgb(15_32_25/0.25)]"
        >
          <div className="mb-1 border-b border-ivory-200 px-3 py-2 text-xs font-semibold text-neutral-600">
            وضعیت: <span className="text-forest-900">واردشده</span>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-bold text-forest-900 transition-colors hover:bg-ivory-200/70"
          >
            <User className="size-4 text-brass-600" aria-hidden />
            <span>پروفایل</span>
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-start text-sm font-bold text-danger-700 transition-colors hover:bg-danger-50"
          >
            <LogOut className="size-4" aria-hidden />
            <span>{busy ? "در حال خروج…" : "خروج"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useAuthStatus();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-b border-ivory-300/90 bg-ivory-100/[0.92] shadow-[0_12px_32px_-20px_rgb(15_32_25/0.35)] backdrop-blur-md"
          : "border-b border-ivory-300/40 bg-ivory-100/80 backdrop-blur-sm",
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link to="/" aria-label={`${brand.name}، صفحه اصلی`} className="shrink-0 rounded-xl py-1">
          <Wordmark subtitle />
        </Link>
        <nav aria-label="پیمایش اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1.5">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "nav-link relative rounded-full px-3 py-2 text-[0.9rem] font-semibold transition-colors xl:px-3.5",
                      isActive
                        ? "bg-forest-900/[0.06] text-forest-900 after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brass-500"
                        : "text-neutral-700 hover:bg-ivory-200/70 hover:text-forest-900",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2.5">
          <ProfileMenu signedIn={signedIn} />
          {/* Shown only at lg+ so sm..lg does not duplicate StickyBook */}
          <Btn to="/book" size="sm" className="hidden lg:inline-flex lg:h-11 lg:px-6">
            <CalendarPlus className="size-4" aria-hidden /> رزرو نوبت
          </Btn>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="btn-press grid size-11 place-items-center rounded-full border border-forest-700/25 bg-ivory-50 text-forest-900 hover:border-forest-700 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </Container>
      <MobileMenu open={open} onClose={() => setOpen(false)} signedIn={signedIn} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="forest-canvas relative mt-[var(--space-section)] border-t border-brass-500/25 pb-24 text-ivory-200 lg:pb-0">
      <div aria-hidden className="hairline" />
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1.05fr_1.2fr] lg:py-20">
        <div>
          <Wordmark tone="light" subtitle />
          <p className="mt-6 font-[var(--font-display)] text-3xl text-brass-300">{brand.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-8 text-ivory-200/85">{brand.description}</p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">دسترسی سریع</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="inline-block py-0.5 text-ivory-200/90 transition-colors hover:text-brass-300">{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/book" className="inline-flex items-center gap-1.5 pt-1 font-bold text-brass-300 hover:text-brass-200">
                رزرو نوبت آنلاین <ArrowLeft className="size-3.5" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">ساعت کاری و نشانی</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <Clock className="mt-1 size-4 shrink-0 text-brass-400" aria-hidden />
              <span>شنبه تا پنج‌شنبه، <span className="num font-semibold text-ivory-50">۱۰:۰۰ تا ۲۱:۰۰</span></span>
            </li>
            <li className="ps-6 text-ivory-300/85">جمعه‌ها با هماهنگی قبلی (پکیج داماد)</li>
          </ul>
          <p className="mt-6 flex items-start gap-2.5 text-sm leading-7 text-ivory-200/90">
            <MapPin className="mt-1 size-4 shrink-0 text-brass-400" aria-hidden /> {contact.addressShort}
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">ارتباط مستقیم</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2.5 rounded-lg py-0.5 hover:text-brass-300">
                <Phone className="size-4 text-brass-400" aria-hidden />
                <span dir="ltr" className="num font-semibold text-ivory-50">{contact.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${contact.mobile}`} className="inline-flex items-center gap-2.5 rounded-lg py-0.5 hover:text-brass-300">
                <Phone className="size-4 text-brass-400" aria-hidden />
                <span dir="ltr" className="num font-semibold text-ivory-50">{contact.mobileDisplay}</span>
              </a>
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            {contact.instagram ? (
              <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 bg-ivory-50/5 hover:border-brass-300 hover:text-brass-300">
                <InstagramIcon />
              </a>
            ) : null}
            {contact.telegram ? (
              <a href={`https://t.me/${contact.telegram}`} target="_blank" rel="noopener noreferrer" aria-label="تلگرام خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 bg-ivory-50/5 hover:border-brass-300 hover:text-brass-300">
                <TelegramIcon />
              </a>
            ) : null}
            {contact.whatsapp ? (
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="واتس‌اپ خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 bg-ivory-50/5 hover:border-brass-300 hover:text-brass-300">
                <WhatsappIcon />
              </a>
            ) : null}
          </div>
        </div>
      </Container>
      <div className="border-t border-ivory-50/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-ivory-300/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {brand.name}، {brand.city}. همه حقوق محفوظ است.
            <Link to="/salon/appointments" className="ms-3 text-ivory-300/70 underline decoration-brass-500/50 underline-offset-4 hover:text-brass-300">پنل مدیریت نوبت‌ها</Link>
          </p>
          <p>
            تصاویر منتخب از{" "}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline decoration-brass-500/60 underline-offset-4 hover:text-brass-300">Pexels</a>
          </p>
        </Container>
      </div>
    </footer>
  );
}

/** Persistent booking action on mobile & tablet (<lg). */
function StickyBook() {
  const { pathname } = useLocation();
  if (HIDE_STICKY.test(pathname)) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory-300 bg-ivory-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-15px_rgb(15_32_25/0.2)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Btn to="/book" size="md" className="flex-1">
          <CalendarPlus className="size-5" aria-hidden /> رزرو نوبت آنلاین
        </Btn>
        <a href={`tel:${contact.phone}`} aria-label="تماس با استودیو" className="btn-press grid size-12 shrink-0 place-items-center rounded-full border border-forest-700/35 bg-ivory-100 text-forest-900">
          <Phone className="size-5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="heritage-canvas flex min-h-screen flex-col bg-ivory-100 text-charcoal-900">
      <a href="#main" className="skip-link">پرش به محتوای اصلی</a>
      <Header />
      <main id="main" key={pathname} tabIndex={-1} className="page-enter flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
      <StickyBook />
    </div>
  );
}
