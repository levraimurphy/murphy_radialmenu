# murphy_radialmenu — NUI Contract (for the Lua dev)

> **For the Lua dev.** Source of truth for this script's NUI exchanges. The frontend was built first (front-first): **the Lua backend must conform to this contract.** It is aligned 1:1 with `ui/src/data/devTestMessages.js` (test sends) and `ui/src/data/testData.js` (mocks).

The radial menu is **adaptive**: the backend sends the slots (icon + label + action) and the frontend reports what the player clicks. Submenus are handled **locally** by the NUI (no round-trip).

---

## 1. Communication patterns

- **Envelope**: every message is `{ action, payload }`.
- **Lua -> NUI** (show / update the wheel): `SendNUIMessage({ action = "nui:radial:open", payload = {...} })`.
- **NUI -> Lua** (player's response): `fetch('https://murphy_radialmenu/<callback>')` -> `RegisterNUICallback("<callback>", ...)`.

## 2. Naming conventions
- Lua->NUI messages: `nui:radial:<verb>`.
- NUI->Lua callbacks: `radial:<verb>` (no `nui:` prefix).

## 3. Open / close sequence
1. The NUI is hidden by default (nothing shown until a `nui:radial:open`).
2. To open, on the Lua side: `SetNuiFocus(true, true)` then `SendNUIMessage({ action="nui:radial:open", payload=... })`.
3. The player clicks a slot -> the NUI sends `radial:select` (leaf) **and closes itself**; or `radial:close` (Esc / click outside the wheel).
4. On receiving `radial:select` **or** `radial:close` on the Lua side: `SetNuiFocus(false, false)`.
   (The NUI hides itself; `nui:radial:close` is only needed to close the wheel from Lua.)

## 4. i18n
- 20 languages bundled in `ui/public/locales/`. Default language: `ui/public/config.js` -> `window.__RADIALMENU_CONFIG__.locale`.
- The backend can switch the language at runtime via `nui:locale:set` (see catalog).
- **Slot `label`s are shown as-is**: the backend sends them already localized (or lets the NUI translate if you send a key you maintain in the locales).

---

## 5. Message catalog (Lua -> NUI)

### `nui:radial:open`
**When:** open (or replace) the wheel.
**UI effect:** shows the wheel with these slots; resets submenu navigation.
**Payload:**
| Field | Type | Description |
|-------|------|-------------|
| `menuId` | string | menu identifier (returned as-is in callbacks) |
| `title` | string? | optional, not shown by default (the center shows the hovered icon/label) |
| `logo` | string? | optional: name of a file in `ui/public/assets/` shown in the center at rest (default `logo.png`) |
| `slots` | array | the slots (see "Slot shape") |

**Example:**
```lua
SendNUIMessage({ action = "nui:radial:open", payload = {
  menuId = "wardrobe",
  slots = {
    { id = "hat",    icon = "hat",    label = "Hat"  },
    { id = "mask",   icon = "mask",   label = "Mask" },
    { id = "emotes", icon = "gloves", label = "Emotes", children = {
        { id = "wave", icon = "bandana", label = "Wave" },
        { id = "sit",  icon = "boots",   label = "Sit"  },
    }},
    { id = "sell",   icon = "vest",   label = "Sell", disabled = true },
  }
}})
```

### `nui:radial:update`
**When:** update the slots of the already-open wheel (without reopening).
**Payload:** `{ slots = { ... } }` (same shape as `open.slots`). `menuId`/`title` are kept.

### `nui:radial:close`
**When:** close the wheel from Lua. **Payload:** `{}`. (Does NOT emit a callback.)

### `nui:locale:set`
**When:** change the UI language. **Payload:**
| Field | Type | Description |
|-------|------|-------------|
| `locale` | string | language code (`en`, `fr`, `pt-BR`, `zh-CN`, ...) |
| `translations` | object? | optional custom overrides (deep-merged onto the locale) |

---

## 6. Callback catalog (NUI -> Lua)

### `radial:select`
**When:** the player clicks a **leaf** slot (no `children`). The wheel closes.
**Body received:**
| Field | Type | Description |
|-------|------|-------------|
| `menuId` | string | the `menuId` of the open menu |
| `slotId` | string | the `id` of the chosen slot |
| `path` | array | breadcrumb of parent slot `id`s (submenus); `[]` at the root |

**Example received:** `{ "menuId": "wardrobe", "slotId": "wave", "path": ["emotes"] }`
**Expected response:** does not matter (the NUI already closed). Returning `{ ok = true }` is enough.

### `radial:close`
**When:** the player closes without choosing (Esc key or click outside the wheel).
**Body received:** `{ menuId }`.
**Lua side:** `SetNuiFocus(false, false)`.

> Note: clicking a slot **with `children`** emits NO callback — the NUI opens the submenu locally (the center becomes a back button). Only selecting a leaf emits `radial:select`.

---

## 7. Slot shape
```
{
  id:       string,        -- required, returned in radial:select
  icon:     string,        -- image file name in ui/public/assets/icons/ (e.g. "hat" or "hat.png")
  label:    string?,       -- shown large in the center on hover
  disabled: boolean?,      -- greyed-out slot, not clickable, no highlight
  stayOpen: boolean?,      -- leaf: emit radial:select WITHOUT closing the wheel (player can pick again)
  children: slot[]?,       -- present => submenu (local navigation, no callback)
}
```
**`stayOpen`:** for actions the player typically wants to repeat (toggle clothing item, cycle volume, etc.). The NUI keeps focus + the wheel up after sending `radial:select`, and the Lua side must NOT release `SetNuiFocus`. Combine with a `nui:radial:update` from Lua if the slots themselves need to change after the action (e.g. show new state).
**Icons:** drop the PNGs in `ui/public/assets/icons/`. The backend sends only the **name**. Provide silhouettes (they are rendered in white).

## 8. Error format (callbacks)
`{ ok = false, error = "key", message = "..." }` (the NUI does not need it here, but keep this format if you add any).

---

## 9. Resource side (for the Lua dev)
The frontend does NOT provide a `fxmanifest.lua` or any Lua. To add on the resource side:
```lua
-- fxmanifest.lua (excerpt)
ui_page 'ui/build/index.html'
files {
  'ui/build/index.html',
  'ui/build/**/*',
}
```
- Build the UI: `cd ui && npm.cmd run build` (output in `ui/build/`).
- `RegisterNUICallback('radial:select', function(data, cb) ... cb({ ok = true }) end)`
- `RegisterNUICallback('radial:close',  function(data, cb) SetNuiFocus(false,false); cb({ ok = true }) end)`
- `SetNuiFocus(true,true)` when opening.
