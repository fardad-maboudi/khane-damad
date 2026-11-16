import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Seo from "@/components/salon/Seo.jsx";
import { Container } from "@/components/salon/ui.jsx";
import { FinalCta, PageHero } from "@/components/salon/sections.jsx";
import { faq } from "@/content/salon.js";
import { cn } from "@/lib/utils";

export default function Faq() {
  const [open, setOpen] = useState(0);
  const groups = [...new Set(faq.map((f) => f.group))];
  return (
    <>
      <Seo title="سوالات متداول" description="پاسخ پرسش‌های رایج درباره رزرو نوبت، لغو، تأخیر، پکیج داماد و آماده‌سازی قبل از مراجعه." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }} />
      <PageHero title="پاسخ پرسش‌های رایج" lead="پاسخ سؤالتان را پیدا نکردید؟ از صفحه تماس با ما در ارتباط باشید." />
      <Container className="max-w-3xl py-14">
        {groups.map((g) => (
          <section key={g} className="mb-10" aria-label={g}>
            <h2 className="mb-4 text-xl font-bold text-forest-900">{g}</h2>
            <div className="divide-y divide-ivory-300 rounded-2xl border border-ivory-300 bg-ivory-50">
              {faq.map((f, i) => f.group !== g ? null : (
                <div key={f.q}>
                  <h3>
                    <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-start font-semibold text-forest-900">
                      {f.q}
                      <ChevronDown className={cn("size-5 shrink-0 text-brass-600 transition-transform", open === i && "rotate-180")} aria-hidden />
                    </button>
                  </h3>
                  <div id={`faq-${i}`} role="region" aria-labelledby={`faq-b-${i}`} hidden={open !== i} className="px-5 pb-5 leading-8 text-neutral-700">{f.a}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </Container>
      <FinalCta />
    </>
  );
}
