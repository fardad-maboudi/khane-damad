import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star, AlertTriangle, Loader2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { pexelsUrl } from "@/content/salon.js";

export function Container({ className, children }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

/**
 * Reusable accessible focus trap + focus restoration hook for dialogs, lightboxes, and menus.
 */
export function useDialogFocusTrap(active, containerRef, onClose) {
  useEffect(() => {
    if (!active) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () => {
      if (!containerRef.current) return [];
      return [...containerRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    };

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
      else containerRef.current?.focus();
    }, 10);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) {
          event.preventDefault();
          return;
        }
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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, onClose]);
}

/** Fades/slides a block in once, when it first enters the viewport. */
export function Reveal({ children, delay = 0, className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === "undefined" || (typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)),
  );
  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);
  return (
    <div ref={ref} className={cn("reveal", shown && "is-in", className)} style={{ "--reveal-delay": `${delay}ms` }}>
      {children}
    </div>
  );
}

/**
 * Responsive photo with a reserved aspect box (no layout shift) and a soft fade
 * once decoded. Pass a Pexels `id` or a full `src`.
 */
export function Photo({ id, src, alt, ratio = "4 / 5", sizes = "(min-width: 1024px) 33vw, 90vw", priority = false, className, imgClassName, width, height }) {
  const [loaded, setLoaded] = useState(false);
  const ref = (node) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  };
  const widths = [480, 800, 1200];
  const url = id ? (w) => pexelsUrl(id, w) : null;
  const finalSrc = id ? url(800) : src;
  const srcSet = id ? widths.map((w) => `${url(w)} ${w}w`).join(", ") : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-ivory-200", className)} style={{ aspectRatio: ratio }}>
      <img
        ref={ref}
        src={finalSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt ?? ""}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn("img-fade absolute inset-0 h-full w-full object-cover", loaded && "is-loaded", imgClassName)}
      />
    </div>
  );
}

const BTN_BASE =
  "btn-press inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SIZE = { md: "h-12 px-7 text-[0.95rem]", lg: "h-14 px-9 text-base", sm: "h-11 px-5 text-sm" };
const BTN_VARIANT = {
  primary: "btn-fill bg-forest-800 text-ivory-50 hover:text-charcoal-900 shadow-[0_10px_24px_-10px_rgb(15_32_25/0.65)]",
  brass: "bg-brass-400 text-charcoal-900 hover:bg-brass-300 shadow-[0_10px_24px_-10px_rgb(176_141_87/0.45)]",
  outline: "border border-forest-700/35 bg-ivory-50/50 text-forest-900 hover:bg-forest-800 hover:text-ivory-50 hover:border-forest-800",
  ghost: "text-forest-800 hover:bg-forest-700/10",
  light: "bg-ivory-50 text-forest-900 hover:bg-ivory-100",
  outlineLight: "border border-ivory-50/35 text-ivory-50 hover:bg-ivory-50/12 hover:border-brass-300",
  danger: "bg-danger-600 text-ivory-50 hover:bg-danger-800",
};

function btnClass({ variant = "primary", size = "md", className } = {}) {
  return cn(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className);
}

/** Router link, external anchor or <button>, all styled as the same button. */
export function Btn({ to, href, variant, size, className, children, ...rest }) {
  const classes = btnClass({ variant, size, className });
  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>;
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return <button type="button" className={classes} {...rest}>{children}</button>;
}

/**
 * Editorial Section Heading with optional eyebrow badge and configurable heading level (`as`).
 * Fixes invalid nested <h2><h1> markup on subpages!
 */
export function SectionHeading({ eyebrow, title, lead, as: Tag = "h2", id, align = "start", tone = "dark", size = "md", className }) {
  const light = tone === "light";
  const centered = align === "center";
  const titleSize = size === "xl" ? "text-4xl sm:text-5xl lg:text-[3.35rem]" : "text-3xl sm:text-4xl";
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("mb-3 inline-flex items-center gap-2.5 text-xs font-bold tracking-normal", light ? "text-brass-300" : "text-brass-700")}>
          <span aria-hidden className="size-1.5 rounded-full bg-brass-500" />
          {eyebrow}
        </p>
      ) : null}
      <Tag id={id} className={cn("font-extrabold leading-[1.35]", titleSize, light ? "text-ivory-50" : "text-forest-900")}>
        {title}
      </Tag>
      {lead ? <p className={cn("mt-4 text-base leading-8 sm:text-lg", light ? "text-ivory-200/90" : "text-neutral-700")}>{lead}</p> : null}
    </div>
  );
}

