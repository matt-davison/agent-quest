#!/usr/bin/env node

/**
 * Player State Validator
 *
 * Deep validation of player state including:
 * - Inventory (items exist, quantities valid, slot limits)
 * - Equipped items (type matching, exist in inventory)
 * - Abilities (both legacy and new formats)
 * - Stats (ranges, required fields)
 * - Resources (HP, gold, willpower)
 * - Progression (level, xp, tier)
 * - Alignment (valid values, axes ranges)
 * - Afflictions (structure)
 * - Chronicle and decisions (format)
 *
 * Usage: node scripts/validate-player-state.js [--verbose] [--world=<name>]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const WORLDS_FILE = 'worlds.yaml';

// Errors and warnings
const errors = [];
const warnings = [];
let verbose = false;

// Valid alignment values
const VALID_PRIMARY_ALIGNMENTS = ['altruistic', 'ruthless', 'pragmatic', 'curious', 'cautious', 'neutral'];
const VALID_AFFLICTION_CATEGORIES = ['physical', 'substance', 'spatial', 'mental', 'curse', 'divine', 'weave', 'environmental'];

function error(file, message) {
  errors.push({ file, message });
}

function warn(file, message) {
  warnings.push({ file, message });
}

function log(message) {
  if (verbose) console.log(`  ${message}`);
}

/**
 * Load a YAML file safely
 */
function loadYaml(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    error(filePath, `Failed to parse YAML: ${e.message}`);
    return null;
  }
}

/**
 * Load worlds configuration
 */
function loadWorlds() {
  if (!fs.existsSync(WORLDS_FILE)) {
    console.error('Error: worlds.yaml not found');
    process.exit(1);
  }
  const content = fs.readFileSync(WORLDS_FILE, 'utf8');
  const worldsConfig = yaml.load(content);
  return Object.keys(worldsConfig.worlds || {});
}

/**
 * Get all directories in a path
 */
function getDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

/**
 * Get all files in directory (recursive)
 */
