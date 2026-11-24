import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, MapPin, Clock, CalendarPlus, ArrowLeft } from "lucide-react";
import { Btn, Container, Wordmark, InstagramIcon, TelegramIcon, WhatsappIcon, useDialogFocusTrap } from "@/components/salon/ui.jsx";
import { brand, contact, nav } from "@/content/salon.js";
import { cn } from "@/lib/utils";

const HIDE_STICKY = /^\/(book|bookings|salon)(\/|$)/;

function MobileMenu({ open, onClose }) {
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

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
          ? "border-b border-ivory-300/90 bg-ivory-100/92 shadow-[0_12px_32px_-20px_rgb(15_32_25/0.35)] backdrop-blur-md"
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
                      "relative rounded-full px-3 py-2 text-[0.9rem] font-semibold transition-colors xl:px-3.5",
                      isActive
                        ? "bg-forest-900/6 text-forest-900 after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brass-500"
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
        <div className="flex items-center gap-3">
          <a
            href={`tel:${contact.phone}`}
            aria-label={`تماس تلفنی: ${contact.phoneDisplay}`}
            className="hidden items-center gap-2 rounded-full border border-ivory-300 bg-ivory-50/80 px-3.5 py-2 text-xs font-bold text-forest-900 transition-colors hover:border-brass-500 xl:inline-flex"
          >
            <Phone className="size-3.5 text-brass-600" aria-hidden />
            <span dir="ltr" className="num">{contact.phoneDisplay}</span>
          </a>
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
      <MobileMenu open={open} onClose={() => setOpen(false)} />
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
