#!/usr/bin/env node

/**
 * Game State Validator
 *
 * Validates overall game state integrity beyond tokes and multiplayer:
 * - Player file consistency (persona, quests, relationships)
 * - World state validity (locations, NPCs, items)
 * - Cross-references between files
 * - Campaign progress integrity
 *
 * Iterates over all worlds defined in worlds.yaml.
 *
 * Usage: node scripts/validate-game-state.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const WORLDS_FILE = 'worlds.yaml';
const BESTIARY_DIR = '.claude/skills/play-agent-quest/world/bestiary';  // Shared

// Helper to get directory paths for a specific world
function getWorldPaths(world) {
  const worldBase = path.join('worlds', world);
  return {
    PLAYERS_DIR: path.join(worldBase, 'players'),
    WORLD_DIR: worldBase,  // World-specific content is directly in the world folder
    CAMPAIGNS_DIR: path.join(worldBase, 'campaigns'),
    QUESTS_DIR: path.join(worldBase, 'quests')
  };
}

// Load worlds configuration
function loadWorlds() {
  if (!fs.existsSync(WORLDS_FILE)) {
    console.error('Error: worlds.yaml not found');
    process.exit(1);
  }
  const content = fs.readFileSync(WORLDS_FILE, 'utf8');
  const worldsConfig = yaml.load(content);
  return Object.keys(worldsConfig.worlds || {});
}

// Current world paths (set per-world in main)
let PLAYERS_DIR = '';
let WORLD_DIR = '';
let CAMPAIGNS_DIR = '';
let QUESTS_DIR = '';

// Valid difficulty settings
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard', 'nightmare'];

// Danger level to level range mapping
const DANGER_LEVEL_RANGES = {
  safe: null,
  low: { min: 1, max: 4, sweet_spot: 2 },
  medium: { min: 2, max: 6, sweet_spot: 4 },
  high: { min: 5, max: 9, sweet_spot: 7 },
  extreme: { min: 7, max: 10, sweet_spot: 9 }
};

// Tier to level range mapping
const TIER_LEVEL_RANGES = {
  minion: { min: 1, max: 3 },
  standard: { min: 2, max: 6 },
  elite: { min: 4, max: 8 },
  boss: { min: 5, max: 10 },
  legendary: { min: 8, max: 10 }
};

// Errors and warnings
const errors = [];
const warnings = [];
let verbose = false;

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
 * Get all directories in a path
 */
function getDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

