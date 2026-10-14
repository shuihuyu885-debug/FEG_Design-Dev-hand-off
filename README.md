# FEG NDS Design-to-Dev Handoff

This is a temporary handoff area for NDS design tokens that the colour variables pipeline does not cover yet. For now it contains the **gradients**.

| File | What it is |
|---|---|
| `tokens/gradients.json` | Gradient tokens with structured colour stops. Use this for tooling or for JS/TS. |
| `dist/gradients.css` | Ready-to-use CSS custom properties, scoped by brand and theme. |

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

The output was checked against the Figma styles. All 48 styles passed with 0 differences.

- **Colours:** every stop colour matches the 8-bit Figma value exactly.
- **Opacity:** every stop alpha matches exactly.
- **Positions:** every stop position matches exactly.
- **Paint:** linear type, paint opacity 1 and normal blend mode.
- **Consistency:** the `css` field in the JSON and the variable in the CSS file are identical.
- **Direction:**
  - Method: the CSS gradient position was compared with Figma's gradient transform on a grid of points.
  - Box sizes: 100x100, 300x100, 100x300, 343x96 and 40x40.
  - Result: identical within floating-point precision (largest deviation 5.6e-16).

## Updating

These files are generated from Figma. Do not edit them by hand.

When a gradient style changes in Figma:
1. Re-export both files.
2. Re-run the validation.
3. Open a pull request.

There is no automated publishing.

## Not included

- **AI border colours:** `mk-ai-border-start`, `mk-ai-border-mid` and `mk-ai-border-end` are solid colours, not gradients.
- **LobBet:** there are no LobBet gradient styles in Figma yet.
