# HaoTrace design QA

## Final result

**passed**

## Evidence

- Source visual reference: `/Users/linhongle/Desktop/8d4730e3494ae8f8d8734984b3273281.jpg`
- Implementation capture: `/Users/linhongle/Documents/portfolio/wangmumu/design-qa-preview.png`
- Route: `/`
- State: empty query / idle landing page, fonts loaded
- Browser viewport: `1227 × 3538` CSS pixels in the in-app browser; capture file is `1227 × 2828` because the browser screenshot surface crops the scrollable document.

The reference image was used as a typography and composition reference: a centered, soft, rounded wordmark with generous breathing room. The colorful interactive-dot field and BorderBeam question box are intentional implementation requirements from the product brief, so they are not treated as deviations from the plain-color reference background.

## Focused visual comparison

- The wordmark is a single centered group above the question box.
- The `浩迹` display face uses ZCOOL KuaiLe, a rounded Chinese display font chosen to echo the reference's soft hand-lettered energy without copying its logo artwork.
- `HaoTrace` uses Fredoka Bold to keep the Latin lockup compact, rounded, and visually compatible with the Chinese title.
- Centering was measured in the browser: title center `613.496px`, viewport center `613.5px`.
- The landing page keeps the requested content scope: title, question box, and the supplied interactive background only.

## Interaction and accessibility checks

- Search works with both the arrow button and the Enter key.
- The search field is a labeled `type="search"` control with a meaningful `name`, `autocomplete="off"`, and a search enter hint.
- Decorative icons are hidden from assistive technology; the search button has an accessible label.
- A skip link targets the single page search form.
- The landing route has one semantic `main` element; the route shell owns the page landmark.
- Focus-visible treatment is present on the input and submit button.
- Submit remains available until a search starts; empty submit focuses the field instead of silently disabling the control.
- Reduced-motion handling is present for the interactive dot canvas and motion shell.
- Dark `color-scheme` and matching `theme-color` are set for the dark landing surface.

## Findings fixed during QA

1. **Composition split** — the title was positioned independently from the centered question box. Fixed by centering the title and form as one flex group.
2. **Typography mismatch** — the initial system font treatment did not carry the rounded reference character. Fixed with locally bundled ZCOOL KuaiLe and Fredoka font faces.
3. **Keyboard search bug** — Enter did not submit the landing form. Fixed with explicit keydown handling and verified against `/search?q=...`.
4. **Landmark issue** — the home page nested `main` inside the route shell. Fixed by keeping one main landmark in `App.tsx`.
5. **Form and icon semantics** — added field naming, search type, labels, decorative icon hiding, focus-visible states, and a skip link.
6. **Focus treatment too heavy** — replaced the full-container focus ring with a single blinking typewriter caret; once text is entered, the browser's native caret takes over.

## Verification

- `npm run build` passes with TypeScript and Vite production build.
- Enter-key search reaches the search results route and returns three mock memory cards for `她以前说过想养猫`.
- Click search reaches the same results flow for a second query.
- Browser console contained no app runtime errors during the final check. The only reported error was a host-level Statsig telemetry timeout, unrelated to HaoTrace.
- Focused input check confirms the container keeps its base border/shadow, the typewriter caret animates only while the empty input is focused, and the caret disappears once text is entered.
