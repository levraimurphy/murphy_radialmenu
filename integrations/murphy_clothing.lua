-- murphy_radialmenu -- integration: murphy_clothing
-- "Clothing" sub-menu on the `player` and `horse` wheels, built at open time
-- from what the character wears: wearable-state toggles (sleeves, collar,
-- bandana, boots/vest over-under, gunbelt side, pomade), one on/off toggle
-- per worn category, and "Get Naked". Pure wiring to murphy_clothing's
-- exports. Disable: Config.Integrations.murphy_clothing = false.

if not RadialIntegrations.enabled('murphy_clothing') then return end

local TARGET = 'murphy_clothing'

-- MetaPed category -> wheel label + icon. Categories missing from this
-- catalog don't get a removal toggle.
local CATALOG = {
  hats             = { label = 'Hat',          icon = 'clothing_generic_hat'         },
  headwear         = { label = 'Headwear',     icon = 'clothing_generic_hat'         },
  hat_accessories  = { label = 'Hat Accessory', icon = 'clothing_generic_hat'        },
  masks            = { label = 'Mask',         icon = 'clothing_generic_mask'        },
  eyewear          = { label = 'Eyewear',      icon = 'clothing_generic_outfit'      },
  shirts_full      = { label = 'Shirt',        icon = 'clothing_generic_shirt'       },
  vests            = { label = 'Vest',         icon = 'clothing_generic_vest'        },
  coats            = { label = 'Coat',         icon = 'clothing_generic_coat'        },
  coats_closed     = { label = 'Coat',         icon = 'clothing_generic_coat'        },
  coats_heavy      = { label = 'Heavy Coat',   icon = 'clothing_generic_coat'        },
  cloaks           = { label = 'Cloak',        icon = 'clothing_generic_cloak'       },
  ponchos          = { label = 'Poncho',       icon = 'clothing_generic_cloak'       },
  capes            = { label = 'Cape',         icon = 'clothing_generic_cloak'       },
  gloves           = { label = 'Gloves',       icon = 'clothing_generic_glove'       },
  gauntlets        = { label = 'Gauntlets',    icon = 'clothing_generic_glove'       },
  pants            = { label = 'Pants',        icon = 'clothing_generic_pants'       },
  chaps            = { label = 'Chaps',        icon = 'clothing_generic_chaps'       },
  spats            = { label = 'Spats',        icon = 'clothing_generic_spats'       },
  boots            = { label = 'Boots',        icon = 'clothing_generic_boots'       },
  boot_accessories = { label = 'Spurs',        icon = 'clothing_generic_boots'       },
  gunbelts         = { label = 'Gunbelt',      icon = 'clothing_generic_gunbelt'     },
  gunbelt_accs     = { label = 'Holster',      icon = 'clothing_generic_gunbelt'     },
  neckwear         = { label = 'Neckwear',     icon = 'clothing_generic_neckerchief' },
  neckerchiefs     = { label = 'Neckerchief',  icon = 'clothing_generic_neckerchief' },
  neckties         = { label = 'Necktie',      icon = 'clothing_generic_neckerchief' },
  accessories      = { label = 'Accessories',  icon = 'clothing_generic_outfit'      },
  satchels         = { label = 'Satchel',      icon = 'kit_pouch_kit'                },
  suspenders       = { label = 'Suspenders',   icon = 'clothing_generic_suspenders'  },
  badges           = { label = 'Badge',        icon = 'provision_deputy_star'        },
  aprons           = { label = 'Apron',        icon = 'clothing_generic_dress'       },
}

-- HasWearableCategory is true only for MP shop items -- SP / NPC items don't
-- declare wearable states, so gating on it hides buttons that would no-op.
local function hasCat(category)
  local ok, has = pcall(function()
    return exports[TARGET]:HasWearableCategory(category)
  end)
  return ok and has == true
end

