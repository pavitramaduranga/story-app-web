import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE = "https://baboostories.com";
const MAX_TITLE = 65;
const MIN_DESCRIPTION = 80;
const MAX_DESCRIPTION = 170;
const MAX_IMAGE_BYTES = 300 * 1024;

const htmlFiles = walk(root)
  .filter((file) => file.endsWith(".html"))
  .filter((file) => !file.includes(`${path.sep}.git${path.sep}`));

const sitemapPath = path.join(root, "sitemap.xml");
const sitemapUrls = fs.existsSync(sitemapPath)
  ? [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc\b[^>]*>\s*([\s\S]*?)\s*<\/loc\s*>/g)].map((match) =>
      normalizeSpace(match[1]),
    )
  : [];
const sitemapLastmod = new Map(
  fs.existsSync(sitemapPath)
    ? [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<url\b[^>]*>([\s\S]*?)<\/url\s*>/g)]
        .map((match) => {
          const loc = textMatch(match[1], /<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/i);
          const lastmod = textMatch(match[1], /<lastmod\b[^>]*>([\s\S]*?)<\/lastmod\s*>/i);
          return loc ? [loc, lastmod] : null;
        })
        .filter(Boolean)
    : [],
);

const canonicalRows = [];
const failures = [];
const localLinks = [];
const referencedImages = new Set();

for (const file of htmlFiles) {
  const rel = relative(file);
  const html = fs.readFileSync(file, "utf8");
  const title = textMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const description = attrMatch(html, /<meta\b[^>]*\bname=["']description["'][^>]*>/i, "content");
  const canonicalTags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)];
  const canonical = canonicalTags.length ? attrFromTag(canonicalTags[0][0], "href") : "";
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    stripTags(match[1]),
  );
  const jsonLdBlocks = [
    ...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];

  if (!title) failures.push(`${rel}: missing <title>`);
  if (title.length > MAX_TITLE) failures.push(`${rel}: title too long (${title.length})`);
  if (!description) failures.push(`${rel}: missing meta description`);
  if (description && description.length < MIN_DESCRIPTION) {
    failures.push(`${rel}: meta description too short (${description.length})`);
  }
  if (description.length > MAX_DESCRIPTION) {
    failures.push(`${rel}: meta description too long (${description.length})`);
  }
  if (canonicalTags.length !== 1) failures.push(`${rel}: expected 1 canonical, found ${canonicalTags.length}`);
  if (canonical && !canonical.startsWith(`${SITE}/`)) failures.push(`${rel}: canonical is not on ${SITE}`);
  if (h1s.length !== 1) failures.push(`${rel}: expected 1 H1, found ${h1s.length}`);
  if (/<meta\b[^>]*\bname=["']robots["'][^>]*\bnoindex\b/i.test(html)) {
    failures.push(`${rel}: contains noindex`);
  }

  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      failures.push(`${rel}: JSON-LD block ${index + 1} does not parse (${error.message})`);
    }
  }

  if (canonical) canonicalRows.push({ rel, canonical });
  const dateModified = textMatch(html, /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/i);
  if (canonical && dateModified && sitemapLastmod.get(canonical) && sitemapLastmod.get(canonical) !== dateModified) {
    failures.push(
      `${rel}: Article dateModified ${dateModified} does not match sitemap lastmod ${sitemapLastmod.get(canonical)}`,
    );
  }

  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) continue;
    localLinks.push({ source: file, sourceRel: rel, href });
    if (/index\.html/i.test(href)) failures.push(`${rel}: internal href includes index.html (${href})`);
  }

  for (const match of html.matchAll(/\s(?:src|content)=["']([^"']+\.(?:png|jpe?g|webp|gif|svg))(?:\?[^"']*)?["']/gi)) {
    const imagePath = resolveLocalAsset(match[1]);
    if (imagePath) referencedImages.add(imagePath);
  }
}

const canonicalUrls = canonicalRows.map((row) => row.canonical);
for (const url of duplicates(sitemapUrls)) failures.push(`sitemap.xml: duplicate URL ${url}`);
for (const url of duplicates(canonicalUrls)) failures.push(`canonicals: duplicate canonical ${url}`);
for (const row of canonicalRows) {
  if (!sitemapUrls.includes(row.canonical)) failures.push(`${row.rel}: canonical missing from sitemap (${row.canonical})`);
}
for (const url of sitemapUrls) {
  if (!canonicalUrls.includes(url)) failures.push(`sitemap.xml: URL has no matching local canonical (${url})`);
}

for (const link of localLinks) {
  const target = resolveLocalHref(link.source, link.href);
  if (!target) continue;
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    failures.push(`${link.sourceRel}: broken local href ${link.href}`);
  }
}

const assetsDir = path.join(root, "assets");
const largeImages = walk(assetsDir).filter((file) =>
  /\.(png|jpe?g|webp|gif)$/i.test(file) && fs.statSync(file).size > MAX_IMAGE_BYTES,
);

const warnings = [];
for (const file of largeImages) {
  const rel = relative(file);
  const sizeKb = Math.round(fs.statSync(file).size / 102.4) / 10;
  if (referencedImages.has(path.resolve(file))) {
    failures.push(`${rel}: referenced image is ${sizeKb} KB; optimize for SEO page performance`);
  } else {
    warnings.push(`${rel}: unreferenced image is ${sizeKb} KB; optimize before using on SEO pages`);
  }
}

if (failures.length) {
  console.error(`SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const warning of warnings) console.warn(`Warning: ${warning}`);
console.log(`SEO validation passed: ${htmlFiles.length} HTML pages, ${sitemapUrls.length} sitemap URLs.`);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function normalizeSpace(value) {
  return stripTags(value).replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function textMatch(value, regex) {
  const match = value.match(regex);
  return match ? normalizeSpace(match[1]) : "";
}

function attrMatch(value, tagRegex, attr) {
  const match = value.match(tagRegex);
  return match ? attrFromTag(match[0], attr) : "";
}

function attrFromTag(tag, attr) {
  const regex = new RegExp(`${attr}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i");
  const match = tag.match(regex);
  return match ? normalizeSpace(match[2]) : "";
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function resolveLocalHref(source, href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return null;
  let target = clean.startsWith("/")
    ? path.join(root, clean.slice(1))
    : path.resolve(path.dirname(source), clean);
  if (clean.endsWith("/") || (fs.existsSync(target) && fs.statSync(target).isDirectory())) {
    target = path.join(target, "index.html");
  }
  return target;
}

function resolveLocalAsset(value) {
  let clean = value.split("#")[0].split("?")[0];
  if (clean.startsWith(SITE)) clean = clean.slice(SITE.length);
  if (/^https?:\/\//i.test(clean)) return null;
  const target = clean.startsWith("/")
    ? path.join(root, clean.slice(1))
    : path.resolve(root, clean);
  return fs.existsSync(target) ? path.resolve(target) : null;
}
