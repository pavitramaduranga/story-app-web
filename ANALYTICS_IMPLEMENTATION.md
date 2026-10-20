# GA4 App Download Intent Tracking

Last updated: 20 October 2026

## Existing setup

- The static site initializes `gtag.js` once from `assets/js/navigation.js` with measurement ID `G-YS5KX79KBQ`.
- There is no Google Tag Manager container or second direct GA4 initializer in the site HTML. The Firebase configuration also contains the same measurement ID as a Firebase setting; it is not itself a second page-level `gtag.js` initializer.
- The shared script already tracks a few site interactions and decorates some outbound links with campaign parameters. App intent tracking is handled centrally by its delegated click listener.
- No cookie consent manager or consent-mode implementation was found in the repository. The existing analytics loading behavior is preserved; confirm the site's consent obligations and GA4 tag settings for the audiences and regions it serves.
- The pages are static HTML with ordinary document navigation, not a client-side routed application.

## Events

| Event | Trigger | Parameters |
|---|---|---|
| `app_cta_click` | A promotional internal link to `/app-links.html`. Explicit `data-cta-placement`, an ancestor with that attribute, `data-app-cta`, or the existing `.nav-download-link` class identifies promotion. | `source_page`, `cta_id`, `cta_location`, `destination`, `content_type` |
| `app_store_click` | A link to `apps.apple.com` or `play.google.com`. | `platform` (`ios` or `android`), `source_page`, `cta_id`, `cta_location`, `content_type`, `destination` (`app_store` or `google_play`) |

`cta_id` is a stable slug derived from the page path, CTA location, and platform unless the link supplies `data-cta-id`. Use `data-cta-placement` on the link or its CTA container to identify placements such as `hero`, `introduction`, `mid_stories`, `closing`, `preview`, `store_card`, and `footer`. Existing links without JavaScript continue to work. Tracking uses the existing `gtag` queue and beacon transport; the handler does not cancel clicks or wait for analytics callbacks.

The handler emits only one custom app-store event for a store click. GA4 Enhanced Measurement may separately emit its automatic `click` event for outbound links; it is not the app conversion event and should not be added to app-store click totals. Whether Enhanced Measurement is enabled is a property setting and was not verifiable from this repository.

GA4's session attribution dimensions identify organic search and the session landing page. The implementation does not copy a landing page into storage or send a custom `original_landing_page` value, which avoids stale attribution across visits. No personal information or full destination URL is sent in these custom events.

## Coverage

The shared `navigation.js` is loaded by the homepage, app download page, existing articles, age pages and hubs, and the rest of the static pages. Consequently the event wiring applies site-wide. Internal app-CTA events are intentionally limited to designated promotional app-links links; ordinary article references and standard navigation links are not treated as promotional clicks. Store links anywhere on the site are tracked.

## GA4 setup and reporting

No GA4 property settings were changed by this code update. After confirming the events arrive, create event-scoped custom dimensions in **Admin → Data display → Custom definitions** for parameters needed in explorations:

- `cta_location`
- `platform`
- `content_type`
- `source_page`
- `destination`

`cta_id` is sent but may be high-cardinality; register it only if reporting by individual CTA ID is useful. The built-in event page path can also report the page where the event occurred, so `source_page` can be omitted from custom definitions if the built-in dimension meets reporting needs. New custom dimensions are not retroactive and can take 24–48 hours to become available after data is sent and the definition is created. Do not register a custom dimension for GA4's built-in landing-page or traffic-source dimensions.

Recommended Free form Exploration:

1. Use **Landing page + query string** and **Session default channel group** (or **Session source / medium**) as dimensions.
2. Add **Sessions** and **Event count** as metrics.
3. Filter Event name to `app_cta_click` or `app_store_click`; use separate tabs for each, or compare event-name values.
4. For store performance, add the registered `platform` dimension. For placement performance, add `cta_location`. For page-of-click analysis, use `source_page` or the built-in event page path dimension.
5. Use a session segment for sessions containing the relevant event when calculating unique sessions with a click. Filter session acquisition to Organic Search to compare organic performance with Direct, Referral, and Organic Social.

Interpretation:

- **Internal CTA click rate** = sessions containing `app_cta_click` / sessions that viewed at least one page with a designated app CTA.
- **Store outbound click rate** = sessions containing `app_store_click` / eligible sessions.
- **Organic visitor-to-store click rate** = organic sessions containing `app_store_click` / organic sessions.
- Keep event counts (raw clicks) separate from sessions containing the event (unique session rate). A store click records download intent, not an installation.

For the most accurate denominator, create a session segment or exploration condition for sessions that viewed pages containing designated CTAs; the site does not currently emit a separate CTA-impression event. GA4 session attribution is the source for landing page and channel reporting, while `source_page` describes the page where a click occurred.

## Validation and known limits

1. Open a page with a designated CTA and enable GA4 DebugView for the test browser (for example with Google Tag Assistant or a debug-mode setup).
2. Click an internal promotional link and confirm one `app_cta_click` with the expected page, location, content type, ID, and destination.
3. Click Apple and Google store links and confirm one `app_store_click` per click and the expected `platform` value. Confirm the browser navigates immediately.
4. Repeat on mobile and desktop. Confirm consent and ad-blocking behavior in the intended production environment.
5. Use Realtime to check event arrival; DebugView is better for checking event parameters. Property filters, consent, ad blockers, and network conditions can prevent events from appearing.

This repository check confirms one initializer in the shared script and one delegated click handler. It cannot confirm live delivery to the GA4 property, Enhanced Measurement settings, consent configuration outside this repository, or actual app installs. No key event/conversion has been configured; app-store clicks should only be marked as a key event if the business explicitly wants to treat download intent as a key event.
