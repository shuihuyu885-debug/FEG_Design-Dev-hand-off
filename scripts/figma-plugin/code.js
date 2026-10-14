// NDS gradient export: Figma side.
//
// Reads every local paint style in the open Figma file and returns a snapshot
// of the gradient paint styles. Non-gradient paint styles are listed as excluded.
// Run it in the canonical NDS library (NDS / Tokens / Variables library).
//
// Two ways to run it:
// 1. As a Figma development plugin (Plugins > Development > Import plugin from
//    manifest, pick scripts/figma-plugin/manifest.json). The snapshot appears in a
//    window; copy it into source/figma-gradient-styles.json.
// 2. Through an agent with Figma Plugin API access: run everything above the
//    "Plugin UI" line, then `return await exportGradientStyles();`.

const CANONICAL_FILE_KEY = 'RKduL8UHSJyIMVyotTzSZS';

async function exportGradientStyles() {
  const round = (x) => Math.round(x * 1e6) / 1e6;
  const to255 = (x) => Math.round(x * 255);
  const styles = await figma.getLocalPaintStylesAsync();
  const gradientStyles = [];
  const excludedStyles = [];
  for (const s of styles) {
    const isGradient = s.paints.length > 0 && s.paints.every((p) => p.type.startsWith('GRADIENT'));
    if (!isGradient) {
      excludedStyles.push({ name: s.name, key: s.key, paintTypes: s.paints.map((p) => p.type), reason: 'not a gradient paint style' });
      continue;
    }
    gradientStyles.push({
      name: s.name,
      key: s.key,
      description: s.description,
      paints: s.paints.map((p) => ({
        type: p.type,
        visible: p.visible,
        opacity: round(p.opacity),
        blendMode: p.blendMode,
        gradientTransform: p.gradientTransform.map((row) => row.map(round)),
        gradientStops: p.gradientStops.map((st) => ({
          position: round(st.position),
          color: { r: to255(st.color.r), g: to255(st.color.g), b: to255(st.color.b), a: round(st.color.a) },
        })),
      })),
    });
  }
  return {
    source: {
      library: 'NDS / Tokens / Variables library',
      fileKey: figma.fileKey || CANONICAL_FILE_KEY,
    },
    exportedAt: new Date().toISOString(),
    paintStyleCount: styles.length,
    gradientStyles,
    excludedStyles,
  };
}

// ---- Plugin UI (only used when run as a development plugin) ----
exportGradientStyles().then((snapshot) => {
  const json = JSON.stringify(snapshot, null, 2).replace(/</g, '\\u003c');
  figma.showUI(
    `<p style="font:12px sans-serif">${snapshot.gradientStyles.length} gradient styles. ` +
      `Copy into <b>source/figma-gradient-styles.json</b>.</p>` +
      `<textarea style="width:100%;height:400px;font:11px monospace">${json.replace(/&/g, '&amp;')}</textarea>`,
    { width: 560, height: 470 }
  );
});
