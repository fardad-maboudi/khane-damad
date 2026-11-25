import { useEffect } from "react";
import { brand, site } from "@/content/salon.js";

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Per-page title, description and social sharing metadata synchronized into <head> (React 18 compatible). */
export default function Seo({ title, description, image, noindex = false }) {
  const fullTitle = title ? `${title} | ${brand.name}` : site.title;
  const text = description || brand.description;
  const picture = image || site.ogImage;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", text);
    upsertMeta("name", "robots", noindex ? "noindex" : null);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", brand.name);
    upsertMeta("property", "og:locale", site.locale);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", text);
    upsertMeta("property", "og:image", picture);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", text);
    upsertMeta("name", "twitter:image", picture);
  }, [fullTitle, text, picture, noindex]);

  return null;
}
