import { brand, site } from "@/content/salon.js";

/** Per-page title, description and social sharing metadata (React 19 hoists these into <head>). */
export default function Seo({ title, description, image, noindex = false }) {
  const fullTitle = title ? `${title} | ${brand.name}` : site.title;
  const text = description || brand.description;
  const picture = image || site.ogImage;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={text} />
      {noindex ? <meta name="robots" content="noindex" /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={text} />
      <meta property="og:image" content={picture} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={text} />
      <meta name="twitter:image" content={picture} />
    </>
  );
}