/**
 * Get all files matching extension in directory (recursive)
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

// ============================================================================
// PLAYER VALIDATION
// ============================================================================

function validatePlayers() {
  console.log('Validating player files...');

  const players = getDirs(PLAYERS_DIR);
  let personaCount = 0;

  for (const github of players) {
    const playerDir = path.join(PLAYERS_DIR, github);
    const playerFile = path.join(playerDir, 'player.yaml');

    log(`Checking player: ${github}`);

    // Validate player.yaml exists
    if (!fs.existsSync(playerFile)) {
      error(playerDir, `Missing player.yaml`);
      continue;
    }

    const player = loadYaml(playerFile);
    if (!player) continue;

    // Check required fields
    if (!player.github) {
      error(playerFile, 'Missing github field');
    } else if (player.github !== github) {
      error(playerFile, `GitHub mismatch: file says ${player.github}, directory is ${github}`);
    }

    if (!player.active_character) {
      warn(playerFile, 'No active character set');
    }

    // Validate personas
    const personasDir = path.join(playerDir, 'personas');
    if (fs.existsSync(personasDir)) {
      const personas = getDirs(personasDir);

      for (const personaName of personas) {
        personaCount++;
        validatePersona(github, personaName);
      }

      // Check active_character exists
      if (player.active_character) {
        const activeDir = path.join(personasDir, player.active_character.toLowerCase().replace(/\s+/g, '-'));
        if (!fs.existsSync(activeDir)) {
          // Try to find by name in persona files
          let found = false;
          for (const p of personas) {
            const pFile = path.join(personasDir, p, 'persona.yaml');
            const pData = loadYaml(pFile);
            if (pData && pData.name === player.active_character) {
              found = true;
              break;
            }
          }
          if (!found) {
            warn(playerFile, `Active character "${player.active_character}" not found in personas`);
          }
        }
      }
    }
  }

  console.log(`  Checked ${players.length} player(s), ${personaCount} persona(s)\n`);
}

function validatePersona(github, personaName) {
  const personaDir = path.join(PLAYERS_DIR, github, 'personas', personaName);
  const personaFile = path.join(personaDir, 'persona.yaml');

  log(`  Checking persona: ${personaName}`);

  const persona = loadYaml(personaFile);
  if (!persona) {
    error(personaFile, 'Missing or invalid persona.yaml');
    return;
  }

  // Required fields
  const requiredFields = ['name', 'class'];
  for (const field of requiredFields) {
    if (!persona[field]) {
      error(personaFile, `Missing required field: ${field}`);
    }
  }

  // Stats validation (accepts both might/strength naming conventions)
  if (persona.stats) {
    const statFields = ['strength', 'might', 'agility', 'spirit', 'mind'];
    const hasStrength = typeof persona.stats.strength === 'number' || typeof persona.stats.might === 'number';
    const hasAgility = typeof persona.stats.agility === 'number';
    const hasSpirit = typeof persona.stats.spirit === 'number';
    const hasMind = typeof persona.stats.mind === 'number';

    if (!hasStrength) {
      error(personaFile, 'Missing stat: strength (or might)');
    }
    if (!hasAgility) {
      error(personaFile, 'Missing stat: agility');
    }
    if (!hasSpirit) {
      error(personaFile, 'Missing stat: spirit');
    }
    if (!hasMind) {
      error(personaFile, 'Missing stat: mind');
    }

    // Range validation for present stats
    for (const stat of statFields) {
      if (typeof persona.stats[stat] === 'number') {
        if (persona.stats[stat] < 1 || persona.stats[stat] > 30) {
          warn(personaFile, `Stat ${stat} out of normal range: ${persona.stats[stat]}`);
        }
      }
    }
  } else {
    error(personaFile, 'Missing stats block');
  }

  // HP validation - check both top-level and in resources
  const hp = persona.hp ?? persona.resources?.hp;
  const maxHp = persona.max_hp ?? persona.resources?.max_hp;

  if (hp !== undefined && maxHp !== undefined) {
    if (hp > maxHp) {
      error(personaFile, `HP (${hp}) exceeds max HP (${maxHp})`);
    }
    if (hp < -10) {
      warn(personaFile, `HP extremely negative (${hp}), character should be dead`);
    }
  }

  // Resources validation
  if (persona.resources) {
    if (typeof persona.resources.gold === 'number' && persona.resources.gold < 0) {
      error(personaFile, `Negative gold: ${persona.resources.gold}`);
    }

    // Willpower validation
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
      if (maxWillpower !== expectedMax) {
        warn(personaFile, `max_willpower (${maxWillpower}) doesn't match spirit(${spirit}) × multiplier(${multiplier}) = ${expectedMax}`);
      }
    }
  }

  // Location validation
  if (persona.location) {
    const locationPath = path.join(WORLD_DIR, 'locations', persona.location, 'README.md');
    if (!fs.existsSync(locationPath)) {
      warn(personaFile, `Location "${persona.location}" not found in ${WORLD_DIR}/locations`);
    }
  }

  // Validate quests file
  const questsFile = path.join(personaDir, 'quests.yaml');
  if (fs.existsSync(questsFile)) {
    validatePersonaQuests(questsFile);
  }

  // Validate campaign progress
  const campaignFile = path.join(personaDir, 'campaign-progress.yaml');
  if (fs.existsSync(campaignFile)) {
    validateCampaignProgress(campaignFile);
  }

  // Validate relationships
  const relationshipsFile = path.join(personaDir, 'relationships.yaml');
  if (fs.existsSync(relationshipsFile)) {
    validateRelationships(relationshipsFile);
  }

  // Validate abilities
  validatePersonaAbilities(personaFile, persona);

  // Validate difficulty setting
  validatePersonaDifficulty(personaFile, persona);

  // Validate progression level
  validatePersonaProgression(personaFile, persona);
}

function validatePersonaDifficulty(filePath, persona) {
  if (persona.difficulty) {
    const setting = persona.difficulty.setting;
    if (setting && !VALID_DIFFICULTIES.includes(setting)) {
      error(filePath, `Invalid difficulty setting: "${setting}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
    }
  }
  // Note: Missing difficulty field is OK - defaults to 'normal'
}

function validatePersonaProgression(filePath, persona) {
  if (persona.progression) {
    const level = persona.progression.level;
    if (typeof level === 'number') {
      if (level < 1 || level > 10) {
        warn(filePath, `Level ${level} out of expected range (1-10)`);
      }
    }

    const xp = persona.progression.xp;
    const xpToNext = persona.progression.xp_to_next;
    if (typeof xp === 'number' && typeof xpToNext === 'number') {
      if (xp >= xpToNext) {
        warn(filePath, `XP (${xp}) >= XP to next level (${xpToNext}), should level up`);
      }
    }
  }
}

function validatePersonaQuests(filePath) {
  const quests = loadYaml(filePath);
  if (!quests || !quests.quests) return;

  for (const [questId, quest] of Object.entries(quests.quests)) {
    // Check quest status
    const validStatuses = ['active', 'completed', 'failed', 'abandoned'];
    if (quest.status && !validStatuses.includes(quest.status)) {
      warn(filePath, `Invalid quest status for ${questId}: ${quest.status}`);
    }

    // Check quest exists in world
    const questPath = path.join(QUESTS_DIR, 'available', `${questId}.md`);
    const questPathYaml = path.join(QUESTS_DIR, 'available', `${questId}.yaml`);
    if (!fs.existsSync(questPath) && !fs.existsSync(questPathYaml)) {
      // Might be a campaign quest, that's ok
      log(`    Quest ${questId} not found in quests/available (may be campaign quest)`);
    }
  }
}

function validateCampaignProgress(filePath) {
  const progress = loadYaml(filePath);
  if (!progress) return;

  // Check campaign exists
  if (progress.campaign_id) {
    const campaignPath = path.join(CAMPAIGNS_DIR, progress.campaign_id, 'campaign.yaml');
    if (!fs.existsSync(campaignPath)) {
      error(filePath, `Campaign "${progress.campaign_id}" not found`);
    }
  }

  // Check current chapter exists
  if (progress.current_chapter && progress.campaign_id) {
    const chapterPath = path.join(
      CAMPAIGNS_DIR,
      progress.campaign_id,
      'chapters',
      `${progress.current_chapter}.yaml`
    );
    if (!fs.existsSync(chapterPath)) {
      warn(filePath, `Chapter "${progress.current_chapter}" not found in campaign`);
    }
  }
}

function validatePersonaAbilities(filePath, persona) {
  // Check if using new abilities format
  if (!persona.abilities || !persona.abilities.known) {
    // Old format or no abilities - skip validation
    return;
  }

  const knownAbilities = persona.abilities.known;
  if (!Array.isArray(knownAbilities)) {
    warn(filePath, 'abilities.known should be an array');
    return;
  }

  const ABILITIES_DIR = path.join(WORLD_DIR, 'abilities', 'database');

  for (const entry of knownAbilities) {
    const abilityId = typeof entry === 'string' ? entry : entry.id;
    if (!abilityId) {
      warn(filePath, 'Ability entry missing id');
      continue;
    }

    // Check ability exists in database
    const abilityPath = path.join(ABILITIES_DIR, `${abilityId}.yaml`);
    if (!fs.existsSync(abilityPath)) {
      error(filePath, `Ability "${abilityId}" not found in ${WORLD_DIR}/abilities/database`);
      continue;
    }

    // Load ability and validate level
    const ability = loadYaml(abilityPath);
    if (!ability) continue;

    if (typeof entry === 'object' && entry.level) {
      if (!ability.levels || !ability.levels[entry.level]) {
        warn(filePath, `Ability "${abilityId}" (${ability.name}) doesn't have level ${entry.level}`);
      }
    }

    // Check class restriction
    if (ability.class && persona.class) {
      if (ability.class.toLowerCase() !== persona.class.toLowerCase()) {
        warn(filePath, `Ability "${ability.name}" is for ${ability.class}, but persona is ${persona.class}`);
      }
    }
  }
}

function validateRelationships(filePath) {
  const relationships = loadYaml(filePath);
  if (!relationships || !relationships.npcs) return;

  for (const [npcId, rel] of Object.entries(relationships.npcs)) {
    // Check NPC exists
    const npcPath = path.join(WORLD_DIR, 'npcs', 'profiles', `${npcId}.yaml`);
    if (!fs.existsSync(npcPath)) {
      warn(filePath, `NPC "${npcId}" not found in ${WORLD_DIR}/npcs/profiles`);
    }

    // Check standing is reasonable
    if (typeof rel.standing === 'number') {
      if (rel.standing < -100 || rel.standing > 100) {
        warn(filePath, `NPC ${npcId} standing out of range: ${rel.standing}`);
      }
    }
  }
}

// ============================================================================
// WORLD VALIDATION
// ============================================================================

function validateWorld() {
  console.log('Validating world state...');

  // Validate locations
  const locationsDir = path.join(WORLD_DIR, 'locations');
  const locations = getDirs(locationsDir);
  let locationCount = 0;

  for (const loc of locations) {
    const locPath = path.join(locationsDir, loc);
    const readmePath = path.join(locPath, 'README.md');
    const locationYamlPath = path.join(locPath, 'location.yaml');

    if (!fs.existsSync(readmePath)) {
      warn(locPath, 'Location missing README.md');
    } else {
      locationCount++;
    }

    // Validate location.yaml for level_range
    if (fs.existsSync(locationYamlPath)) {
      validateLocationLevelRange(locationYamlPath);
    }
  }

  console.log(`  Checked ${locationCount} location(s)`);

  // Validate location index
  const locationIndexPath = path.join(locationsDir, 'index.yaml');
  if (fs.existsSync(locationIndexPath)) {
    validateLocationIndex(locationIndexPath);
  }

  // Validate NPCs
  const npcsDir = path.join(WORLD_DIR, 'npcs', 'profiles');
  const npcs = getFiles(npcsDir);
  let npcCount = 0;

  for (const npcFile of npcs) {
    const npc = loadYaml(npcFile);
    if (!npc) continue;
    npcCount++;

    if (!npc.name) {
      error(npcFile, 'NPC missing name');
    }

    // Check location exists if specified
    if (npc.location) {
      const locPath = path.join(WORLD_DIR, 'locations', npc.location);
      if (!fs.existsSync(locPath)) {
        warn(npcFile, `NPC location "${npc.location}" not found`);
      }
    }
  }

  console.log(`  Checked ${npcCount} NPC(s)`);

  // Validate current world state
  const currentStatePath = path.join(WORLD_DIR, 'state', 'current.yaml');
  if (fs.existsSync(currentStatePath)) {
    const state = loadYaml(currentStatePath);
    if (state) {
      // Validate time structure (can be string "HH:MM" or object with hour/minute)
      if (state.time) {
        if (typeof state.time === 'string') {
          if (!/^\d{1,2}:\d{2}$/.test(state.time)) {
            warn(currentStatePath, `Invalid time format: ${state.time}`);
          }
        } else if (typeof state.time === 'object') {
          // Object format with hour/minute fields
          if (typeof state.time.hour !== 'number' || typeof state.time.minute !== 'number') {
            warn(currentStatePath, 'Time object missing hour or minute');
          } else if (state.time.hour < 0 || state.time.hour > 23) {
            warn(currentStatePath, `Invalid hour: ${state.time.hour}`);
          } else if (state.time.minute < 0 || state.time.minute > 59) {
            warn(currentStatePath, `Invalid minute: ${state.time.minute}`);
          }
        }
      }
    }
  } else {
    warn(WORLD_DIR, 'Missing world/state/current.yaml');
  }

  console.log('');
}

// ============================================================================
// LEVEL AND DIFFICULTY VALIDATION
// ============================================================================

function validateLocationLevelRange(filePath) {
  const location = loadYaml(filePath);
  if (!location) return;

  const dangerLevel = location.danger_level;
  const levelRange = location.level_range;
  const isSafeZone = location.is_safe_zone === true;

  // Safe zones should have null level_range
  if (isSafeZone || dangerLevel === 'safe') {
    if (levelRange !== null && levelRange !== undefined) {
      warn(filePath, `Safe zone should have level_range: null, got: ${JSON.stringify(levelRange)}`);
    }
    return;
  }

  // Non-safe zones should have level_range
  if (!levelRange) {
    warn(filePath, `Non-safe location (danger_level: ${dangerLevel}) missing level_range`);
    return;
  }

  // Validate level_range structure
  if (typeof levelRange === 'object') {
    const { min, max, sweet_spot } = levelRange;

    if (typeof min !== 'number' || typeof max !== 'number') {
      error(filePath, 'level_range must have numeric min and max');
      return;
    }

    if (min > max) {
      error(filePath, `level_range.min (${min}) > level_range.max (${max})`);
    }

    if (min < 1 || max > 10) {
      warn(filePath, `level_range (${min}-${max}) outside expected 1-10 range`);
    }

    if (sweet_spot !== undefined) {
      if (typeof sweet_spot !== 'number') {
        error(filePath, 'level_range.sweet_spot must be a number');
      } else if (sweet_spot < min || sweet_spot > max) {
        warn(filePath, `sweet_spot (${sweet_spot}) outside level_range (${min}-${max})`);
      }
    }

    // Check if level_range matches danger_level expectations
    const expected = DANGER_LEVEL_RANGES[dangerLevel];
    if (expected && dangerLevel !== 'safe') {
      if (min < expected.min - 1 || max > expected.max + 1) {
        log(`Location ${filePath} level_range (${min}-${max}) differs from ${dangerLevel} standard (${expected.min}-${expected.max})`);
      }
    }
  } else if (Array.isArray(levelRange)) {
    // Array format: [min, max, sweet_spot]
    if (levelRange.length < 2 || levelRange.length > 3) {
      error(filePath, 'level_range array must have 2-3 elements: [min, max, sweet_spot?]');
    }
  }
}

function validateLocationIndex(filePath) {
  const index = loadYaml(filePath);
  if (!index || !index.locations) return;

  for (const [locId, loc] of Object.entries(index.locations)) {
    const dangerLevel = loc.danger_level;
    const levelRange = loc.level_range;

    // Safe zones should have null level_range
    if (dangerLevel === 'safe') {
      if (levelRange !== null && levelRange !== undefined) {
        warn(filePath, `Location "${locId}" (safe) should have level_range: null`);
      }
      continue;
    }

    // Non-safe zones should have level_range
    if (levelRange === null || levelRange === undefined) {
      warn(filePath, `Location "${locId}" (${dangerLevel}) missing level_range`);
      continue;
    }

    // Array format validation: [min, max, sweet_spot]
    if (Array.isArray(levelRange)) {
      if (levelRange.length < 2 || levelRange.length > 3) {
        error(filePath, `Location "${locId}" level_range must be [min, max] or [min, max, sweet_spot]`);
        continue;
      }

      const [min, max, sweetSpot] = levelRange;
      if (typeof min !== 'number' || typeof max !== 'number') {
        error(filePath, `Location "${locId}" level_range must have numeric min/max`);
        continue;
      }

      if (min > max) {
        error(filePath, `Location "${locId}" level_range min (${min}) > max (${max})`);
      }

      if (sweetSpot !== undefined && (sweetSpot < min || sweetSpot > max)) {
        warn(filePath, `Location "${locId}" sweet_spot (${sweetSpot}) outside range (${min}-${max})`);
      }
    }
  }
}

function validateCreatures() {
  console.log('Validating creatures...');

  if (!fs.existsSync(BESTIARY_DIR)) {
    console.log('  No bestiary directory\n');
    return;
  }

  const creatureFiles = getFiles(BESTIARY_DIR);
  let creatureCount = 0;
  let levelIssues = 0;

  for (const creatureFile of creatureFiles) {
    const creature = loadYaml(creatureFile);
    if (!creature) continue;
    creatureCount++;

    // Check level field exists
    if (creature.level === undefined) {
      warn(creatureFile, `Creature "${creature.name || creature.id}" missing level field`);
      levelIssues++;
      continue;
    }

    const level = creature.level;
    const tier = creature.tier;

    // Validate level is a number
    if (typeof level !== 'number') {
      error(creatureFile, `Creature level must be a number, got: ${typeof level}`);
      levelIssues++;
      continue;
    }

    // Validate level is in range 1-10
    if (level < 1 || level > 10) {
      warn(creatureFile, `Creature level ${level} outside expected range (1-10)`);
    }

    // Validate level matches tier expectations
    if (tier && TIER_LEVEL_RANGES[tier]) {
      const expected = TIER_LEVEL_RANGES[tier];
      if (level < expected.min || level > expected.max) {
        warn(creatureFile, `${tier} creature level ${level} outside tier range (${expected.min}-${expected.max})`);
      }
    }

    // Validate stats exist
    if (!creature.stats) {
      error(creatureFile, 'Creature missing stats block');
    } else {
      const requiredStats = ['hp', 'defense', 'attack_bonus', 'damage'];
      for (const stat of requiredStats) {
        if (creature.stats[stat] === undefined) {
          warn(creatureFile, `Creature missing stat: ${stat}`);
        }
      }
    }
  }

  console.log(`  Checked ${creatureCount} creature(s)`);
  if (levelIssues > 0) {
    console.log(`  Found ${levelIssues} level issue(s)`);
  }
  console.log('');
}

function validateQuests() {
  console.log('Validating quests...');

  const questsDir = path.join(QUESTS_DIR, 'available');
  if (!fs.existsSync(questsDir)) {
    console.log('  No quests/available directory\n');
    return;
  }

  const questFiles = [];
  const items = fs.readdirSync(questsDir);
  for (const item of items) {
    if (item.endsWith('.md') || item.endsWith('.yaml')) {
      questFiles.push(path.join(questsDir, item));
    }
  }

  let questCount = 0;
  let levelCount = 0;

  for (const questFile of questFiles) {
    // For markdown files, try to extract YAML metadata
    if (questFile.endsWith('.md')) {
      const content = fs.readFileSync(questFile, 'utf8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      if (yamlMatch) {
        try {
          const metadata = yaml.load(yamlMatch[1]);
          questCount++;
          if (metadata && metadata.level) {
            levelCount++;
            validateQuestLevel(questFile, metadata.level);
          }
        } catch (e) {
          // Ignore YAML parse errors in markdown
        }
      }
    } else {
      const quest = loadYaml(questFile);
      if (!quest) continue;
      questCount++;
      if (quest.level) {
        levelCount++;
        validateQuestLevel(questFile, quest.level);
      }
    }
  }

  console.log(`  Checked ${questCount} quest(s), ${levelCount} with level requirements\n`);
}

function validateQuestLevel(filePath, level) {
  if (typeof level !== 'object') {
    warn(filePath, 'Quest level should be an object with required/recommended fields');
    return;
  }

  const { required, recommended, scaling } = level;

  if (required !== undefined) {
    if (typeof required !== 'number') {
      error(filePath, 'Quest level.required must be a number');
    } else if (required < 1 || required > 10) {
      warn(filePath, `Quest level.required (${required}) outside expected range (1-10)`);
    }
  }

  if (recommended !== undefined) {
    if (typeof recommended !== 'number') {
      error(filePath, 'Quest level.recommended must be a number');
    } else if (recommended < 1 || recommended > 10) {
      warn(filePath, `Quest level.recommended (${recommended}) outside expected range (1-10)`);
    }
  }

  if (required !== undefined && recommended !== undefined) {
    if (required > recommended) {
      warn(filePath, `Quest level.required (${required}) > level.recommended (${recommended})`);
    }
  }

  if (scaling !== undefined && typeof scaling !== 'boolean') {
    warn(filePath, 'Quest level.scaling must be a boolean');
  }
}

// ============================================================================
// CROSS-REFERENCE VALIDATION
// ============================================================================

function validateCrossReferences() {
  console.log('Validating cross-references...');

  let issueCount = 0;

  // Check that all inventory items exist
  const players = getDirs(PLAYERS_DIR);
  for (const github of players) {
    const personasDir = path.join(PLAYERS_DIR, github, 'personas');
    if (!fs.existsSync(personasDir)) continue;

    for (const personaName of getDirs(personasDir)) {
      const personaFile = path.join(personasDir, personaName, 'persona.yaml');
      const persona = loadYaml(personaFile);
      if (!persona || !persona.inventory) continue;

      for (const item of persona.inventory) {
        const itemId = typeof item === 'string' ? item : item.id;
        if (!itemId) continue;

        // Check if item exists in world/items/database
        const itemPath = path.join(WORLD_DIR, 'items', 'database', `${itemId}.yaml`);
        if (!fs.existsSync(itemPath)) {
          error(personaFile, `Item "${itemId}" in inventory not found in ${WORLD_DIR}/items/database`);
          issueCount++;
        }
      }
    }
  }

  if (issueCount > 0) {
    console.log(`  Found ${issueCount} potential missing item reference(s)`);
  } else {
    console.log('  All cross-references valid');
  }
  console.log('');
}

// ============================================================================
// CAMPAIGN VALIDATION
// ============================================================================

function validateCampaigns() {
  console.log('Validating campaigns...');

  if (!fs.existsSync(CAMPAIGNS_DIR)) {
    console.log('  No campaigns directory\n');
    return;
  }

  const indexPath = path.join(CAMPAIGNS_DIR, 'index.yaml');
  if (!fs.existsSync(indexPath)) {
    warn(CAMPAIGNS_DIR, 'Missing campaigns/index.yaml');
  }

  const campaigns = getDirs(CAMPAIGNS_DIR);
  let validCount = 0;

  for (const campaignId of campaigns) {
    const campaignDir = path.join(CAMPAIGNS_DIR, campaignId);
    const campaignFile = path.join(campaignDir, 'campaign.yaml');

    if (!fs.existsSync(campaignFile)) {
      warn(campaignDir, 'Campaign missing campaign.yaml');
      continue;
    }

    const campaign = loadYaml(campaignFile);
    if (!campaign) continue;
    validCount++;

    // Check required fields
    if (!campaign.name) {
      error(campaignFile, 'Campaign missing name');
    }

    // Check chapters exist
    const chaptersDir = path.join(campaignDir, 'chapters');
    if (fs.existsSync(chaptersDir)) {
      const chapters = getFiles(chaptersDir);
      if (chapters.length === 0) {
        warn(campaignDir, 'Campaign has no chapters');
      }
    } else {
      warn(campaignDir, 'Campaign missing chapters directory');
    }
  }

  console.log(`  Checked ${validCount} campaign(s)\n`);
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  console.log('Game State Validator');
  console.log('====================\n');

  const worlds = loadWorlds();
  console.log(`Found ${worlds.length} world(s): ${worlds.join(', ')}\n`);

  for (const world of worlds) {
    console.log(`\n=== World: ${world} ===\n`);

    // Update global paths for this world
    const paths = getWorldPaths(world);
    PLAYERS_DIR = paths.PLAYERS_DIR;
    WORLD_DIR = paths.WORLD_DIR;
    CAMPAIGNS_DIR = paths.CAMPAIGNS_DIR;
    QUESTS_DIR = paths.QUESTS_DIR;

    validatePlayers();
    validateWorld();
    validateQuests();
    validateCrossReferences();
    validateCampaigns();
  }

  // Validate creatures (shared across worlds)
  validateCreatures();

  // Output results
  console.log('Results');
  console.log('-------');

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
