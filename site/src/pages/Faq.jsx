import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Btn, Container, Reveal } from "@/components/salon/ui.jsx";
import { FinalCta } from "@/components/salon/sections.jsx";
import { FaqHero } from "@/components/salon/heroes.jsx";
import { faq } from "@/content/salon.js";
import { cn } from "@/lib/utils";

export default function Faq() {
  const [open, setOpen] = useState(0);
  const groups = [...new Set(faq.map((f) => f.group))];
  return (
    <>
      <Seo
        title="سوالات متداول"
        description="پاسخ پرسش‌های رایج درباره رزرو نوبت، لغو، تأخیر، پکیج داماد و آماده‌سازی قبل از مراجعه."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <FaqHero groups={groups} />
      <Container className="max-w-3xl py-14 sm:py-16">
        {groups.map((g, gi) => (
          <Reveal as="section" key={g} delay={gi * 60} id={`faq-${g}`} className="mb-10 scroll-mt-24" aria-label={g}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-forest-900">
              <span aria-hidden className="size-2 rotate-45 bg-brass-500" />
              {g}
            </h2>
            <div className="divide-y divide-ivory-200 overflow-hidden rounded-[1.5rem] border border-ivory-300 bg-ivory-50">
              {faq.map((f, i) =>
                f.group !== g ? null : (
                  <div key={f.q} className={cn("transition-colors", open === i && "bg-ivory-100/60")}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open === i}
                        aria-controls={`faq-${i}`}
                        id={`faq-b-${i}`}
                        onClick={() => setOpen(open === i ? -1 : i)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-start font-bold text-forest-900 transition-colors duration-200 hover:bg-ivory-100/60 hover:text-forest-700 sm:px-6"
                      >
                        <span>{f.q}</span>
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border transition-colors", open === i ? "border-brass-500 bg-brass-200/60 text-forest-900" : "border-ivory-300 text-brass-600")}>
                          <ChevronDown className={cn("size-4 transition-transform duration-300", open === i && "rotate-180")} aria-hidden />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-${i}`}
                      role="region"
                      aria-labelledby={`faq-b-${i}`}
                      aria-hidden={open !== i}
                      className={cn("accordion-panel", open === i && "is-open")}
                    >
                      <div className="accordion-inner">
                        <p className="px-5 pb-5 sm:px-6 leading-8 text-neutral-700">{f.a}</p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </Reveal>
        ))}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-brass-400/50 bg-ivory-50 p-6">
          <div className="flex items-center gap-3">
            <MessageCircleQuestion className="size-6 text-brass-600 shrink-0" aria-hidden />
            <p className="text-sm font-semibold text-forest-900">پاسخ پرسش خود را نیافتید؟ تیم استودیو آماده پاسخ‌گویی است.</p>
          </div>
          <Btn to="/contact" variant="outline" size="sm">تماس با ما</Btn>
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