/** Subtle brass emblem divider between major sections */
export function BrassDivider({ className }) {
  return (
    <div aria-hidden className={cn("flex items-center justify-center gap-4 py-2", className)}>
      <span className="h-px w-16 bg-gradient-to-l from-brass-500/60 to-transparent sm:w-28" />
      <span className="size-2 rotate-45 border border-brass-500 bg-ivory-100" />
      <span className="h-px w-16 bg-gradient-to-r from-brass-500/60 to-transparent sm:w-28" />
    </div>
  );
}

export function Stars({ value = 5, size = 16, className }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`امتیاز ${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} width={size} height={size} aria-hidden className={n <= Math.round(value) ? "fill-brass-500 text-brass-500" : "text-brass-300"} />
      ))}
    </span>
  );
}

export function Spinner({ label = "در حال بارگذاری…", className }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-3 py-12 text-neutral-700", className)}>
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none text-brass-600" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action, className }) {
  return (
    <div className={cn("rounded-3xl border border-dashed border-brass-400/70 bg-ivory-50 px-6 py-12 text-center", className)}>
      <h3 className="text-lg font-bold text-forest-900">{title}</h3>
      {text ? <p className="mx-auto mt-2 max-w-md leading-8 text-neutral-700">{text}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "مشکلی پیش آمد", text, onRetry, className }) {
  return (
    <div role="alert" className={cn("rounded-3xl border border-danger-600/30 bg-danger-50 px-6 py-8 text-center", className)}>
      <AlertTriangle className="mx-auto size-6 text-danger-600" aria-hidden />
      <h3 className="mt-3 text-lg font-bold text-danger-900">{title}</h3>
      {text ? <p className="mx-auto mt-1 max-w-md text-danger-900">{text}</p> : null}
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <Btn variant="outline" size="sm" onClick={onRetry}>تلاش دوباره</Btn>
        </div>
      ) : null}
    </div>
  );
}

/** Wordmark: bespoke double-ring brass seal + calligraphic name + Lahijan subtitle. */
export function Wordmark({ tone = "dark", subtitle = false, className }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg viewBox="0 0 44 44" width="40" height="40" aria-hidden className="shrink-0">
        <circle cx="22" cy="22" r="20" fill={light ? "rgb(252 250 245 / 0.05)" : "rgb(29 61 48 / 0.05)"} stroke="var(--color-brass-500)" strokeWidth="1.35" />
        <circle cx="22" cy="22" r="16.5" fill="none" stroke="var(--color-brass-400)" strokeWidth="0.7" strokeDasharray="2 2.5" opacity="0.75" />
        <path d="M14.5 28.5 L29.5 15.5 M14.5 15.5 L29.5 28.5" stroke={light ? "var(--color-ivory-100)" : "var(--color-forest-800)"} strokeWidth="2" strokeLinecap="round" />
        <circle cx="13.5" cy="30" r="2.6" fill="none" stroke="var(--color-brass-400)" strokeWidth="1.5" />
        <circle cx="13.5" cy="14" r="2.6" fill="none" stroke="var(--color-brass-400)" strokeWidth="1.5" />
      </svg>
      <span className="flex flex-col">
        <span className={cn("font-[var(--font-display)] text-[1.75rem] leading-none", light ? "text-ivory-50" : "text-forest-900")}>خانه داماد</span>
        {subtitle ? (
          <span className={cn("mt-1.5 text-[0.68rem] font-semibold", light ? "text-brass-300" : "text-brass-700")}>استودیو پیرایش مردانه · لاهیجان</span>
        ) : null}
      </span>
    </span>
  );
}

export const WhatsappIcon = (props) => <MessageCircle width={20} height={20} aria-hidden {...props} />;

export const TelegramIcon = (props) => <Send width={20} height={20} aria-hidden {...props} />;

export const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
