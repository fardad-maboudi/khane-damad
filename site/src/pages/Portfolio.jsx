import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, useDialogFocusTrap } from "@/components/salon/ui.jsx";
import { FinalCta, PortfolioTile } from "@/components/salon/sections.jsx";
import { PortfolioHero } from "@/components/salon/heroes.jsx";
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
      className="lightbox-enter fixed inset-0 z-50 flex flex-col bg-forest-950/[0.96] text-ivory-50 backdrop-blur-md"
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
          className="lightbox-figure max-h-full max-w-full rounded-2xl border border-ivory-50/15 object-contain shadow-2xl"
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

  /**
   * Editorial 12-column mosaic. On desktop every row carries tiles of different widths
   * (5 / 4 / 3 of 12 columns) and the widths mirror on alternating rows, so the wall
   * reads like a magazine spread rather than an even grid. Whatever the filter leaves
   * behind, the closing rows are regrouped into 7+5 / 5+7 pairs so the mosaic always
   * adds up to a full 12 columns and never leaves a hole.
   */
  const tileSpan = (index, total) => {
    if (total === 1) return "lg:col-span-12";
    if (total === 2) return index === 0 ? "lg:col-span-7" : "lg:col-span-5";

    const tailPair = ["lg:col-span-7", "lg:col-span-5"];
    const remainder = total % 3;
    if (remainder === 2 && index >= total - 2) return tailPair[index - (total - 2)];
    if (remainder === 1 && index >= total - 4) {
      return ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"][index - (total - 4)];
    }

    const row = Math.floor(index / 3);
    const pattern =
      row % 2 === 0
        ? ["lg:col-span-5", "lg:col-span-4", "lg:col-span-3"]
        : ["lg:col-span-3", "lg:col-span-4", "lg:col-span-5"];
    return pattern[index % 3];
  };

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
      <PortfolioHero count={portfolio.length}>
        <div role="group" aria-label="فیلتر دسته‌بندی" className="flex flex-wrap gap-2.5">
          {portfolioCategories.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.key)}
                className={cn(
                  "btn-press rounded-full border px-4 py-2 text-[0.8rem] font-bold transition-colors duration-200",
                  active
                    ? "border-brass-400 bg-brass-400 text-charcoal-900"
                    : "border-ivory-50/20 bg-ivory-50/5 text-ivory-100 hover:border-brass-300/70 hover:bg-ivory-50/10",
                )}
              >
                {c.label}
                <span className={cn("num ms-1.5 text-[0.7rem]", active ? "text-charcoal-800/80" : "text-brass-300")}>
                  {toFa(countsByCategory[c.key] ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </PortfolioHero>

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
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:auto-rows-[23rem] lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={cn("relative aspect-[4/5] lg:aspect-auto", tileSpan(index, items.length))}
              >
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
