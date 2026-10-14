# Gradient inventory and reconciliation

Why this export contains 48 gradients when the legacy inventory lists 72 gradient-related styles.

Checked on 2026-10-14 against both Figma libraries.

## Summary

| Library | Paint styles | Gradient paint styles | Exported |
|---|---|---|---|
| Legacy Sportsbook: NDS / Tokens / Styles library (`hQjwxlftpstMQTO7BIIxUu`) | 735 (687 solid, 48 linear gradient) | **48** | n/a (legacy source) |
| Canonical NDS: NDS / Tokens / Variables library (`RKduL8UHSJyIMVyotTzSZS`) | 48 (all linear gradients) | **48** | **48** |

The "72" in the legacy inventory counts every style marked `KEEP AS STYLE` in the gradient family:

| Group | Legacy styles | Paint type | In this export |
|---|---|---|---|
| 8 gradients x 6 brand/theme | 48 | `GRADIENT_LINEAR` | Yes, all 48 |
| `mk-ai-border-start`, `mk-ai-border-mid`, `mk-ai-border-end` | 24 | `SOLID` | **No**: excluded (see below) |
| **Total** | **72** | | **48** |

**Nothing is missing.**
- Every gradient paint style in the legacy library has an identical counterpart in the canonical library.
- Every gradient paint style in the canonical library is exported.

## Exported (48)

The tokens are `gradient`, `overlay-gradient`, `overlay-gradient-primary-on-avatar-edit`, `mk-ako-card`, `mk-wc-ako-card`, `mk-cas-cs-card`, `mk-card-gradient-1` and `mk-icon-nav-gradient`. Each exists for FTN Dark, FTN Light, CP Light, CP Dark, PSK Light and PSK Dark.

The Figma style names and keys of all 48 are recorded in `tokens/gradients.json` (`$extensions.com.feg.nds.figmaStyle` / `figmaStyleKey`).

## Excluded (24): `mk-ai-border` solid colours

**Why they are excluded:**
- They are single solid colours, not gradient paint styles.
- They are the colour stops of the AI border gradient, which is drawn in the component itself.
- They were not migrated into the canonical library.
- They need a separate decision: either migrate them as solid paint styles or colour variables, or build a real gradient style from them.

The 24 styles are 3 tokens x 8 styles. The 8 styles per token are the 6 brand/theme combinations plus **2 extra duplicate copies in PSK Dark**.

| Token | Dark value (FTN, CP, PSK) | Light value (FTN, CP, PSK) |
|---|---|---|
| `mk-ai-border-start` | `#B780FF` | `#9750F3` |
| `mk-ai-border-mid` | `#F2E9FF` | `#7237C0` |
| `mk-ai-border-end` | `#806BFF` | `#5136F3` |

All 24 legacy styles:

| Legacy style | Style key | Value | Note |
|---|---|---|---|
| FTN Dark/mk-ai-border-start | `10f862bf27f2180b04f76beabed3afe18be0c1c9` | `#B780FF` | |
| FTN Dark/mk-ai-border-mid | `e38f31977b0b35d8fc11c6d57c24eb52799dcf2e` | `#F2E9FF` | |
| FTN Dark/mk-ai-border-end | `c8010ddd49c37d97a5a00712a4d7bde24f81b733` | `#806BFF` | |
| FTN Light/mk-ai-border-start | `c720aeb9ecc9a1949eb6f52c65d87de07d20d1e3` | `#9750F3` | |
| FTN Light/mk-ai-border-mid | `3033369b0655ff6954dbd317b30c927db8204a8d` | `#7237C0` | |
| FTN Light/mk-ai-border-end | `7ac5e20087d6da7055cdc0ff4cfa3c165574b7db` | `#5136F3` | |
| CP Light/mk-ai-border-start | `98da7ffcfb7d405ad0ff6ad1fc2fc590dd5c6194` | `#9750F3` | |
| CP Light/mk-ai-border-mid | `d1b2b1b04d3153759016889f65f579f764c744be` | `#7237C0` | |
| CP Light/mk-ai-border-end | `7143d438c9db6fee15a6869288c904495bd417f4` | `#5136F3` | |
| CP Dark/mk-ai-border-start | `fc321ffc32ebbe9deb47589235e1b698868a6c29` | `#B780FF` | |
| CP Dark/mk-ai-border-mid | `f8ec14379cf3a5814a6d3f35cfc6158f5b8cce61` | `#F2E9FF` | |
| CP Dark/mk-ai-border-end | `f12098e18f29ae09e8f9339d7751905f43acc14d` | `#806BFF` | |
| PSK Light/mk-ai-border-start | `a3feab177b864d41089f4b9c84a332f4de5cd1f3` | `#9750F3` | |
| PSK Light/mk-ai-border-mid | `fcbe460ce2d52b33f0f19a8acf8bc6e9b6300a95` | `#7237C0` | |
| PSK Light/mk-ai-border-end | `291e471b92eb4e738927c016f0b966c2f0b8106d` | `#5136F3` | |
| PSK Dark/mk-ai-border-start | `39be697be42840160f8d0ef3618947d1adb1508d` | `#B780FF` | |
| PSK Dark/mk-ai-border-mid | `99330b10215aa6001d54b1cc074b233d0c0c4503` | `#F2E9FF` | |
| PSK Dark/mk-ai-border-end | `511772952a1162577c0cac053395b925e39d9964` | `#806BFF` | |
| PSK Dark/mk-ai-border-start | `4d017262361904e10ebe9e8bed008ecb5ebc593c` | `#B780FF` | Duplicate, same name and value |
| PSK Dark/mk-ai-border-mid | `b864246c4d523b96425b16a03c8c4d1f3315009f` | `#F2E9FF` | Duplicate, same name and value |
| PSK Dark/mk-ai-border-end | `3b1f86c251262e26140cd4e258aa022d36ebda95` | `#806BFF` | Duplicate, same name and value |
| PSK Dark/mk-ai-border-start | `231f1f2f7de72f1d420fce253da5272b2bb30c3f` | `#B780FF` | Duplicate, same name and value |
| PSK Dark/mk-ai-border-mid | `94298aca375d2b9ba1a090f7cadf0693a66f77b1` | `#F2E9FF` | Duplicate, same name and value |
| PSK Dark/mk-ai-border-end | `a519e2d5e575944457fd2dc8ffe22bd0cd9db3d8` | `#806BFF` | Duplicate, same name and value |

## Not available in Figma

There are no LobBet gradient styles in either library. The LobBet brand exists only as a colour variable mode, so no LobBet gradients can be exported yet.

## Keeping this in sync

`scripts/figma-plugin/code.js` lists every non-gradient paint style it finds under `excludedStyles` in `source/figma-gradient-styles.json`.

- **Now:** this list is empty, because the canonical library currently contains only gradient styles.
- **Later:** if solid styles such as `mk-ai-border` are ever added there, they will show up in that list automatically, rather than being dropped silently.
