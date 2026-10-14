// Validates tokens/gradients.json and dist/gradients.css against the Figma snapshot
// in source/figma-gradient-styles.json. Node 18+, no dependencies.
//
//   node scripts/validate-gradients.mjs
//
// Checks, for every gradient style in the snapshot:
//   - it exists in the JSON and the CSS, and nothing extra exists
//   - name, Figma style key, stop colours, stop alpha and stop positions are identical
//   - paint type, opacity and blend mode are supported
//   - the JSON "css" field and the CSS variable are identical
//   - direction: the CSS gradient (per the CSS Images spec) gives the same position as the
//     Figma gradient transform at every point of a grid, for several box proportions
// Exits with code 1 on any failure.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(readFileSync(join(ROOT, 'source/figma-gradient-styles.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(ROOT, 'tokens/gradients.json'), 'utf8')).gradient;
const cssText = readFileSync(join(ROOT, 'dist/gradients.css'), 'utf8');

const errors = [];
const fail = (name, msg) => errors.push(`${name}: ${msg}`);

// Parse the CSS file into { "ftn|dark|mk-ako-card": "linear-gradient(...)" }.
const cssVars = new Map();
for (const [, brand, theme, body] of cssText.matchAll(/\[data-nds-brand="(\w+)"\]\[data-nds-theme="(\w+)"\]\s*\{([\s\S]*?)\}/g)) {
  for (const [, token, value] of body.matchAll(/--nds-gradient-([\w-]+):\s*(.*?);\n/g)) cssVars.set(`${brand}|${theme}|${token}`, value);
}

function parseCssGradient(value) {
  const m = value.match(/^linear-gradient\((to [a-z ]+), (.*)\)$/);
  if (!m) return null;
  const stops = [...m[2].matchAll(/(#[0-9A-F]{6}|rgba\(([^)]*)\)) ([\d.]+)%/g)].map(([, col, rgba, pos]) => {
    let r, g, b, a;
    if (col.startsWith('#')) [r, g, b, a] = [1, 3, 5].map((i) => parseInt(col.slice(i, i + 2), 16)).concat(1);
    else [r, g, b, a] = rgba.split(',').map(Number);
    return { position: Number(pos) / 100, color: { r, g, b, a } };
  });
  return { keyword: m[1], stops };
}

// Position along the gradient (0..1) of point (x, y) in a W x H box, per CSS Images Level 3.
function cssT(keyword, W, H, x, y) {
  const sides = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270 };
  let angle;
  if (keyword in sides) angle = (sides[keyword] * Math.PI) / 180;
  else {
    // Corner keyword: the 50% line passes through the two neighbouring corners.
    const sx = keyword.includes('right') ? 1 : -1;
    const sy = keyword.includes('top') ? -1 : 1;
    angle = Math.atan2(sx * H, -(sy * W));
  }
  const ux = Math.sin(angle), uy = -Math.cos(angle);
  const length = Math.abs(W * Math.sin(angle)) + Math.abs(H * Math.cos(angle));
  return ((x - W / 2) * ux + (y - H / 2) * uy) / length + 0.5;
}

// Position along the gradient of point (x, y) per Figma's gradientTransform (box-relative).
function figmaT([[a, b, c]], W, H, x, y) {
  return a * (x / W) + b * (y / H) + c;
}

const BOXES = [[100, 100], [300, 100], [100, 300], [343, 96], [40, 40]];
let maxDeviation = 0;
let checked = 0;
const expectedKeys = new Set();

