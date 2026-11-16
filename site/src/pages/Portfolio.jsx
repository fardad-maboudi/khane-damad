import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container } from "@/components/salon/ui.jsx";
import { FinalCta, PageHero, PortfolioTile } from "@/components/salon/sections.jsx";
import { pexelsUrl, portfolio, portfolioCategories } from "@/content/salon.js";
import { cn } from "@/lib/utils";

function Viewer({ items, index, onClose, onIndex }) {
  const item = items[index];
  const closeRef = useRef(null);
  const prev = useCallback(() => onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [onClose, next, prev]);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-50 flex flex-col bg-charcoal-900/95 text-ivory-50 page-enter" onClick={onClose}>
      <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold">{item.title}</p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="بستن" className="grid size-11 place-items-center rounded-full border border-ivory-50/30"><X className="size-5" aria-hidden /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={prev} aria-label="تصویر قبلی" className="absolute end-1 z-10 grid size-11 place-items-center rounded-full bg-charcoal-900/70 sm:end-4"><ChevronRight className="size-5" aria-hidden /></button>
        <img key={item.id} src={pexelsUrl(item.id, 1200)} alt={item.alt} className="img-fade is-loaded max-h-full max-w-full rounded-xl object-contain" style={{ aspectRatio: `${item.width} / ${item.height}` }} />
        <button type="button" onClick={next} aria-label="تصویر بعدی" className="absolute start-1 z-10 grid size-11 place-items-center rounded-full bg-charcoal-900/70 sm:start-4"><ChevronLeft className="size-5" aria-hidden /></button>
      </div>
      <p className="pb-4 text-center text-sm text-ivory-300 num" onClick={(e) => e.stopPropagation()}>{(index + 1).toLocaleString("fa-IR")} از {items.length.toLocaleString("fa-IR")}</p>
    </div>,
    document.body,
  );
}

export default function Portfolio() {
  const [params] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(() => {
    const wanted = Number(params.get("photo"));
    const index = wanted ? portfolio.findIndex((p) => p.id === wanted) : -1;
    return index >= 0 ? index : null;
  });
  const items = useMemo(() => (category === "all" ? portfolio : portfolio.filter((p) => p.category === category)), [category]);
  const openItem = (item) => setOpen(items.findIndex((p) => p.id === item.id));
  return (
    <>
      <Seo title="نمونه‌کارها" description="گالری مدل مو، فرم ریش و تحول داماد در استودیو خانه داماد لاهیجان." image={pexelsUrl(portfolio[3].id, 1200)} />
      <PageHero title="گالری کات، ریش و تحول داماد" lead="با فیلتر دسته‌بندی، مدل دلخواه را پیدا کنید و روی هر تصویر برای نمای بزرگ‌تر بزنید." />
      <Container className="py-12">
        <div role="group" aria-label="فیلتر دسته‌بندی" className="mb-8 flex flex-wrap gap-2">
          {portfolioCategories.map((c) => (
            <button key={c.key} type="button" aria-pressed={category === c.key} onClick={() => setCategory(c.key)} className={cn("btn-press rounded-full border px-5 py-2 text-sm font-semibold transition-colors", category === c.key ? "border-forest-700 bg-forest-700 text-ivory-50" : "border-forest-700/30 text-forest-800 hover:bg-forest-50")}>{c.label}</button>
          ))}
        </div>
        <ul className="columns-2 gap-3 sm:gap-5 lg:columns-3 [&>li]:mb-3 sm:[&>li]:mb-5 [&>li]:break-inside-avoid">
          {items.map((item) => (<li key={item.id}><PortfolioTile item={item} onOpen={openItem} /></li>))}
        </ul>
        <div className="mt-10 text-center"><Btn to="/book" size="lg">استایل دلخواهت را رزرو کن</Btn></div>
      </Container>
      {open !== null && items[open] ? <Viewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} /> : null}
      <FinalCta />
    </>
  );
}
