# Baboo Stories Technical Checklist

Use this checklist before publishing new pages or deploying website changes.

## URL and indexing checklist

- [ ] Use one preferred URL for every page.
- [ ] Never add `index.html` to internal links.
- [ ] Link to the homepage as `/`.
- [ ] Link to directory-based articles with a trailing slash:
  `/blog/article-name/`
- [ ] Do not link to directory-based articles as:
  `/blog/article-name/index.html`
- [ ] Add one self-referencing canonical tag to every indexable page:

  ```html
  <link
    rel="canonical"
    href="https://baboostories.com/blog/article-name/"
  />
  ```

- [ ] Make Open Graph URLs match the canonical URL.
- [ ] Use only canonical URLs in `sitemap.xml`.
- [ ] Do not include `/index.html` URLs in the sitemap.
- [ ] Confirm important pages are not blocked by `robots.txt` or a `noindex`
  directive.

## New blog article checklist

- [ ] Store a directory-based article at `blog/article-name/index.html`.
- [ ] Use `https://baboostories.com/blog/article-name/` as its public URL.
- [ ] Add the clean public URL to `sitemap.xml`.
- [ ] Link to the clean URL from the homepage, blog listing, and related
  articles.
- [ ] Check that the title, description, canonical URL, Open Graph URL, and
  structured data all describe the same page.

## Pre-deployment checks

Run this PowerShell check from the repository root. The result should be `0`:

```powershell
$matches = Get-ChildItem -Recurse -Filter *.html |
  Select-String -Pattern 'href="[^"]*index\.html[^"]*"'
$matches.Count
```

Check that every HTML page contains a canonical tag:

```powershell
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  $html = Get-Content -Raw -LiteralPath $_.FullName
  if ($html -notmatch 'rel="canonical"') {
    Write-Output "Missing canonical: $($_.FullName)"
  }
}
```

- [ ] Confirm the `index.html` link check returns `0`.
- [ ] Confirm the canonical check reports no missing tags.
- [ ] Inspect `sitemap.xml` for duplicate or non-canonical URLs.
- [ ] Test homepage, navigation, blog cards, and related-article links.
- [ ] Run `git diff --check`.

## Search Console follow-up

- [ ] Deploy the changes before starting validation.
- [ ] Inspect the clean canonical URL in Google Search Console.
- [ ] Confirm the user-declared canonical matches Google's selected canonical.
- [ ] Resubmit the existing sitemap when its URLs are already correct.
- [ ] Click **Validate Fix** after deployment.
- [ ] Allow time for Google to recrawl the affected URLs.

## Previous finding: explicit `index.html` links

Google Search Console reported these URLs as **Alternate page with proper
canonical tag**:

- `https://baboostories.com/index.html`
- `https://baboostories.com/blog/best-bedtime-story-app-for-toddlers/index.html`
- `https://baboostories.com/blog/toddler-wont-sleep-bedtime-story-routine/index.html`
- `https://baboostories.com/blog/are-scary-stories-good-for-toddlers/index.html`

The canonical tags and sitemap used clean URLs, but internal links still
contained `index.html`. That allowed Google to discover duplicate URL versions.
The internal links were changed to `/` and clean trailing-slash article URLs.

Because this repository is served as a static GitHub Pages site, repository
files cannot define normal server-side `301` redirects. Preventing discovery of
the duplicate URLs through internal links, canonical tags, and the sitemap is
therefore especially important.
