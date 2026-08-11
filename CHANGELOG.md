# Changelog

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
