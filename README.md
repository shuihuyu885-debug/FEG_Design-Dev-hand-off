# FEG NDS Design-to-Dev Handoff

This is a temporary handoff area for NDS design tokens that the colour variables pipeline does not cover yet. For now it contains the **gradients**.

| Path | What it is |
|---|---|
| `tokens/gradients.json` | Gradient tokens with structured colour stops. Use this for tooling or for JS/TS. |
| `dist/gradients.css` | Ready-to-use CSS custom properties, scoped by brand and theme. |
| `source/figma-gradient-styles.json` | Raw snapshot of the Figma gradient paint styles. This is the input to the build. |
| `scripts/figma-plugin/` | Figma exporter that produces the snapshot (development plugin, no network access). |
| `scripts/build-gradients.mjs` | Builds `tokens/` and `dist/` from the snapshot. |
| `scripts/validate-gradients.mjs` | Checks `tokens/` and `dist/` against the snapshot. |
| `docs/gradient-inventory.md` | Why 48 gradients, and which legacy styles are excluded. |

The scripts need Node 18 or newer. There are no dependencies and no `npm install`.

## Source

Values are exported from the Gradient Paint Styles in the canonical NDS Figma library, **NDS / Tokens / Variables library** (file `RKduL8UHSJyIMVyotTzSZS`).

There are 48 styles: 8 gradients across 6 brand/theme combinations.

| Gradient | Owner | Used for |
|---|---|---|
| `gradient` | Foundation | Gradient fills on surfaces |
| `overlay-gradient` | Foundation | Gradient overlay effect |
| `overlay-gradient-primary-on-avatar-edit` | Product | Primary overlay for avatar editing |
| `mk-ako-card` | Marketing | AKO card |
| `mk-wc-ako-card` | Marketing | WC AKO card |
| `mk-cas-cs-card` | Marketing | Casino CS card |
| `mk-card-gradient-1` | Marketing | Card sheen |
| `mk-icon-nav-gradient` | Marketing | Icon navigation |

Brand/theme combinations: FTN Dark, FTN Light, CP Light, CP Dark, PSK Light, PSK Dark.

These gradients are separate from the NDS colour variables. Nothing here changes or replaces the colour tokens.

## Naming

Names are the Figma style names, unchanged.

| Figma style | JSON path | CSS |
|---|---|---|
| `FTN Dark/mk-ako-card` | `gradient.ftn-dark.mk-ako-card` | `--nds-gradient-mk-ako-card` inside the FTN Dark scope |
| `PSK Light/overlay-gradient` | `gradient.psk-light.overlay-gradient` | `--nds-gradient-overlay-gradient` inside the PSK Light scope |

## Using the CSS

1. Include `dist/gradients.css`.
2. Set the brand and theme on a container. Usually this is the app root.
3. Use the variable.

```html
<body data-nds-brand="ftn" data-nds-theme="dark">
  <div class="ako-card">...</div>
</body>
```

```css
.ako-card {
  background: var(--nds-gradient-mk-ako-card);
}
```

| Attribute | Values |
|---|---|
| `data-nds-brand` | `ftn`, `cp`, `psk` |
| `data-nds-theme` | `dark`, `light` |

Switching the brand or theme on the container switches every gradient inside it.

A gradient is an image in CSS, not a colour. Use it with `background` or `background-image`, not with `color` or `background-color`.

## Using the JSON

Each token follows the W3C Design Tokens format for gradients. `$value` is an array of stops: a colour (sRGB, with alpha) and a position from 0 to 1.

```json
"mk-ako-card": {
  "$type": "gradient",
  "$value": [
    { "color": { "colorSpace": "srgb", "components": [1, 0.8588, 0.0039], "alpha": 0,   "hex": "#FFDB01" }, "position": 0 },
    { "color": { "colorSpace": "srgb", "components": [1, 0.8588, 0.0039], "alpha": 0.1, "hex": "#FFDB01" }, "position": 1 }
  ],
  "$description": "Used for the primary brand surface.",
  "$extensions": {
    "com.feg.nds": {
      "kind": "linear",
      "direction": "to right",
      "angle": 90,
      "css": "linear-gradient(to right, rgba(255, 219, 1, 0) 0%, rgba(255, 219, 1, 0.1) 100%)",
      "owner": "Marketing",
      "figmaStyle": "FTN Dark/mk-ako-card",
      "figmaStyleKey": "8cfbca0b32faeb8266e836cdde534651b944ca76"
    }
  }
}
```

- **Direction:** `direction` is a CSS keyword such as `to top`, `to right`, `to left` or `to top left`. `angle` is the equivalent angle in degrees for a square box.
- **Ready-made CSS:** `css` is the full CSS value, identical to the one in `dist/gradients.css`.
- **Native platforms:** use `$value` (the stops) with `direction` and the start and end points it implies.

## Direction and appearance

Figma draws gradients relative to the element's box. CSS side and corner keywords (`to top`, `to top left`, ...) behave the same way for any width and height.

The directions are therefore written as keywords, not fixed angles, so the result matches Figma on every aspect ratio. An angle such as `315deg` would only match on a square element.

## Validation

`scripts/validate-gradients.mjs` checks the output against the Figma snapshot. All 48 styles pass with 0 differences.

- **Colours:** every stop colour matches the 8-bit Figma value exactly.
- **Opacity:** every stop alpha matches exactly.
- **Positions:** every stop position matches exactly.
- **Paint:** linear type, paint opacity 1 and normal blend mode.
- **Consistency:** the `css` field in the JSON and the variable in the CSS file are identical.
- **Direction:**
  - Method: the CSS gradient position was compared with Figma's gradient transform on a grid of points.
  - Box sizes: 100x100, 300x100, 100x300, 343x96 and 40x40.
  - Result: identical within floating-point precision (largest deviation 5.6e-16).

## Regenerating when Figma changes

These files are generated. Do not edit `tokens/` or `dist/` by hand.

1. **Export from Figma.** Open the canonical library (NDS / Tokens / Variables library) in the Figma desktop app.
   - Go to Plugins > Development > Import plugin from manifest, and pick `scripts/figma-plugin/manifest.json`.
   - Run **NDS Gradient Export**.
   - Copy the JSON from the window into `source/figma-gradient-styles.json`, replacing its contents.
   - The plugin only reads paint styles. It does not change the file and has no network access.
2. **Build.**
   ```sh
   node scripts/build-gradients.mjs
   ```
3. **Validate.**
   ```sh
   node scripts/validate-gradients.mjs
   ```
   This must print `OK`. It exits with code 1 if anything differs from the snapshot.
4. **Review.** Open a pull request with the changed `source/`, `tokens/` and `dist/` files. There is no automated publishing.

**The build stops with an error, rather than guessing, if a style:**
- has more than one paint
- is radial or angular
- uses paint opacity or a blend mode
- has a direction that is not a side or corner of the box

Extend the scripts before exporting such a style.

## Not included

The canonical library has 48 gradient paint styles, and all 48 are exported. The legacy Sportsbook inventory lists 72 gradient-related styles. The other 24 are **not gradients**.

- **`mk-ai-border-start/mid/end`:** 24 solid colour styles, the colour stops of the AI border. That is 3 tokens x 6 brand/theme combinations, plus 2 duplicate copies in PSK Dark. They were not migrated into the canonical library.
- **LobBet:** there are no LobBet gradient styles in Figma yet.

Full reconciliation with style keys: `docs/gradient-inventory.md`.
