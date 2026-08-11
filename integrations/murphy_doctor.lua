-- murphy_radialmenu -- integration: murphy_doctor
-- "Health" self-check (player / horse / vehicle), "Doctor" sub-menu for
-- practitioners (auscultate / treatment / revive / bandage, patient picked
-- by murphy_doctor's radial bridge), and "HUD" (show/hide + move the
-- metabolism HUD). murphy_doctor detects the wheel at start and routes its
-- doctor actions through it automatically. The server re-validates every
-- action; the gating here is UX only.
-- Disable: Config.Integrations.murphy_doctor = false.

if not RadialIntegrations.enabled('murphy_doctor') then return end

local TARGET = 'murphy_doctor'

local healthSlot = {
  id    = 'health',
  icon  = 'challenge_bandit_1',
  label = 'Health',
  visibleWhen = RadialIntegrations.whenStarted(TARGET),
  action = { type = 'export', value = { TARGET, 'CheckOwnHealth' } },
}

-- IsLocalPlayerDoctorCached is the never-blocking variant -- the raw
-- IsPlayerDoctor() can block on a server round-trip, which would stutter
-- every wheel open. `delay` keeps the confirming click out of the
-- patient-selector NUI each action chains into.
local doctorSlot = {
  id    = 'medic',
  icon  = 'kit_pouch_remedies',
  label = 'Doctor',
  visibleWhen = RadialIntegrations.whenStarted(TARGET, function()
    local isDoc = exports[TARGET]:IsLocalPlayerDoctorCached()
    return isDoc == true and RadialIntegrations.playerNearby(3.5)
  end),
  children = {
    { id = 'med_auscultate', icon = 'challenge_bandit_1', label = 'Auscultate',
      delay = 150,
      action = { type = 'event', value = 'murphy_doctor:client:radialAuscultate' } },
    { id = 'med_treatment', icon = 'document_player_journal', label = 'Treatment',
      delay = 150,
      action = { type = 'event', value = 'murphy_doctor:client:radialTreatment' } },
    { id = 'med_revive', icon = 'consumable_tonic', label = 'Revive',
      delay = 150,
      action = { type = 'event', value = 'murphy_doctor:client:radialRevive' } },
    { id = 'med_bandage', icon = 'consumable_medicine', label = 'Bandage',
      delay = 150,
      action = { type = 'event', value = 'murphy_doctor:client:radialBandage' } },
  },
}

local hudSlot = {
  id    = 'hud',
  icon  = 'settings',
  label = 'HUD',
  visibleWhen = RadialIntegrations.whenStarted(TARGET),
  children = {
    { id = 'hud_toggle', icon = 'document_player_journal', label = 'Show / Hide HUD',
      action = { type = 'callback', value = function()
        local ok, visible = pcall(function() return exports[TARGET]:IsMetabolismVisible() end)
        if not ok then return end
        pcall(function()
          if visible then
            exports[TARGET]:HideMetabolismHUD()
          else
            exports[TARGET]:ShowMetabolismHUD()
          end
        end)
      end } },
    { id = 'hud_edit', icon = 'document_map_generic', label = 'Move HUD',
      action = { type = 'export', value = { TARGET, 'EnableMetabolismEditMode' } } },
  },
}

RadialIntegrations.addSlot('player', healthSlot)
RadialIntegrations.addSlot('horse',  healthSlot)
RadialIntegrations.addSlot('vehicle', healthSlot)

RadialIntegrations.addSlot('player', doctorSlot)

RadialIntegrations.addSlot('player', hudSlot)
RadialIntegrations.addSlot('horse',  hudSlot)
RadialIntegrations.addSlot('vehicle', hudSlot)