local function buildClothingChildren()
  local children = {}

  local ok, worn = pcall(function()
    return exports[TARGET]:GetWornClothingCategories()
  end)
  worn = (ok and type(worn) == 'table') and worn or {}
  local wornSet = {}
  for _, category in ipairs(worn) do wornSet[category] = true end

  local function stateChild(id, icon, label, exportName)
    return {
      id = id, icon = icon, label = label, stayOpen = true,
      action = { type = 'export', value = { TARGET, exportName } },
    }
  end
  local function removalChild(category, icon)
    return {
      id       = category,
      icon     = icon,
      label    = 'Remove / Put back',
      stayOpen = true,
      action   = { type = 'export',
                   value = { TARGET, 'ToggleClothingComponent' },
                   args  = { category } },
    }
  end

  -- Categories that carry per-item state toggles get ONE slot each, opening
  -- a sub-wheel with their actions -- the item appears on the wheel once
  -- instead of one entry per action.

  -- Shirt: Sleeves / Collar / Remove.
  do
    local sub = {}
    if hasCat('shirts_full') then
      sub[#sub + 1] = stateChild('sleeve', 'clothing_generic_shirt', 'Sleeves', 'ToggleSleeve')
      sub[#sub + 1] = stateChild('collar', 'clothing_generic_shirt', 'Collar', 'ToggleCollar')
    end
    if wornSet.shirts_full then
      sub[#sub + 1] = removalChild('shirts_full', 'clothing_generic_shirt')
    end
    if #sub > 0 then
      children[#children + 1] = { id = 'shirt', icon = 'clothing_generic_shirt', label = 'Shirt', children = sub }
    end
  end

  -- Vest: Tuck / Remove.
  do
    local sub = {}
    if hasCat('vests') then
      sub[#sub + 1] = stateChild('vest_under', 'clothing_generic_vest', 'Tuck In / Out', 'ToggleVestUnder')
    end
    if wornSet.vests then
      sub[#sub + 1] = removalChild('vests', 'clothing_generic_vest')
    end
    if #sub > 0 then
      children[#children + 1] = { id = 'vest', icon = 'clothing_generic_vest', label = 'Vest', children = sub }
    end
  end

  -- Neckwear: Raise / Remove. Bandana items live in `neckwear`, kerchiefs in
  -- `neckerchiefs` -- the raise toggle handles both, so gate on either.
  local neckCat = (wornSet.neckwear and 'neckwear')
    or (wornSet.neckerchiefs and 'neckerchiefs')
    or (wornSet.neckties and 'neckties')
  do
    local sub = {}
    if hasCat('neckwear') or hasCat('neckerchiefs') then
      sub[#sub + 1] = stateChild('bandana_up', 'clothing_generic_neckerchief', 'Raise / Lower', 'ToggleNeckwearUp')
    end
    if neckCat then
      sub[#sub + 1] = removalChild(neckCat, 'clothing_generic_neckerchief')
    end
    if #sub > 0 then
      children[#children + 1] = { id = 'neckwear_menu', icon = 'clothing_generic_neckerchief', label = 'Neckwear', children = sub }
    end
  end

  -- Boots: Over-Under / Remove.
  do
    local sub = {}
    if hasCat('boots') then
      sub[#sub + 1] = stateChild('boots_under', 'clothing_generic_boots', 'Over / Under Pants', 'ToggleBootsUnder')
    end
    if wornSet.boots then
      sub[#sub + 1] = removalChild('boots', 'clothing_generic_boots')
    end
    if #sub > 0 then
      children[#children + 1] = { id = 'boots_menu', icon = 'clothing_generic_boots', label = 'Boots', children = sub }
    end
  end

  if hasCat('loadouts') then
    children[#children + 1] = stateChild('loadout_side', 'clothing_generic_gunbelt', 'Gunbelt Side', 'ToggleLoadoutSide')
  end
  if hasCat('hair') then
    children[#children + 1] = stateChild('hair_pomade', 'kit_shaving_kit', 'Pomade', 'ToggleHairPomade')
  end

  -- Every other worn category keeps its flat one-touch removal toggle.
  local grouped = { shirts_full = true, vests = true, boots = true }
  if neckCat then grouped[neckCat] = true end
  for _, category in ipairs(worn) do
    if not grouped[category] then
      local entry = CATALOG[category]
      if entry then
        children[#children + 1] = {
          id       = category,
          icon     = entry.icon,
          label    = entry.label,
          stayOpen = true,
          action   = { type = 'export',
                       value = { TARGET, 'ToggleClothingComponent' },
                       args  = { category } },
        }
      end
    end
  end

  children[#children + 1] = {
    id = 'naked', icon = 'clothing_generic_outfit', label = 'Get Naked',
    stayOpen = true,
    action = { type = 'export', value = { TARGET, 'ToggleNaked' }, args = { true } },
  }
  return children
end

local clothingSlot = {
  id    = 'clothing',
  icon  = 'kit_wardrobe',
  label = 'Clothing',
  visibleWhen     = RadialIntegrations.whenStarted(TARGET),
  childrenBuilder = buildClothingChildren,
}

-- Same sub-menu on foot and in the saddle; the core deep-copies the catalog
-- at boot, so the two menus never share state.
RadialIntegrations.addSlot('player', clothingSlot)
RadialIntegrations.addSlot('horse',  clothingSlot)

-- Direct-access wheel: `/radial clothing` (or a Config.DirectMenuKeys bind)
-- opens the clothing actions as their own wheel, skipping the player wheel.
if Config.Menus and not Config.Menus.clothing then
  Config.Menus.clothing = {
    title = 'Clothing',
    slotsBuilder = function()
      if GetResourceState(TARGET) ~= 'started' then return {} end
      return buildClothingChildren()
    end,
  }
end
