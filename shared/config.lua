-- murphy_radialmenu -- shared config
-- ----------------------------------------------------------------------------
-- Each slot's `action` is one of:
--
--   { type = 'command',     value = 'cmdName' }
--   { type = 'event',       value = 'resource:client:eventName' }
--   { type = 'serverEvent', value = 'resource:server:eventName' }
--   { type = 'export',      value = { 'resource', 'fnName' } }
--   { type = 'callback',    value = function(slotId, path) end }
--
-- Optional `args` array is forwarded to event / serverEvent / export actions.
-- Slots with `children` open a sub-menu in the NUI; their `action` is ignored.
--
-- Optional slot fields:
--   description = '...'    -- helper line under the label on hover
--   disabled = true        -- greyed out, not clickable
--   stayOpen = true        -- run the action but keep the wheel open
--   visibleWhen = fn       -- return false to hide the slot for this open.
--                             Runs on every open: keep it fast, non-blocking.
--   childrenBuilder = fn   -- build `children` at open time from live state
--   delay = <ms>           -- wait before running `action`; use when chaining
--                             into another NUI so the confirming click doesn't
--                             bleed into it
--
-- Icons: file name (no extension) of a PNG in ui/build/assets/icons/,
-- rendered in white. Full reference: README.md.
-- ----------------------------------------------------------------------------

Config = {}

-- UI chrome language (must match a file in ui/build/locales/*.js).
-- Bundled: en, fr, ar, cs, de, es, hu, it, ja, ko, nl, pl, pt-BR, ro, ru,
-- sv, tr, uk, zh-CN, zh-TW. Slot labels are plain strings -- translate them
-- directly in this file / the integrations.
Config.Locale = 'en'

-- Control that opens the wheel. Set ONE of:
--   Config.OpenControl = <hash> -- RDR3 control hash, TOGGLE (press to open,
--                                  press to close). Use for mouse buttons.
--   Config.OpenKey     = 'B'    -- keyboard key, HOLD-to-show. Accepts A-Z,
--                                  0-9, F1-F12, TAB, SPACE, LSHIFT, LCTRL...
-- Default: middle mouse click (INPUT_ATTACK2). Its native effect (secondary
-- attack) is suppressed while this resource owns the bind.
Config.OpenControl = 0xCEE12B50
-- Config.OpenKey = 'B'

-- Optional keys that open a specific wheel directly, skipping the context
-- wheel (hold-to-show, like Config.OpenKey). Menu ids are keys of
-- Config.Menus — integrations register theirs too (e.g. murphy_clothing
-- registers `clothing`). The same menus are also reachable with
-- `/radial <menuId>`.
Config.DirectMenuKeys = {
  -- clothing = 'J',
}

-- Ragdoll keybind (single tap in / out). The /ragdoll command and wheel
-- slots work even when the keybind is disabled.
Config.Ragdoll = {
  Enabled = false,
  Key     = 'X',
}

-- Built-in integrations (files in integrations/). Slots only show while the
-- target resource is running, so leaving everything `true` is safe on any
-- server. `false` hard-disables the file.
Config.Integrations = {
  murphy_clothing = true,    -- clothing quick-toggles sub-menu (on foot + mounted)
  murphy_doctor   = true,    -- health self-check, doctor actions, metabolism HUD
  murphy_craft    = true,    -- open the crafting menu
}

-- First matching context wins; a context whose menu has no visible slots
-- falls through to the next one. Runtime override:
--   exports.murphy_radialmenu:setContextResolver(function() return 'menuId' end)
Config.Contexts = {
  { menuId = 'horse',   when = function(ped) return IsPedOnMount(ped) end },
  { menuId = 'vehicle', when = function(ped) return IsPedInAnyVehicle(ped, false) end },
  { menuId = 'player',  when = function(_)   return true end },
}

-- Menu catalog: each menu is `{ title?, logo?, slots = { ... } }`. The menus
-- ship almost empty on purpose -- integrations/ append their slots at load
-- time; add yours here or from your own resources via
--   exports.murphy_radialmenu:registerSlot('player', { ... })
Config.Menus = {

  -- ON FOOT --------------------------------------------------------------
  player = {
    title = 'Player',
    slots = {
      { id = 'ragdoll', icon = 'emote_reaction_amazed_1', label = 'Ragdoll',
        action = { type = 'command', value = 'ragdoll' } },

      -- Example slot -- uncomment and adapt.
      -- { id = 'emotes', icon = 'emote_dance_wild_a', label = 'Emotes',
      --   children = {
      --     { id = 'dance', icon = 'emote_dance_formal_a', label = 'Dance',
      --       description = 'One little jig',
      --       action = { type = 'command', value = 'dance' } },
      --     { id = 'wave',  icon = 'emote_action_stop_here', label = 'Wave',
      --       stayOpen = true,
      --       action = { type = 'event', value = 'myemotes:client:play', args = { 'wave' } } },
      --   } },
    },
  },

  -- MOUNTED --------------------------------------------------------------
  -- Empty by default: integrations add their mounted slots here. While it
  -- stays empty, opening from the saddle falls through to `player`.
  horse = {
    title = 'Horse',
    slots = {},
  },

  -- IN A VEHICLE / WAGON --------------------------------------------------
  vehicle = {
    title = 'Wagon',
    slots = {},
  },

}