for (const style of snapshot.gradientStyles) {
  const name = style.name;
  const [brandTheme, token] = name.split('/');
  const [brand, theme] = brandTheme.toLowerCase().split(' ');
  const group = `${brand}-${theme}`;
  expectedKeys.add(`${group}|${token}`);
  const paint = style.paints[0];

  if (style.paints.length !== 1) fail(name, 'expected exactly one paint');
  if (paint.type !== 'GRADIENT_LINEAR') fail(name, `unsupported paint type ${paint.type}`);
  if (!paint.visible || paint.opacity !== 1 || paint.blendMode !== 'NORMAL') fail(name, 'paint opacity/visibility/blend mode not representable');

  const t = tokens[group]?.[token];
  if (!t) { fail(name, 'missing from tokens/gradients.json'); continue; }
  const ext = t.$extensions?.['com.feg.nds'] ?? {};
  if (ext.figmaStyle !== name) fail(name, `figmaStyle is "${ext.figmaStyle}"`);
  if (ext.figmaStyleKey !== style.key) fail(name, 'figmaStyleKey differs');

  // JSON stops vs Figma
  const jsonStops = t.$value.map((s) => ({
    position: s.position,
    color: { r: parseInt(s.color.hex.slice(1, 3), 16), g: parseInt(s.color.hex.slice(3, 5), 16), b: parseInt(s.color.hex.slice(5, 7), 16), a: s.color.alpha },
  }));
  if (JSON.stringify(jsonStops) !== JSON.stringify(paint.gradientStops)) fail(name, 'JSON stops differ from Figma');
  t.$value.forEach((s, i) => {
    const want = [s.color.hex.slice(1, 3), s.color.hex.slice(3, 5), s.color.hex.slice(5, 7)].map((h) => parseInt(h, 16) / 255);
    if (s.color.components.some((v, k) => Math.abs(v - want[k]) > 1e-4)) fail(name, `JSON stop ${i} components do not match hex`);
  });

  // CSS vs JSON vs Figma
  const cssValue = cssVars.get(`${brand}|${theme}|${token}`);
  if (!cssValue) { fail(name, 'missing from dist/gradients.css'); continue; }
  if (cssValue !== ext.css) fail(name, 'CSS variable differs from the JSON css field');
  const parsed = parseCssGradient(cssValue);
  if (!parsed) { fail(name, `cannot parse CSS "${cssValue}"`); continue; }
  const cssStops = parsed.stops.map((s) => ({ position: Math.round(s.position * 1e6) / 1e6, color: s.color }));
  if (JSON.stringify(cssStops) !== JSON.stringify(paint.gradientStops)) fail(name, 'CSS stops differ from Figma');
  if (parsed.keyword !== ext.direction) fail(name, 'CSS direction differs from JSON direction');

  // Direction / geometry
  for (const [W, H] of BOXES) {
    for (let i = 0; i <= 10; i++) {
      for (let k = 0; k <= 10; k++) {
        const x = (W * i) / 10, y = (H * k) / 10;
        const d = Math.abs(cssT(parsed.keyword, W, H, x, y) - figmaT(paint.gradientTransform, W, H, x, y));
        maxDeviation = Math.max(maxDeviation, d);
      }
    }
  }
  checked++;
}
if (maxDeviation > 1e-9) errors.push(`direction: CSS and Figma disagree (max deviation ${maxDeviation})`);

// Nothing extra in the outputs
for (const [group, entries] of Object.entries(tokens)) {
  for (const token of Object.keys(entries)) if (!expectedKeys.has(`${group}|${token}`)) errors.push(`tokens/gradients.json has extra token ${group}.${token}`);
}
for (const key of cssVars.keys()) {
  const [brand, theme, token] = key.split('|');
  if (!expectedKeys.has(`${brand}-${theme}|${token}`)) errors.push(`dist/gradients.css has extra variable ${key}`);
}

console.log(`Figma gradient styles: ${snapshot.gradientStyles.length} (excluded non-gradient paint styles: ${snapshot.excludedStyles?.length ?? 0})`);
console.log(`Checked: ${checked}, JSON tokens: ${Object.values(tokens).reduce((n, g) => n + Object.keys(g).length, 0)}, CSS variables: ${cssVars.size}`);
console.log(`Max direction deviation: ${maxDeviation.toExponential(2)}`);
if (errors.length) {
  console.error(`FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log('OK: outputs match the Figma styles.');
