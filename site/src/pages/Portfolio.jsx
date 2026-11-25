import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, useDialogFocusTrap } from "@/components/salon/ui.jsx";
import { FinalCta, PageHero, PortfolioTile } from "@/components/salon/sections.jsx";
import { pexelsUrl, portfolio, portfolioCategories } from "@/content/salon.js";
import { toFa } from "@/lib/fa.js";
import { cn } from "@/lib/utils";

function Viewer({ items, activeId, onClose, onSelectId }) {
  const dialogRef = useRef(null);
  const index = Math.max(0, items.findIndex((p) => p.id === activeId));
  const item = items[index] ?? items[0];

  useDialogFocusTrap(Boolean(item), dialogRef, onClose);

  const prev = useCallback(() => {
    if (!items.length) return;
    const nextIdx = (index - 1 + items.length) % items.length;
    onSelectId(items[nextIdx].id);
  }, [index, items, onSelectId]);

  const next = useCallback(() => {
    if (!items.length) return;
    const nextIdx = (index + 1) % items.length;
    onSelectId(items[nextIdx].id);
  }, [index, items, onSelectId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!item) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex flex-col bg-forest-950/95 text-ivory-50 backdrop-blur-md page-enter"
      onClick={onClose}
    >
      <div className="flex items-center justify-between border-b border-ivory-50/10 px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="font-bold text-ivory-50">{item.title}</p>
          <p className="mt-0.5 text-xs text-brass-300 num">
            تصویر {toFa(index + 1)} از {toFa(items.length)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن نمایشگر تصویر"
          className="btn-press grid size-11 place-items-center rounded-full border border-ivory-50/30 text-ivory-50 hover:border-brass-300 hover:text-brass-300"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4 sm:px-20" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={prev}
          aria-label="تصویر قبلی"
          className="btn-press absolute end-2 z-10 grid size-12 place-items-center rounded-full border border-ivory-50/25 bg-forest-900/80 text-ivory-50 hover:border-brass-300 sm:end-6"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <img
          key={item.id}
          src={pexelsUrl(item.id, 1200)}
          alt={item.alt}
          className="img-fade is-loaded max-h-full max-w-full rounded-2xl border border-ivory-50/15 object-contain shadow-2xl"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        />
        <button
          type="button"
          onClick={next}
          aria-label="تصویر بعدی"
          className="btn-press absolute start-2 z-10 grid size-12 place-items-center rounded-full border border-ivory-50/25 bg-forest-900/80 text-ivory-50 hover:border-brass-300 sm:start-6"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-ivory-50/10 px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <Btn to="/book" variant="brass" size="sm" onClick={onClose}>
          رزرو استایل مشابه <ArrowLeft className="size-4" aria-hidden />
        </Btn>
      </div>
    </div>,
    document.body,
  );
}

export default function Portfolio() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [activeId, setActiveId] = useState(() => {
    const wanted = Number(params.get("photo"));
    return wanted && portfolio.some((p) => p.id === wanted) ? wanted : null;
  });

  const items = useMemo(() => (category === "all" ? portfolio : portfolio.filter((p) => p.category === category)), [category]);

  const openPhoto = useCallback(
    (id) => {
      setActiveId(id);
      const next = new URLSearchParams(params);
      if (id) next.set("photo", String(id));
      else next.delete("photo");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const closeViewer = useCallback(() => openPhoto(null), [openPhoto]);

  const activeLabel =
    category === "all"
      ? "همه نمونه‌کارها"
      : portfolioCategories.find((c) => c.key === category)?.label ?? "نمونه‌کارها";

  const countsByCategory = useMemo(() => {
    const counts = { all: portfolio.length };
    for (const p of portfolio) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, []);

  // Ensure lightbox always operates on a valid array containing activeId
  const viewerItems = useMemo(() => {
    if (!activeId) return items;
    return items.some((p) => p.id === activeId) ? items : portfolio;
  }, [items, activeId]);

  return (
    <>
      <Seo
        title="نمونه‌کارها"
        description="گالری مدل مو، فرم ریش و تحول داماد در استودیو خانه داماد لاهیجان."
        image={pexelsUrl(portfolio[3].id, 1200)}
      />
      <PageHero
        eyebrow="آرشیو استودیو · نمونه‌کارها"
        title="گالری کات، ریش و تشریفات داماد"
        lead="با انتخاب دسته‌بندی مورد نظر، جزئیات هر استایل را ببینید و روی هر تصویر برای نمایش تمام‌صفحه بزنید."
      >
        <div role="group" aria-label="فیلتر دسته‌بندی" className="mt-8 flex flex-wrap gap-2.5">
          {portfolioCategories.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.key)}
                className={cn(
                  "btn-press rounded-full border px-5 py-2 text-sm font-bold transition-colors",
                  active
                    ? "border-brass-400 bg-brass-400 text-charcoal-900"
                    : "border-ivory-50/25 bg-ivory-50/10 text-ivory-50 hover:border-brass-300 hover:bg-ivory-50/20",
                )}
              >
                {c.label} <span className={cn("num ms-1 text-xs", active ? "text-charcoal-800" : "text-brass-300")}>({toFa(countsByCategory[c.key] ?? 0)})</span>
              </button>
            );
          })}
        </div>
      </PageHero>

      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ivory-300/80 pb-4">
            <p className="text-sm font-extrabold text-forest-900">
              {activeLabel} <span className="num ms-1 font-medium text-neutral-600">· {toFa(items.length)} تصویر</span>
            </p>
            <p className="hidden text-xs font-medium text-neutral-600 sm:block">
              برای دیدن اندازه کامل، روی هر تصویر بزنید
            </p>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-7 lg:grid-cols-3 lg:gap-9">
            {items.map((item) => (
              <li key={item.id} className="relative aspect-[4/5]">
                <PortfolioTile item={item} fill className="h-full" onOpen={(picked) => openPhoto(picked.id)} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-14 text-center">
          <Btn to="/book" size="lg">
            استایل دلخواهت را رزرو کن <ArrowLeft className="size-5" aria-hidden />
          </Btn>
        </div>
      </Container>

      {activeId !== null ? <Viewer items={viewerItems} activeId={activeId} onClose={closeViewer} onSelectId={openPhoto} /> : null}
      <FinalCta />
    </>
  );
}
