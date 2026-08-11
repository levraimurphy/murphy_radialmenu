# murphy_radialmenu — UI (frontend)

Adaptive in-game radial wheel: the backend (Lua) sends the slots (icon + label + action), the UI renders the wheel and reports the clicked slot. Selection follows the cursor direction (like the native RDR wheel). Stack: React + Vite.

## Requirements
- Node.js + npm. On Windows: use `npm.cmd`.

## Build (after any change)
```bash
cd ui
npm.cmd install    # once
npm.cmd run build  # outputs ui/build/ (served in-game by the fxmanifest)
```

## Change the language
- Edit `ui/public/config.js` -> `window.__RADIALMENU_CONFIG__.locale` (e.g. `"fr"`, `"en"`).
- Bundled languages: `en, fr, ar, cs, de, es, hu, it, ja, ko, nl, pl, pt-BR, ro, ru, sv, tr, uk, zh-CN, zh-TW`.
- The backend can also switch the language at runtime (`nui:locale:set` message).

## Edit UI text
- Translations live in `ui/public/locales/<lang>.js` (keys `common.*`). Keep the keys, then rebuild.
- Slot **labels** come from the backend (already localized on the Lua side).

## Center logo
- `ui/public/assets/logo.png` — replace this file to change the logo shown at rest.
- (Also overridable via `config.logo`, or by the backend with `menu.logo`.)

## Slot icons
- Drop PNGs in `ui/public/assets/icons/`. The backend sends only the file **name** (e.g. `"hat"`). Use silhouettes (rendered in white).

## Do NOT touch
- `ui/build/` — generated, overwritten on every build.
- `ui/docs/NUI_CONTRACT.md` — NUI message contract (for the Lua dev); keep it in sync with the code if you touch both.

## Dev / test without a backend
- `npm.cmd run dev`, then the **"Dev"** button (bottom-right) or **Alt+M**: opens test wheels (2 / 4 / 6 / 8 slots, submenus, disabled slot) and a language selector, without needing Lua.
