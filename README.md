# murphy_radialmenu

**Free, standalone, config-driven radial action wheel for RedM.**

Press a key, get a wheel of context-aware actions: on foot, in the saddle, or on a wagon bench. Every button is declared in one Lua config file (or registered at runtime by any other resource), and the wheel ships with **drop-in integrations** for Murphy Workshop scripts that activate themselves when the matching resource is running.

Made by [Murphy Workshop](https://docs.murphy-workshop.com). It's the same wheel that runs on our own server.

---

## Features

- **Standalone**: no framework required. Works on VORP, RSG, REDEMRP, or a vanilla RedM server: the core only talks to the resources *you* wire into it.
- **Context-aware**: different menus on foot / mounted / in a wagon, resolved automatically when the wheel opens. Add your own contexts (swimming, in an interior, dead...) with one predicate function.
- **Config-driven**: a slot is ~4 lines of Lua. Five action types: client command, client event, server event, export call, inline callback.
- **Dynamic**: slots can hide themselves per-open (`visibleWhen`) or build their sub-menu from live game state (`childrenBuilder`). Sub-menus nest as deep as you want.
- **Runtime API**: other resources can register / replace / remove menus and slots on the fly through exports, including while the wheel is open (it refreshes live).
- **Ready-made integrations**: murphy_clothing, murphy_doctor, murphy_craft. Zero configuration, each one only appears when its resource is started.
- **Polished NUI**: React wheel with RDR-style ring, hover labels, sub-menu navigation, disabled & stay-open slots, 20 bundled UI languages.
- **Safe input handling**: while the wheel is open the camera is frozen and firing / aiming / melee are blocked, but the player can still walk.
- **Bonus**: a clean single-tap ragdoll (`/ragdoll` command, optional keybind, wheel slot).

## Requirements

- RedM server (build 1491+, `rdr3` / `cerulean`).
- Nothing else. All integrations are optional and auto-detected.

## Installation

1. Download the latest release (or `git clone` this repository) into your resources folder. The folder must be named `murphy_radialmenu`.
2. Add to your `server.cfg`:
   ```cfg
   ensure murphy_radialmenu
   ```
   Order doesn't matter relative to the integrated resources: integration slots check the target resource at wheel-open time, not at boot.
3. Restart the server (or `refresh` + `ensure murphy_radialmenu`).
4. In game: **click the middle mouse button** and the wheel opens. Click it again, press `Esc`, or click outside the ring to close.

The UI is pre-built (`ui/build/`); **you don't need Node.js** unless you want to modify the UI source (see [Customizing the UI](#customizing-the-ui)).

## Default controls

| Input | Effect |
|---|---|
| Middle mouse click | Toggle the wheel open / closed |
| Left click on a slot | Run the slot (or enter its sub-menu) |
| Click the wheel center | Go back one sub-menu level |
| `Esc` / click outside the ring | Close without choosing |
| `/radial` | Open / close from chat or console |
| `/radial <menuId>` | Open a specific menu (e.g. `/radial horse`) |
| `/ragdoll` | Toggle the ragdoll |

While the wheel is open the player can still **walk**: only the camera and combat inputs are locked.

## Configuration

Everything lives in `shared/config.lua`.

### Open keybind

Two mutually exclusive modes, set **one**:

```lua
Config.OpenControl = 0xCEE12B50   -- RDR3 control hash -> TOGGLE (press to open, press to close)
-- Config.OpenKey  = 'B'          -- keyboard key      -> HOLD  (hold to show, release to close)
```

- `OpenControl` is the right choice for **mouse buttons**. The default `0xCEE12B50` is the middle mouse click (`INPUT_ATTACK2`); its native effect (secondary attack) is suppressed while this resource owns the bind, so middle-click never fires a weapon.
- `OpenKey` gives the classic *hold-to-show* behavior and accepts `A`-`Z`, `0`-`9`, `F1`-`F12`, `TAB`, `SPACE`, `LSHIFT`, `LCTRL`, `LALT`, ...
- Mouse binds can't do hold-to-show reliably: once the NUI takes focus, the game side no longer sees the mouse release. That's why `OpenControl` is a toggle by design.

### Direct-open keybinds

Keys that open a **specific wheel** straight away, skipping the context wheel (hold-to-show, like `Config.OpenKey`):

```lua
Config.DirectMenuKeys = {
  clothing = 'J',   -- J opens the clothing wheel directly
}
```

Menu ids are keys of `Config.Menus` — integrations register theirs too (murphy_clothing registers `clothing`). The same menus are also reachable with `/radial <menuId>`.

### Language

```lua
Config.Locale = 'en'
```

This sets the UI chrome language (back / close / loading labels). Bundled: `en, fr, ar, cs, de, es, hu, it, ja, ko, nl, pl, pt-BR, ro, ru, sv, tr, uk, zh-CN, zh-TW`.

**Slot labels are plain strings**: they are shown exactly as you write them in the config / integration files, so translate them there.

### Ragdoll keybind

```lua
Config.Ragdoll = { Enabled = false, Key = 'X' }
```

The `/ragdoll` command and the wheel slot always work; `Enabled = true` additionally binds a key. One tap collapses the ped (infinite ragdoll), the next tap plays the natural get-up animation. Mounting, entering a vehicle, or dying clears it automatically.

## Menus & contexts

A **menu** is a named wheel (`player`, `horse`, `vehicle`, or anything you add). A **context** decides which menu opens when the player presses the key:

```lua
Config.Contexts = {
  { menuId = 'horse',   when = function(ped) return IsPedOnMount(ped) end },
  { menuId = 'vehicle', when = function(ped) return IsPedInAnyVehicle(ped, false) end },
  { menuId = 'player',  when = function(_)   return true end },   -- fallback
}
```

The first matching context wins. A context whose menu resolves to **zero visible slots falls through** to the next one, so an empty `horse` menu gracefully falls back to `player` instead of showing an empty wheel.

A resource can take over context resolution entirely:

```lua
exports.murphy_radialmenu:setContextResolver(function()
  if IsMyMinigameActive() then return 'minigame' end
  return nil   -- nil -> fall back to Config.Contexts
end)
```

## Slot reference

A menu is `{ title?, logo?, slots = { ... } }`. Each slot:

```lua
{
  id          = 'unique_id',        -- required, unique within its level
  icon        = 'clothing_generic_hat', -- PNG name in ui/build/assets/icons/ (no extension)
  label       = 'My action',        -- shown in the wheel center on hover
  description = 'Optional hint',    -- smaller line under the label
  disabled    = false,              -- true -> greyed out, not clickable
  stayOpen    = false,              -- true -> run the action but keep the wheel open
  delay       = 0,                  -- ms to wait before running the action (see below)
  visibleWhen = function() ... end, -- optional, evaluated at wheel open
  children    = { ... },            -- sub-menu (action is then ignored)
  childrenBuilder = function() ... end, -- build children at open time
  action      = { type = ..., value = ..., args = { ... } },
}
```

### Action types

| `type` | `value` | Runs |
|---|---|---|
| `'command'` | `'cmdName'` | `ExecuteCommand('cmdName')` on the client |
| `'event'` | `'res:client:evt'` | `TriggerEvent(value, table.unpack(args))` |
| `'serverEvent'` | `'res:server:evt'` | `TriggerServerEvent(value, table.unpack(args))` |
| `'export'` | `{ 'resource', 'fn' }` | `exports.resource:fn(table.unpack(args))` |
| `'callback'` | `function(slotId, path) end` | the function itself |

`args` is optional and forwarded to `event` / `serverEvent` / `export`.

### `visibleWhen`: hide a slot per open

Evaluated (pcall-guarded) every time the wheel opens. Return `false` to hide the slot for this open. Keep it **fast and non-blocking**: it runs synchronously on every open, for every slot. If your check needs a server round-trip, cache the answer in the background and read the cached value here (that's exactly what the murphy_doctor integration does).

```lua
{ id = 'give_money', icon = 'kit_pouch_valuables', label = 'Give money',
  visibleWhen = function() return IsAnotherPlayerWithin(3.0) end,
  action = { type = 'event', value = 'mymoney:client:give' } },
```

### `childrenBuilder`: dynamic sub-menus

A sub-menu slot can build its children from live state instead of declaring them statically. The builder runs at wheel open (and on live refreshes); errors are caught and yield an empty sub-menu.

```lua
{ id = 'horses', icon = 'document_horse_deed', label = 'My horses',
  childrenBuilder = function()
    local out = {}
    for _, h in ipairs(GetMyHorses()) do
      out[#out+1] = { id = 'h_' .. h.id, icon = 'document_horse_deed', label = h.name,
                      action = { type = 'serverEvent', value = 'stable:spawn', args = { h.id } } }
    end
    return out
  end },
```

### `stayOpen`: repeatable actions

For actions the player wants to chain (clothing toggles, volume steps): the wheel stays open and focused after the click so they can immediately pick another slot.

### `delay`: chaining into another UI

If a slot opens **another NUI** (an interaction picker, a player selector, a native keyboard), give it `delay = 150`. Without it, the left-click that confirmed the slot is often still pressed on the next UI's first frame and auto-selects whatever is under the cursor.

## Built-in integrations

Files in `integrations/`, loaded before the core. Each one **only shows its slots while its target resource is running**, so the defaults are safe on any server: you can keep them all enabled even if you own none of the resources.

| Integration | Adds | Menus | Default |
|---|---|---|---|
| [murphy_clothing](https://docs.murphy-workshop.com) | "Clothing" sub-menu: roll sleeves, open collar, bandana up, boots / vest over-under, gunbelt side, pomade, plus one on/off toggle per worn piece and "Get Naked". All built at open time from what the character actually wears | player, horse | on |
| [murphy_doctor](https://docs.murphy-workshop.com) | "Health" self-check · "Doctor" sub-menu for practitioners (auscultate / treatment / revive / bandage, patient picked via selector or closest player) · "HUD" (show/hide + move the metabolism HUD) | player, horse, vehicle | on |
| [murphy_craft](https://docs.murphy-workshop.com) | "Craft": opens the crafting menu, honoring nearby stations & specializations | player | on |

Notes:

- **murphy_doctor detects the wheel automatically**: when `murphy_radialmenu` is started, murphy_doctor routes its doctor actions through the wheel and skips its own prompts. No configuration on either side.
- Disable any integration with its flag in `Config.Integrations` (or by commenting its line out of `fxmanifest.lua`).

### Writing your own integration

Copy any file in `integrations/`, adapt it, and list it in `fxmanifest.lua` **above** `client/client.lua`:

```lua
-- integrations/my_script.lua
if not RadialIntegrations.enabled('my_script') then return end

RadialIntegrations.addSlot('player', {
  id    = 'my_action',
  icon  = 'kit_pouch_kit',
  label = 'My action',
  visibleWhen = RadialIntegrations.whenStarted('my_script'),
  action = { type = 'event', value = 'my_script:client:doThing' },
})
```

Helpers available (see `integrations/_shared.lua`): `RadialIntegrations.enabled(name)`, `.addSlot(menuId, slot)`, `.whenStarted(resource, extraPredicate?)`, `.playerNearby(meters)`.

## Exports (runtime API)

Any client script can drive the wheel:

```lua
-- Open / close
exports.murphy_radialmenu:open('player')      -- specific menu (false if empty/unknown)
exports.murphy_radialmenu:openContext()       -- context-resolved menu
exports.murphy_radialmenu:close()
exports.murphy_radialmenu:isOpen()            -- boolean

-- Define or replace a whole menu
exports.murphy_radialmenu:registerMenu('camp', {
  title = 'Camp',
  slots = {
    { id = 'fire', icon = 'kit_camp', label = 'Campfire',
      action = { type = 'event', value = 'camp:client:fire' } },
  },
})
exports.murphy_radialmenu:unregisterMenu('camp')

-- Add / replace / remove a single slot (path targets a sub-menu)
exports.murphy_radialmenu:registerSlot('player', {
  id = 'whistle', icon = 'toast_horse_bond', label = 'Whistle',
  action = { type = 'command', value = 'whistle' },
})
exports.murphy_radialmenu:registerSlot('player', childSlot, { 'emotes' })
exports.murphy_radialmenu:removeSlot('player', 'whistle')

-- Context & language
exports.murphy_radialmenu:setContextResolver(fn)   -- fn() -> menuId | nil (nil = clear with setContextResolver(nil))
exports.murphy_radialmenu:setLocale('de')          -- switch UI language at runtime
exports.murphy_radialmenu:setLocale('en', { common = { back = 'Return' } })  -- with overrides
```

All mutations apply live: registering or removing a slot of the currently open menu refreshes the wheel in place.

**Registrations don't survive a restart of murphy_radialmenu** (the catalog is rebuilt from `shared/config.lua`). Register from a resource with this pattern and you're covered in every start order:

```lua
local function registerMySlots()
  exports.murphy_radialmenu:registerSlot('player', { ... })
end

CreateThread(function()
  if GetResourceState('murphy_radialmenu') == 'started' then registerMySlots() end
end)

AddEventHandler('onClientResourceStart', function(res)
  if res == 'murphy_radialmenu' then registerMySlots() end
end)
```

(For permanent slots, an `integrations/` file is simpler, see above.)

## Customizing the UI

### Icons

Icons are white-rendered silhouette PNGs. 68 RDR-style icons ship with the wheel (`ui/build/assets/icons/`): clothing pieces, pouches, documents, emotes, tools...

To add one **without Node.js**: drop `myicon.png` into `ui/build/assets/icons/`, restart the resource, reference it as `icon = 'myicon'`.
If you also rebuild the UI at some point, put a copy in `ui/public/assets/icons/` too, because a rebuild regenerates `ui/build/` from `ui/public/`.

### Center logo

Replace `ui/build/assets/logo.png` (and `ui/public/assets/logo.png` for rebuilds). A menu can also set its own with `logo = 'myfile.png'`.

### UI languages

- Default language: `Config.Locale` (Lua), pushed to the NUI at resource start. `ui/build/config.js` holds the pre-Lua fallback.
- Edit or add translations in `ui/build/locales/<lang>.js` (keys `common.*`). For rebuild persistence, mirror the change in `ui/public/locales/`.
- Runtime switch: `exports.murphy_radialmenu:setLocale('fr')`.

### Rebuilding the UI (only if you change `ui/src/`)

```bash
cd ui
npm install     # once
npm run build   # regenerates ui/build/
```

`npm run dev` starts a browser dev server with a **Dev panel** (bottom-right, or `Alt+M`): test wheels of 2/4/6/8 slots, sub-menus, disabled slots, and a language selector, no RedM needed. The NUI message contract is documented in [`ui/docs/NUI_CONTRACT.md`](ui/docs/NUI_CONTRACT.md).

## Troubleshooting

**The wheel doesn't open.**
Another resource may fight for the same control. Try `/radial`: if that opens it, the keybind is the issue, so pick another `Config.OpenControl` hash or switch to `Config.OpenKey`. Also note the wheel won't open when every slot of every matching context is hidden (nothing to show = no wheel).

**A slot from an integration doesn't appear.**
The target resource must be **started** (`ensure murphy_clothing` etc.) and the integration enabled in `Config.Integrations`. Context matters too: the doctor sub-menu, for instance, needs you to *be* a doctor with a patient within 3.5 m.

**My icon shows as a broken image.**
The `icon` value must match a PNG file name in `ui/build/assets/icons/` (without `.png`). File names are case-sensitive.

**A slot opens another menu/UI that instantly self-selects something.**
Add `delay = 150` to the slot: the confirming click is bleeding into the next UI.

**The camera spins while the wheel is open / clicks fire my gun.**
Both are locked by the core. If you see this, another resource is re-enabling controls every frame; check for conflicting `EnableControlAction` loops.

## Links

- Documentation & other scripts: **https://docs.murphy-workshop.com**
- Issues & contributions: open an issue or PR on this repository, reports and suggestions are always welcome.

## License

GPL-3.0, see [LICENSE](LICENSE). Free to use, modify, and redistribute under the same license. Not for resale.

\- murphy
