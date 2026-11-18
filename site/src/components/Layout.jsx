import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, MapPin, Clock, CalendarPlus } from "lucide-react";
import { Btn, Container, Wordmark, InstagramIcon, TelegramIcon, WhatsappIcon } from "@/components/salon/ui.jsx";
import { brand, contact, nav } from "@/content/salon.js";
import { cn } from "@/lib/utils";

const HIDE_STICKY = /^\/(book|salon)(\/|$)/;

function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

function MobileMenu({ open, onClose }) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll("a[href],button:not([disabled])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" aria-label="منوی اصلی" className="fixed inset-0 z-50 flex flex-col bg-forest-900 text-ivory-50 lg:hidden page-enter">
      <div className="flex h-[4.5rem] items-center justify-between px-5">
        <Wordmark tone="light" />
        <button type="button" onClick={onClose} aria-label="بستن منو" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/25">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <nav aria-label="پیمایش اصلی" className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <ul className="divide-y divide-ivory-50/10">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) => cn("flex items-center justify-between py-4 text-xl font-semibold", isActive ? "text-brass-300" : "text-ivory-50")}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-8 space-y-3">
          <Btn to="/book" variant="brass" size="lg" className="w-full" onClick={onClose}>
            <CalendarPlus className="size-5" aria-hidden /> رزرو نوبت
          </Btn>
          <Btn href={`tel:${contact.phone}`} variant="outlineLight" size="lg" className="w-full">
            <Phone className="size-5" aria-hidden /> تماس: {contact.phoneDisplay}
          </Btn>
        </div>
      </nav>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={cn("sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300", scrolled ? "bg-ivory-100/92 shadow-[0_1px_0_0_var(--color-ivory-300)] backdrop-blur-md" : "bg-ivory-100")}>
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <Link to="/" aria-label={`${brand.name}، صفحه اصلی`} className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="پیمایش اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors",
                      isActive ? "text-forest-900 after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brass-500" : "text-neutral-700 hover:text-forest-800",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Btn to="/book" size="sm" className="hidden sm:inline-flex lg:h-11 lg:px-6">
            رزرو نوبت
          </Btn>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-11 place-items-center rounded-full border border-forest-700/25 text-forest-800 lg:hidden"
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
    <footer className="mt-[var(--space-section)] bg-forest-900 pb-24 text-ivory-200 lg:pb-0">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Wordmark tone="light" />
          <p className="mt-5 font-[var(--font-display)] text-2xl text-brass-300">{brand.tagline}</p>
          <p className="mt-3 max-w-xs text-sm leading-7 text-ivory-300">{brand.description}</p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">دسترسی سریع</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-brass-300">{item.label}</Link>
              </li>
            ))}
            <li><Link to="/book" className="font-semibold text-brass-300 hover:text-brass-200">رزرو نوبت آنلاین</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">ساعت کاری</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-brass-400" aria-hidden /> شنبه تا پنج‌شنبه، ۱۰:۰۰ تا ۲۱:۰۰</li>
            <li className="ps-6 text-ivory-300">جمعه‌ها با هماهنگی قبلی</li>
          </ul>
          <p className="mt-6 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brass-400" aria-hidden /> {contact.addressShort}
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ivory-50">ارتباط با ما</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-brass-300"><Phone className="size-4 text-brass-400" aria-hidden /> <span dir="ltr" className="num">{contact.phoneDisplay}</span></a></li>
            <li><a href={`tel:${contact.mobile}`} className="flex items-center gap-2 hover:text-brass-300"><Phone className="size-4 text-brass-400" aria-hidden /> <span dir="ltr" className="num">{contact.mobileDisplay}</span></a></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            {contact.instagram ? <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 hover:border-brass-300 hover:text-brass-300"><InstagramIcon /></a> : null}
            {contact.telegram ? <a href={`https://t.me/${contact.telegram}`} target="_blank" rel="noopener noreferrer" aria-label="تلگرام خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 hover:border-brass-300 hover:text-brass-300"><TelegramIcon /></a> : null}
            {contact.whatsapp ? <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="واتس‌اپ خانه داماد" className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/20 hover:border-brass-300 hover:text-brass-300"><WhatsappIcon /></a> : null}
          </div>
        </div>
      </Container>
      <div className="border-t border-ivory-50/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-ivory-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {brand.name}، {brand.city}. همه حقوق محفوظ است. <Link to="/salon/appointments" className="ms-3 underline decoration-brass-500/60 underline-offset-4 hover:text-brass-300">ورود مدیر</Link></p>
          <p>
            تصاویر از{" "}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline decoration-brass-500 underline-offset-4 hover:text-brass-300">Pexels</a>
            {" "}با مجوز آزاد
          </p>
        </Container>
      </div>
    </footer>
  );
}

/** Persistent booking action on mobile. */
function StickyBook() {
  const { pathname } = useLocation();
  if (HIDE_STICKY.test(pathname)) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory-300 bg-ivory-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Btn to="/book" size="md" className="flex-1">
          <CalendarPlus className="size-5" aria-hidden /> رزرو نوبت
        </Btn>
        <a href={`tel:${contact.phone}`} aria-label="تماس با استودیو" className="btn-press grid size-12 shrink-0 place-items-center rounded-full border border-forest-700/35 text-forest-800">
          <Phone className="size-5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col bg-ivory-100 text-charcoal-900">
      <a href="#main" className="skip-link">پرش به محتوای اصلی</a>
      <Header />
      <main id="main" key={pathname} tabIndex={-1} className="page-enter flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <StickyBook />
    </div>
  );
}
