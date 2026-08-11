-- murphy_radialmenu -- integrations/_shared.lua
-- Helpers for the integration files in this folder. Integration files run
-- BEFORE client/client.lua (fxmanifest order), so they can append slots to
-- Config.Menus -- the core clones the catalog when it loads. To write your
-- own, copy one of the murphy_*.lua files and list it in fxmanifest.lua
-- above client/client.lua.

RadialIntegrations = {}

-- True unless explicitly disabled in Config.Integrations (missing key =
-- enabled, so new integration files work without a config edit).
function RadialIntegrations.enabled(name)
  local t = Config.Integrations or {}
  return t[name] ~= false
end

-- Append (or replace, matched by slot id) a slot in a static menu.
function RadialIntegrations.addSlot(menuId, slot)
  local menu = Config.Menus and Config.Menus[menuId]
  if not menu or type(slot) ~= 'table' or not slot.id then return false end
  menu.slots = menu.slots or {}
  for i, s in ipairs(menu.slots) do
    if s.id == slot.id then
      menu.slots[i] = slot
      return true
    end
  end
  menu.slots[#menu.slots + 1] = slot
  return true
end

-- visibleWhen builder: slot shows only while `resource` is running, and
-- (optionally) while the pcall-guarded `extra` predicate holds.
function RadialIntegrations.whenStarted(resource, extra)
  return function()
    if GetResourceState(resource) ~= 'started' then return false end
    if extra then
      local ok, v = pcall(extra)
      return ok and v ~= false
    end
    return true
  end
end

-- True when another player is within `maxDistance` meters.
function RadialIntegrations.playerNearby(maxDistance)
  local myCoords = GetEntityCoords(PlayerPedId())
  local myId = PlayerId()
  for _, p in ipairs(GetActivePlayers()) do
    if p ~= myId and #(myCoords - GetEntityCoords(GetPlayerPed(p))) <= maxDistance then
      return true
    end
  end
  return false
end
