# OpenSEO MCP

The Baboo Stories OpenSEO project is configured for `https://baboostories.com/`.
It connects to:

- Google Search Console for impressions, clicks, CTR, average position, and page/query performance.
- GA4 property “Baboo Stories Web” for organic landing pages, sessions, engagement, and key events.

## When to use it

Use OpenSEO before prioritizing SEO or CTA work. Start with Search Console to find pages with meaningful demand or near-page-one rankings, then use GA4 to compare organic sessions, engagement, and recorded key events. Inspect the selected pages in the repository before changing copy or layout.

For CTA/CRO work, prioritize pages by:

1. Search demand and ranking opportunity.
2. Commercial or app-download intent.
3. Engagement quality.
4. Presence and quality of the next-step CTA.
5. Availability of reliable event tracking.

## Current conversion path

The primary conversion is app-download intent. The site currently tracks:

- `app_cta_click` for promotional internal links to `app-links.html`.
- `app_store_click` for Apple App Store and Google Play outbound clicks.

CTA placement and platform parameters are included for analysis. A zero-key-event result is a measurement gap, not proof that visitors did not interact; verify GA4 event delivery and key-event configuration before reporting conversion performance.

OpenSEO read-only performance queries do not require repository changes. Keep the project context current when the connected properties, conversion path, or reporting conventions change.
