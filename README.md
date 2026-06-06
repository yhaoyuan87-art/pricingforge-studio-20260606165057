# PricingForge Studio 20260606165057

PricingForge Studio is a premium single-page pricing and packaging simulator for indie founders, solo makers, and small SaaS teams. It helps model three SaaS packages, monthly prices, customer mix, visitor-to-paid conversion, and churn, then shows projected MRR, ARPA, annualized revenue, churn-adjusted revenue, tier contribution bars, and a live pricing recommendation.

## V1 Static MVP

The app is fully client-side with no login, backend, payments, AI calls, or persistence beyond the current page. Edit tier names, prices, package copy, funnel assumptions, and customer distribution directly in the workbench. Every metric updates immediately.

## Run or Open

Open `index.html` directly in a browser.

For local browser verification from the workspace root, you can also serve the folder:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Verify

Run the lightweight revenue math check:

```bash
node tests/revenue-math.test.js
```

Manual verification:

- Change monthly visitors, conversion, churn, tier prices, and customer mix; confirm MRR, ARPA, annualized revenue, churn-adjusted revenue, tier readouts, revenue bars, and recommendation copy update live.
- Review desktop and mobile widths; controls should remain usable and text should not overlap.
- Use Reset to restore the default founder SaaS scenario.

## Self-review Checklist

- Three editable pricing tiers with names, monthly prices, package copy, and customer mix controls.
- Live MRR, ARPA, annualized revenue, churn-adjusted signal, tier bars, and recommendation updates.
- Static-only implementation with no login, backend, payments, AI calls, or persistence.
- Responsive founder-tool layout for desktop and mobile review.
- Revenue math covered by `tests/revenue-math.test.js`.
