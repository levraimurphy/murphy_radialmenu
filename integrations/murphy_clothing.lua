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

  if hasCat('shirts_full') then
    children[#children + 1] = {
      id = 'sleeve', icon = 'clothing_generic_shirt', label = 'Sleeves',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleSleeve' } },
    }
    children[#children + 1] = {
      id = 'collar', icon = 'clothing_generic_shirt', label = 'Collar',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleCollar' } },
    }
  end
  if hasCat('neckwear') then
    children[#children + 1] = {
      id = 'bandana_up', icon = 'clothing_generic_neckerchief', label = 'Bandana',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleNeckwearUp' } },
    }
  end
  if hasCat('boots') then
    children[#children + 1] = {
      id = 'boots_under', icon = 'clothing_generic_boots', label = 'Boots',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleBootsUnder' } },
    }
  end
  if hasCat('vests') then
    children[#children + 1] = {
      id = 'vest_under', icon = 'clothing_generic_vest', label = 'Vest',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleVestUnder' } },
    }
  end
  if hasCat('loadouts') then
    children[#children + 1] = {
      id = 'loadout_side', icon = 'clothing_generic_gunbelt', label = 'Gunbelt Side',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleLoadoutSide' } },
    }
  end
  if hasCat('hair') then
    children[#children + 1] = {
      id = 'hair_pomade', icon = 'kit_shaving_kit', label = 'Pomade',
      stayOpen = true,
      action = { type = 'export', value = { TARGET, 'ToggleHairPomade' } },
    }
  end

  local ok, worn = pcall(function()
    return exports[TARGET]:GetWornClothingCategories()
  end)
  worn = (ok and type(worn) == 'table') and worn or {}
  for _, category in ipairs(worn) do
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
