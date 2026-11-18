import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star, AlertTriangle, Loader2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { pexelsUrl } from "@/content/salon.js";

export function Container({ className, children }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
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
        alt={alt || ""}
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
  "btn-press inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SIZE = { md: "h-12 px-7 text-[0.95rem]", lg: "h-14 px-9 text-base", sm: "h-11 px-5 text-sm" };
const BTN_VARIANT = {
  primary: "btn-fill bg-forest-700 text-ivory-50 hover:text-charcoal-900 shadow-[0_8px_20px_-8px_rgb(15_32_25/0.6)]",
  brass: "bg-brass-500 text-charcoal-900 hover:bg-brass-400",
  outline: "border border-forest-700/40 text-forest-800 hover:bg-forest-700/8 hover:border-forest-700",
  ghost: "text-forest-800 hover:bg-forest-700/8",
  light: "bg-ivory-50 text-forest-800 hover:bg-white",
  outlineLight: "border border-ivory-50/40 text-ivory-50 hover:bg-ivory-50/10",
  danger: "bg-[#8a2a22] text-ivory-50 hover:bg-[#702019]",
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

export function SectionHeading({ title, lead, align = "start", tone = "dark", className }) {
  const light = tone === "light";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <h2 className={cn("text-3xl font-bold leading-[1.4] sm:text-4xl", light ? "text-ivory-50" : "text-forest-900")}>{title}</h2>
      {lead ? <p className={cn("mt-4 text-base leading-8 sm:text-lg", light ? "text-ivory-200" : "text-neutral-700")}>{lead}</p> : null}
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
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action, className }) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-brass-400/70 bg-ivory-50 px-6 py-12 text-center", className)}>
      <h3 className="text-lg font-bold text-forest-900">{title}</h3>
      {text ? <p className="mx-auto mt-2 max-w-md text-neutral-700">{text}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "مشکلی پیش آمد", text, onRetry, className }) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-[#8a2a22]/30 bg-[#fbeeea] px-6 py-8 text-center", className)}>
      <AlertTriangle className="mx-auto size-6 text-[#8a2a22]" aria-hidden />
      <h3 className="mt-3 text-lg font-bold text-[#5c1b16]">{title}</h3>
      {text ? <p className="mx-auto mt-1 max-w-md text-[#5c1b16]">{text}</p> : null}
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <Btn variant="outline" size="sm" onClick={onRetry}>تلاش دوباره</Btn>
        </div>
      ) : null}
    </div>
  );
}

/** Wordmark: brass seal + calligraphic name. */
export function Wordmark({ tone = "dark", className }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden className="shrink-0">
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="var(--color-brass-500)" strokeWidth="1.4" />
        <path d="M13 26 L27 14 M13 14 L27 26" stroke={light ? "var(--color-ivory-100)" : "var(--color-forest-800)"} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="27.5" r="2.6" fill="none" stroke="var(--color-brass-500)" strokeWidth="1.5" />
        <circle cx="12" cy="12.5" r="2.6" fill="none" stroke="var(--color-brass-500)" strokeWidth="1.5" />
      </svg>
      <span className={cn("font-[var(--font-display)] text-[1.7rem] leading-none", light ? "text-ivory-50" : "text-forest-800")}>خانه داماد</span>
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
