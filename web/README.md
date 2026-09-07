# FitValen Web frontend

## Runtime contract

FitValen Web reuses the proven functional Mini App modules, but the Web presentation has one visual owner.

Loaded CSS at runtime:

1. Inline Mini App base: structural fallback only.
2. `workout-v1.css`: structure for generated workout DOM.
3. `advanced-v1.css`: structure for advanced generated DOM.
4. `exercise-note-v1.css`: structure for exercise notes.
5. `fv-web-foundation-v1.css`: **final Web visual owner, loaded last**.

`fv-web-qa-v1.css` is not loaded as an extra stylesheet. `build.mjs` concatenates it into the emitted `fv-web-foundation-v1.css`, keeping a single Web visual output.

## Invariants

- Do not add visual override layers on top of the foundation.
- Do not replace bottom-navigation icons from JavaScript.
- Do not move functional DOM nodes for visual reasons.
- Do not inject Telegram safe-area or Telegram production-polish CSS into Web.
- Keep Web-only patches inside `web/build.mjs`; do not modify Telegram production source to solve Web presentation issues.
- `advanced-v1` is the sole owner of the Web Progress renderer.
- Cached Progress revisits must not repaint the full view.
- The explicit refresh button may force one Progress reload.

## Responsive QA baseline

Safety rules are maintained for these representative widths:

- 320 px
- 375 px
- 390 px
- 430 px
- tablet / 768 px
- desktop / 900 px+

Important mobile guarantees:

- fixed four-tab navigation keeps the same geometry on mobile and desktop;
- inputs are at least 16 px where needed to avoid Safari focus zoom;
- grids use `minmax(0,1fr)` and dynamic text can wrap;
- sheets use dynamic viewport height and contained scrolling;
- touch targets for primary workout navigation are at least 44 px;
- reduced-motion preferences are respected.

## Change policy

For future UX/UI work, modify the foundation or QA source directly and validate the real component structure. Do not create another `performance`, `polish` or `premium` override layer. If a structural redesign is needed, change the component structure deliberately and update the single Web visual owner with it.
