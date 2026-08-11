-- murphy_radialmenu -- integration: murphy_craft
-- "Craft" slot on the `player` wheel: same entry point as murphy_craft's
-- keybind, so nearby stations / tables and specializations are honored.
-- Disable: Config.Integrations.murphy_craft = false.

if not RadialIntegrations.enabled('murphy_craft') then return end

RadialIntegrations.addSlot('player', {
  id    = 'craft',
  icon  = 'butcher_table_production',
  label = 'Craft',
  visibleWhen = RadialIntegrations.whenStarted('murphy_craft'),
  action = { type = 'event', value = 'murphy_craft:OpenCraftMenu' },
})
