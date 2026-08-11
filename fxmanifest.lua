-- ============================================
-- MURPHY RADIAL MENU
-- Free, standalone, config-driven radial wheel for RedM.
-- Backend orchestrator for the React NUI in ui/build/.
-- Docs: README.md · NUI contract: ui/docs/NUI_CONTRACT.md
-- ============================================

fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'Murphy Workshop'
version '1.0.0'
name 'murphy_radialmenu'
description 'Adaptive radial wheel: config-driven slot catalog by context (player / horse / vehicle), runtime exports for other resources, and drop-in integrations for Murphy Workshop scripts.'

lua54 'yes'

shared_scripts {
  'shared/config.lua',
}

client_scripts {
  -- Integrations append their slots to Config.Menus, so they must load
  -- BEFORE client/client.lua (which clones the catalog at boot). Comment a
  -- line out (or flip its flag in Config.Integrations) to disable one.
  'integrations/_shared.lua',
  'integrations/murphy_clothing.lua',
  'integrations/murphy_doctor.lua',
  'integrations/murphy_craft.lua',

  'client/client.lua',
}

ui_page 'ui/build/index.html'

files {
  'ui/build/index.html',
  'ui/build/config.js',
  'ui/build/failsafe.js',
  'ui/build/assets/**/*',
  'ui/build/images/**/*',
  'ui/build/locales/**/*',
}