function getFiles(dir, extension = '.yaml') {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getFiles(fullPath, extension));
    } else if (item.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Build item lookup from database
 * Returns: { byName: Map<name -> item>, byId: Map<id -> item> }
 */
function buildItemLookup(worldDir) {
  const itemsDir = path.join(worldDir, 'items', 'database');
  const lookup = { byName: new Map(), byId: new Map() };

  if (!fs.existsSync(itemsDir)) {
    warn(itemsDir, 'Items database directory not found');
    return lookup;
  }

  const itemFiles = getFiles(itemsDir);
  for (const itemFile of itemFiles) {
    const item = loadYaml(itemFile);
    if (!item) continue;

    if (item.id) {
      lookup.byId.set(item.id, item);
    }
    if (item.name) {
      // Normalize name for lookup (lowercase, replace spaces with underscores)
      const normalizedName = item.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
      lookup.byName.set(normalizedName, item);
      // Also store original name
      lookup.byName.set(item.name.toLowerCase(), item);
    }
  }

  log(`Loaded ${lookup.byId.size} items from database`);
  return lookup;
}

/**
 * Build ability lookup from database
 * Returns: Map<id -> ability>
 */
function buildAbilityLookup(worldDir) {
  const abilitiesDir = path.join(worldDir, 'abilities', 'database');
  const lookup = new Map();

  if (!fs.existsSync(abilitiesDir)) {
    warn(abilitiesDir, 'Abilities database directory not found');
    return lookup;
  }

  const abilityFiles = getFiles(abilitiesDir);
  for (const abilityFile of abilityFiles) {
    const ability = loadYaml(abilityFile);
    if (!ability) continue;

    if (ability.id) {
      lookup.set(ability.id, ability);
    }
  }

  log(`Loaded ${lookup.size} abilities from database`);
  return lookup;
}

/**
 * Normalize an item name for lookup
 */
function normalizeItemName(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
}

/**
 * Find an item by name or ID
 */
function findItem(itemLookup, nameOrId) {
  // Try by ID first
  if (itemLookup.byId.has(nameOrId)) {
    return itemLookup.byId.get(nameOrId);
  }

  // Try by normalized name
  const normalized = normalizeItemName(nameOrId);
  if (itemLookup.byName.has(normalized)) {
    return itemLookup.byName.get(normalized);
  }

  // Try lowercase
  if (itemLookup.byName.has(nameOrId.toLowerCase())) {
    return itemLookup.byName.get(nameOrId.toLowerCase());
  }

  return null;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate inventory items and quantities
 */
function validateInventory(personaFile, persona, itemLookup) {
  if (!persona.inventory) return;

  // Handle empty inventory
  if (Array.isArray(persona.inventory) && persona.inventory.length === 0) {
    log('Inventory is empty');
    return;
  }

  const inventoryItems = new Map(); // name/id -> total quantity

  for (const item of persona.inventory) {
    if (item === null) continue; // Skip null entries

    let itemName, quantity;

    if (typeof item === 'object') {
      // Could be { name: qty } or { id, qty }
      if (item.id) {
        // New format: { id, qty }
        itemName = item.id;
        quantity = item.qty || 1;
      } else {
        // Old format: { name: qty }
        const keys = Object.keys(item);
        if (keys.length === 0) continue;
        itemName = keys[0];
        quantity = item[itemName];
      }
    } else if (typeof item === 'string') {
      itemName = item;
      quantity = 1;
    } else {
      warn(personaFile, `Invalid inventory item format: ${JSON.stringify(item)}`);
      continue;
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
      error(personaFile, `Invalid quantity for "${itemName}": ${quantity} (must be positive integer)`);
    }

    // Check if item exists in database
    const foundItem = findItem(itemLookup, itemName);
    if (!foundItem) {
      warn(personaFile, `Inventory item "${itemName}" not found in items database`);
    }

    // Track for slot counting
    const existingQty = inventoryItems.get(itemName) || 0;
    inventoryItems.set(itemName, existingQty + (quantity || 1));
  }

  // Validate inventory slot limits
  // Voidwalker gets 15 slots, others get 10
  const defaultSlots = (persona.class && persona.class.toLowerCase() === 'voidwalker') ? 15 : 10;
  const maxSlots = persona.inventory_slots || defaultSlots;
  const totalItems = inventoryItems.size;

  if (totalItems > maxSlots) {
    error(personaFile, `Inventory has ${totalItems} unique items but only ${maxSlots} slots`);
  }
}

/**
 * Validate equipped items
 */
function validateEquipped(personaFile, persona, itemLookup) {
  if (!persona.equipped) return;

  const { weapon, armor, accessory } = persona.equipped;

  // Build set of inventory item names/ids
  const inventorySet = new Set();
  if (persona.inventory && Array.isArray(persona.inventory)) {
    for (const item of persona.inventory) {
      if (item === null) continue;
      if (typeof item === 'object') {
        if (item.id) {
          inventorySet.add(item.id);
        } else {
          const keys = Object.keys(item);
          if (keys.length > 0) inventorySet.add(keys[0]);
        }
      } else if (typeof item === 'string') {
        inventorySet.add(item);
      }
    }
  }

  // Validate weapon slot
  if (weapon && weapon !== '' && weapon !== null) {
    if (!inventorySet.has(weapon)) {
      error(personaFile, `Equipped weapon "${weapon}" not found in inventory`);
    } else {
      const item = findItem(itemLookup, weapon);
      if (item && item.type !== 'weapon') {
        error(personaFile, `Equipped weapon "${weapon}" has type "${item.type}" (expected "weapon")`);
      }
    }
  }

  // Validate armor slot
  if (armor && armor !== '' && armor !== null) {
    if (!inventorySet.has(armor)) {
      error(personaFile, `Equipped armor "${armor}" not found in inventory`);
    } else {
      const item = findItem(itemLookup, armor);
      if (item && item.type !== 'armor') {
        error(personaFile, `Equipped armor "${armor}" has type "${item.type}" (expected "armor")`);
      }
    }
  }

  // Validate accessory slot
  if (accessory && accessory !== '' && accessory !== null) {
    if (!inventorySet.has(accessory)) {
      error(personaFile, `Equipped accessory "${accessory}" not found in inventory`);
    } else {
      const item = findItem(itemLookup, accessory);
      if (item) {
        // Accessory can be misc+accessory subtype, or type accessory
        const isValidAccessory = (item.type === 'misc' && item.subtype === 'accessory') ||
                                 item.type === 'accessory' ||
                                 item.subtype === 'tool'; // Tools can be accessories
        if (!isValidAccessory) {
          warn(personaFile, `Equipped accessory "${accessory}" has type "${item.type}/${item.subtype}" (expected misc/accessory or accessory type)`);
        }
      }
    }
  }
}

/**
 * Validate abilities (supports both legacy and new formats)
 */
function validateAbilities(personaFile, persona, abilityLookup) {
  if (!persona.abilities) return;

  // New format: abilities.known array
  if (persona.abilities.known && Array.isArray(persona.abilities.known)) {
    for (const entry of persona.abilities.known) {
      if (typeof entry === 'string') {
        // Simple string ID
        if (!abilityLookup.has(entry)) {
          warn(personaFile, `Ability "${entry}" not found in abilities database`);
        }
      } else if (typeof entry === 'object' && entry.id) {
        const abilityId = entry.id;
        const ability = abilityLookup.get(abilityId);

        if (!ability) {
          // Some abilities might be custom (e.g., "void-step", "shadow-meld")
          // Only warn, don't error, as these could be valid custom abilities
          warn(personaFile, `Ability "${abilityId}" not found in abilities database (may be custom)`);
          continue;
        }

        // Validate level exists
        if (entry.level && ability.levels) {
          if (!ability.levels[entry.level]) {
            error(personaFile, `Ability "${ability.name}" (${abilityId}) doesn't have level ${entry.level}`);
          }
        }

        // Check class restriction
        if (ability.class && persona.class) {
          if (ability.class.toLowerCase() !== persona.class.toLowerCase()) {
            warn(personaFile, `Ability "${ability.name}" is for ${ability.class}, but persona is ${persona.class}`);
          }
        }
      }
    }
  }

  // Legacy format validation
  if (persona.abilities.passive && typeof persona.abilities.passive === 'string') {
    log(`Legacy passive ability: ${persona.abilities.passive}`);
  }

  // Validate usage tracking arrays
  const usageArrays = ['used_this_location', 'used_this_session', 'used_this_combat'];
  for (const arrayName of usageArrays) {
    if (persona.abilities[arrayName] && !Array.isArray(persona.abilities[arrayName])) {
      error(personaFile, `abilities.${arrayName} should be an array`);
    }
  }

  // Validate usage tracking objects (new format)
  if (persona.abilities.usage) {
    const usageCategories = ['combat', 'short_rest', 'long_rest', 'location', 'daily'];
    for (const category of usageCategories) {
      if (persona.abilities.usage[category] && typeof persona.abilities.usage[category] !== 'object') {
        error(personaFile, `abilities.usage.${category} should be an object`);
      }
    }
  }

  // Validate active_effects is array
  if (persona.abilities.active_effects && !Array.isArray(persona.abilities.active_effects)) {
    error(personaFile, 'abilities.active_effects should be an array');
  }
}

/**
 * Validate stats
 */
function validateStats(personaFile, persona) {
  if (!persona.stats) {
    error(personaFile, 'Missing stats block');
    return;
  }

  // Check required stats (accepts both might/strength naming)
  const hasStrength = typeof persona.stats.strength === 'number' || typeof persona.stats.might === 'number';
  const hasAgility = typeof persona.stats.agility === 'number';
  const hasSpirit = typeof persona.stats.spirit === 'number';
  const hasMind = typeof persona.stats.mind === 'number';

  if (!hasStrength) error(personaFile, 'Missing stat: strength (or might)');
  if (!hasAgility) error(personaFile, 'Missing stat: agility');
  if (!hasSpirit) error(personaFile, 'Missing stat: spirit');
  if (!hasMind) error(personaFile, 'Missing stat: mind');

  // Validate stat ranges (1-30)
  const statFields = ['strength', 'might', 'agility', 'spirit', 'mind'];
  for (const stat of statFields) {
    const value = persona.stats[stat];
    if (typeof value === 'number') {
      if (value < 1 || value > 30) {
        warn(personaFile, `Stat ${stat} (${value}) outside expected range (1-30)`);
      }
    }
  }

  // Check if total stats seem reasonable for level
  const level = persona.progression?.level || 1;
  const strength = persona.stats.strength || persona.stats.might || 10;
  const agility = persona.stats.agility || 10;
  const mind = persona.stats.mind || 10;
  const spirit = persona.stats.spirit || 10;
  const total = strength + agility + mind + spirit;

  // Base 40 + 10 bonus + up to 5 class bonus + (level-1) level points
  const expectedBase = 40 + 10 + 5; // 55 at level 1
  const expectedMax = expectedBase + (level - 1) * 2 + 5; // Allow some variance

  if (total > expectedMax + 10) {
    warn(personaFile, `Total stats (${total}) seem high for level ${level}`);
  }
}

/**
 * Validate resources (HP, gold, willpower)
 */
function validateResources(personaFile, persona) {
  // HP validation - check both top-level and in resources
  const hp = persona.hp ?? persona.resources?.hp;
  const maxHp = persona.max_hp ?? persona.resources?.max_hp;

  if (hp !== undefined && maxHp !== undefined) {
    if (hp > maxHp) {
      error(personaFile, `HP (${hp}) exceeds max HP (${maxHp})`);
    }
    if (hp < -10) {
      warn(personaFile, `HP (${hp}) below death threshold (-10), character should be dead`);
    }
  }

  // Gold validation
  const gold = persona.gold ?? persona.resources?.gold;
  if (typeof gold === 'number' && gold < 0) {
    error(personaFile, `Negative gold: ${gold}`);
  }

  // Willpower validation
  if (persona.resources) {
    const willpower = persona.resources.willpower;
    const maxWillpower = persona.resources.max_willpower;
    const multiplier = persona.resources.willpower_multiplier;
    const spirit = persona.stats?.spirit || 10;

    if (willpower !== undefined && maxWillpower !== undefined) {
      if (willpower > maxWillpower) {
        error(personaFile, `Willpower (${willpower}) exceeds max willpower (${maxWillpower})`);
      }
      if (willpower < 0) {
        error(personaFile, `Negative willpower: ${willpower}`);
      }
    }

    // Validate max_willpower calculation
    if (maxWillpower !== undefined && multiplier !== undefined) {
      const expectedMax = spirit * multiplier;
      // Allow small variance (could be rounded or have bonuses)
      if (Math.abs(maxWillpower - expectedMax) > 5) {
        warn(personaFile, `max_willpower (${maxWillpower}) doesn't match spirit(${spirit}) × multiplier(${multiplier}) = ${expectedMax}`);
      }
    }
  }
}

/**
 * Validate progression (level, xp, tier)
 */
function validateProgression(personaFile, persona) {
  if (!persona.progression) return;

  const { level, xp, xp_to_next, tier, stat_points } = persona.progression;

  // Level validation
  if (typeof level === 'number') {
    if (level < 1 || level > 10) {
      warn(personaFile, `Level ${level} outside expected range (1-10)`);
    }
  }

  // XP validation
  if (typeof xp === 'number' && typeof xp_to_next === 'number') {
    if (xp >= xp_to_next) {
      warn(personaFile, `XP (${xp}) >= XP to next level (${xp_to_next}), should level up`);
    }
  }

  // Tier validation
  if (typeof tier === 'number' && typeof level === 'number') {
    const expectedTier = Math.ceil(level / 3);
    if (tier !== expectedTier && tier !== expectedTier - 1) {
      warn(personaFile, `Tier ${tier} doesn't match expected tier for level ${level}`);
    }
  }

  // Stat points validation
  if (typeof stat_points === 'number' && stat_points < 0) {
    error(personaFile, `Negative stat_points: ${stat_points}`);
  }
}

/**
 * Validate alignment
 */
function validateAlignment(personaFile, persona) {
  if (!persona.alignment) return;

  const { primary, secondary, axes } = persona.alignment;

  // Validate primary alignment
  if (primary && !VALID_PRIMARY_ALIGNMENTS.includes(primary)) {
    error(personaFile, `Invalid primary alignment: "${primary}". Valid values: ${VALID_PRIMARY_ALIGNMENTS.join(', ')}`);
  }

  // Secondary can be null or a valid alignment
  if (secondary !== null && secondary !== undefined && !VALID_PRIMARY_ALIGNMENTS.includes(secondary)) {
    error(personaFile, `Invalid secondary alignment: "${secondary}". Valid values: ${VALID_PRIMARY_ALIGNMENTS.join(', ')}`);
  }

  // Validate axes ranges (-10 to +10)
  if (axes) {
    const axisNames = ['empathy', 'order', 'risk'];
    for (const axis of axisNames) {
      const value = axes[axis];
      if (typeof value === 'number') {
        if (value < -10 || value > 10) {
          error(personaFile, `Alignment axis "${axis}" (${value}) outside range (-10 to +10)`);
        }
      }
    }
  }

  // Validate history is array
  if (persona.alignment.history && !Array.isArray(persona.alignment.history)) {
    error(personaFile, 'alignment.history should be an array');
  }
}

/**
 * Validate afflictions
 */
function validateAfflictions(personaFile, persona) {
  if (!persona.afflictions) return;

  if (!Array.isArray(persona.afflictions)) {
    error(personaFile, 'afflictions should be an array');
    return;
  }

  for (const affliction of persona.afflictions) {
    if (typeof affliction !== 'object') {
      error(personaFile, `Invalid affliction format: ${JSON.stringify(affliction)}`);
      continue;
    }

    // Required fields
    if (!affliction.name) {
      error(personaFile, 'Affliction missing required field: name');
    }
    if (!affliction.category) {
      error(personaFile, `Affliction "${affliction.name}" missing required field: category`);
    } else if (!VALID_AFFLICTION_CATEGORIES.includes(affliction.category)) {
      warn(personaFile, `Affliction "${affliction.name}" has unknown category: "${affliction.category}"`);
    }
    if (!affliction.effect) {
      error(personaFile, `Affliction "${affliction.name}" missing required field: effect`);
    }

    // Duration tracking
    if (affliction.duration && affliction.duration !== 'permanent' && affliction.duration !== 'permanent until cured') {
      // Should have days_remaining or similar tracking
      log(`Affliction "${affliction.name}" has duration: ${affliction.duration}`);
    }
  }
}

/**
 * Validate chronicle entries
 */
function validateChronicle(personaFile, persona) {
  if (!persona.chronicle) return;

  if (!Array.isArray(persona.chronicle)) {
    error(personaFile, 'chronicle should be an array');
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (let i = 0; i < persona.chronicle.length; i++) {
    const entry = persona.chronicle[i];
    if (typeof entry !== 'object') {
      error(personaFile, `Chronicle entry ${i} is not an object`);
      continue;
    }

    // Date format validation
    if (entry.date && !dateRegex.test(entry.date)) {
      warn(personaFile, `Chronicle entry ${i} has invalid date format: "${entry.date}" (expected YYYY-MM-DD)`);
    }

    // Event field required
    if (!entry.event) {
      error(personaFile, `Chronicle entry ${i} missing event field`);
    }
  }
}

/**
 * Validate decisions
 */
function validateDecisions(personaFile, persona) {
  if (!persona.decisions) return;

  if (!Array.isArray(persona.decisions)) {
    error(personaFile, 'decisions should be an array');
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (let i = 0; i < persona.decisions.length; i++) {
    const decision = persona.decisions[i];
    if (typeof decision !== 'object') {
      error(personaFile, `Decision ${i} is not an object`);
      continue;
    }

    // Date format validation
    if (decision.date && !dateRegex.test(decision.date)) {
      warn(personaFile, `Decision ${i} has invalid date format: "${decision.date}" (expected YYYY-MM-DD)`);
    }

    // Alignment value validation
    if (decision.alignment && !['lawful', 'chaotic', 'neutral', 'good', 'evil', ...VALID_PRIMARY_ALIGNMENTS].includes(decision.alignment)) {
      warn(personaFile, `Decision ${i} has unusual alignment value: "${decision.alignment}"`);
    }
  }
}

// ============================================================================
// MAIN VALIDATION LOOP
// ============================================================================

/**
 * Validate all personas in a world
 */
function validateWorld(world) {
  const worldDir = path.join('worlds', world);
  const playersDir = path.join(worldDir, 'players');

  if (!fs.existsSync(playersDir)) {
    warn(playersDir, 'Players directory not found');
    return 0;
  }

  // Build lookups
  const itemLookup = buildItemLookup(worldDir);
  const abilityLookup = buildAbilityLookup(worldDir);

  const players = getDirs(playersDir);
  let personaCount = 0;

  for (const github of players) {
    const personasDir = path.join(playersDir, github, 'personas');
    if (!fs.existsSync(personasDir)) continue;

    const personas = getDirs(personasDir);
    for (const personaName of personas) {
      const personaFile = path.join(personasDir, personaName, 'persona.yaml');
      const persona = loadYaml(personaFile);
      if (!persona) continue;

      personaCount++;
      log(`Validating: ${persona.name || personaName}`);

      // Run all validations
      validateStats(personaFile, persona);
      validateResources(personaFile, persona);
      validateProgression(personaFile, persona);
      validateInventory(personaFile, persona, itemLookup);
      validateEquipped(personaFile, persona, itemLookup);
      validateAbilities(personaFile, persona, abilityLookup);
      validateAlignment(personaFile, persona);
      validateAfflictions(personaFile, persona);
      validateChronicle(personaFile, persona);
      validateDecisions(personaFile, persona);
    }
  }

  return personaCount;
}

/**
 * Main entry point
 */
function main() {
  verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  // Check for world filter
  let worldFilter = null;
  for (const arg of process.argv) {
    if (arg.startsWith('--world=')) {
      worldFilter = arg.split('=')[1];
    }
  }

  console.log('Player State Validator');
  console.log('======================\n');

  const worlds = loadWorlds();
  const targetWorlds = worldFilter ? [worldFilter] : worlds;

  if (worldFilter && !worlds.includes(worldFilter)) {
    console.error(`Error: World "${worldFilter}" not found in worlds.yaml`);
    process.exit(1);
  }

  console.log(`Validating ${targetWorlds.length} world(s): ${targetWorlds.join(', ')}\n`);

  let totalPersonas = 0;
  for (const world of targetWorlds) {
    console.log(`\n=== World: ${world} ===\n`);
    const count = validateWorld(world);
    totalPersonas += count;
    console.log(`  Validated ${count} persona(s)`);
  }

  // Output results
  console.log('\n\nResults');
  console.log('-------');
  console.log(`Total personas validated: ${totalPersonas}`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [WARN] ${w.file}: ${w.message}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  [ERROR] ${e.file}: ${e.message}`);
    }
    console.log('\nValidation FAILED');
    process.exit(1);
  } else {
    console.log('\nValidation PASSED');
    process.exit(0);
  }
}

main();
