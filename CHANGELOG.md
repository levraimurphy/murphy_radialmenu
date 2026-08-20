# Changelog

## 1.1.0 (2026-08-20)

Clothing wheel rework, from tester feedback (thanks sangrocu!).

- Clothing actions are now grouped: Shirt (Sleeves / Collar / Remove),
  Vest (Tuck / Remove), Neckwear (Raise / Remove), Boots (Over-Under /
  Remove) each open a sub-wheel — one entry per garment instead of one
  entry per action, and no more duplicate-looking buttons.
- The clothing wheel can be opened directly: `/radial clothing`, or bind a
  key with the new `Config.DirectMenuKeys` (e.g. `clothing = 'J'`).
- Core: menus now accept a `slotsBuilder` function to build their whole
  slot list at open time (menu-level counterpart of `childrenBuilder`).
- Requires murphy_clothing 3.45.2+ for the companion fixes: shirt / vest
  removal now actually refreshes the torso mesh, and Raise / Lower works
  on neckerchief-category items too (with a console hint when an item
  doesn't support the raised state at all).

## 1.0.0 (2026-08-11)

First public release. 🎉

- Context-aware radial wheel (player / horse / vehicle) with automatic
  fallthrough when a context menu has nothing to show.
- Config-driven slot catalog: `command` / `event` / `serverEvent` / `export` /
  `callback` actions, `visibleWhen`, `childrenBuilder`, `stayOpen`, `delay`,
  `disabled`, nested sub-menus.
- Runtime exports: `open`, `openContext`, `close`, `isOpen`, `registerMenu`,
  `unregisterMenu`, `registerSlot`, `removeSlot`, `setContextResolver`,
  `setLocale`, with live refresh of the open wheel on catalog changes.
- Drop-in integrations (auto-detected, per-flag toggles):
  murphy_clothing, murphy_doctor, murphy_craft.
- Input handling: toggle mode on a control hash (default: middle mouse) or
  hold-to-show on a keyboard key; camera + combat locked while open, walking
  stays free.
- Bonus single-tap ragdoll: `/ragdoll`, optional keybind, wheel slot.
- React NUI with 20 bundled UI languages, 68 RDR-style icons, crash failsafe
  (Esc always releases NUI focus).
