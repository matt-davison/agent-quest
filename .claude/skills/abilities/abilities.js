#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Parse --world argument from command line
function parseWorldArg() {
  const worldArg = process.argv.find(arg => arg.startsWith('--world='));
  if (!worldArg) {
    console.error('Error: --world parameter is required');
    console.error('Usage: node abilities.js --world=<world-id> <command> [args]');
    console.error('Example: node abilities.js --world=alpha list');
    process.exit(1);
  }
  return worldArg.split('=')[1];
}

const WORLD_ID = parseWorldArg();
const PROJECT_ROOT = path.join(__dirname, '../../..');
const DB_PATH = path.join(PROJECT_ROOT, 'worlds', WORLD_ID, 'abilities/database');

/**
 * Parse command line arguments in --flag=value format
 */
function parseArgs(args) {
  const result = { positional: [], flags: {} };
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      result.flags[key] = value || true;
    } else {
      result.positional.push(arg);
    }
  }
  return result;
}

function loadAbility(id) {
  const filePath = path.join(DB_PATH, `${id}.yaml`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(content);
}

function loadAllAbilities() {
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  const files = fs.readdirSync(DB_PATH).filter(f => f.endsWith('.yaml'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(DB_PATH, f), 'utf8');
    return yaml.parse(content);
  });
}

function get(id) {
  const ability = loadAbility(id);
  if (!ability) {
    console.error(`Ability not found: ${id}`);
    console.error(`\nUse 'similar' command to find valid IDs:`);
    console.error(`  node abilities.js similar "${id}"`);
    process.exit(1);
  }
  console.log(yaml.stringify(ability));
}

/**
 * List abilities with optional filtering
 * Supports: --type, --subtype, --class, --tier, --tags, --tags-all
 */
function list(args) {
  const { positional, flags } = parseArgs(args);
  const abilities = loadAllAbilities();
  let filtered = abilities;

  // Legacy support: first positional arg as type filter
  if (positional[0]) {
    filtered = filtered.filter(a => a.type === positional[0] || a.subtype === positional[0]);
  }

  // Type filter
  if (flags.type) {
    filtered = filtered.filter(a => a.type === flags.type);
  }

  // Subtype filter
  if (flags.subtype) {
    filtered = filtered.filter(a => a.subtype === flags.subtype);
  }

  // Class filter
  if (flags.class) {
    const classVal = flags.class.toLowerCase();
    filtered = filtered.filter(a => {
      if (!a.class) return classVal === 'null' || classVal === 'universal';
      return a.class.toLowerCase() === classVal;
    });
  }

  // Tier filter (abilities at or below specified tier)
  if (flags.tier) {
    const maxTier = parseInt(flags.tier, 10);
    filtered = filtered.filter(a => (a.tier || 1) <= maxTier);
  }

  // Tags filter (OR logic: any tag matches)
  if (flags.tags) {
    const searchTags = flags.tags.split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(a => {
      const abilityTags = (a.tags || []).map(t => t.toLowerCase());
      return searchTags.some(st => abilityTags.includes(st));
    });
  }

  // Tags-all filter (AND logic: all tags must match)
  if (flags['tags-all']) {
    const searchTags = flags['tags-all'].split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(a => {
      const abilityTags = (a.tags || []).map(t => t.toLowerCase());
      return searchTags.every(st => abilityTags.includes(st));
    });
  }

  if (filtered.length === 0) {
    console.log('No abilities match the filter criteria.');
    return;
  }

  // Sort by tier then name
  filtered.sort((a, b) => {
    const tierDiff = (a.tier || 1) - (b.tier || 1);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });

  filtered.forEach(ability => {
    const tierStr = ability.tier ? `T${ability.tier}` : 'T1';
    const classStr = ability.class || 'Universal';
    const typeStr = ability.action_type === 'passive' ? '[P]' : '';
    console.log(`${ability.id}: ${ability.name} ${typeStr} (${ability.type}/${classStr}) - ${tierStr}`);
    if (ability.tags && ability.tags.length > 0) {
      console.log(`   tags: ${ability.tags.join(', ')}`);
    }
  });

  console.log(`\n${filtered.length} ability(ies) found.`);
}

function search(query) {
  const abilities = loadAllAbilities();
  const q = query.toLowerCase();

  const matches = abilities.filter(ability => {
    return (
      ability.name.toLowerCase().includes(q) ||
      ability.type.toLowerCase().includes(q) ||
      (ability.subtype && ability.subtype.toLowerCase().includes(q)) ||
      (ability.class && ability.class.toLowerCase().includes(q)) ||
      (ability.levels && ability.levels[1] &&
        ability.levels[1].description &&
        ability.levels[1].description.toLowerCase().includes(q)) ||
      (ability.tags && ability.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  if (matches.length === 0) {
    console.log('No abilities found matching query');
    return;
  }

  matches.forEach(ability => {
    console.log(`${ability.id}: ${ability.name}`);
    console.log(`  Type: ${ability.type}${ability.subtype ? '/' + ability.subtype : ''}`);
    console.log(`  Class: ${ability.class || 'Universal'}, Tier: ${ability.tier || 1}`);
    if (ability.tags && ability.tags.length > 0) {
      console.log(`  Tags: ${ability.tags.join(', ')}`);
    }
    if (ability.levels && ability.levels[1]) {
      console.log(`  ${ability.levels[1].description.split('\n')[0]}`);
    }
    console.log('');
  });
}

function similar(name) {
  const abilities = loadAllAbilities();
  const q = name.toLowerCase();

  // Calculate similarity score
  const scored = abilities.map(ability => {
    const abilityName = ability.name.toLowerCase();
    let score = 0;

    // Exact match
    if (abilityName === q) score = 100;
    // Contains query
    else if (abilityName.includes(q)) score = 80;
    // Query contains ability name
    else if (q.includes(abilityName)) score = 70;
    // Word overlap
    else {
      const queryWords = q.split(/\s+/);
      const abilityWords = abilityName.split(/\s+/);
      const overlap = queryWords.filter(w => abilityWords.some(aw => aw.includes(w) || w.includes(aw)));
      score = (overlap.length / Math.max(queryWords.length, abilityWords.length)) * 60;
    }

    return { ability, score };
  });

  const matches = scored.filter(s => s.score > 30).sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    console.log('No similar abilities found. Safe to create new ability.');
    process.exit(0);
  }

  console.log('Similar abilities found:');
  matches.slice(0, 5).forEach(({ ability, score }) => {
    console.log(`  ${ability.id}: ${ability.name} (${Math.round(score)}% match)`);
  });
  console.log('\nConsider using an existing ability ID instead of creating a new one.');
}

/**
 * Get abilities for a specific class
 */
function classAbilities(className) {
  const abilities = loadAllAbilities();
  const filtered = abilities.filter(a => {
    if (!a.class) return false;
    return a.class.toLowerCase() === className.toLowerCase();
  });

  if (filtered.length === 0) {
    console.log(`No abilities found for class: ${className}`);
    return;
  }

  // Sort by tier then name
  filtered.sort((a, b) => {
    const tierDiff = (a.tier || 1) - (b.tier || 1);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });

  console.log(`Abilities for ${className}:\n`);
  filtered.forEach(ability => {
    const tierStr = ability.tier ? `T${ability.tier}` : 'T1';
    const typeStr = ability.action_type === 'passive' ? '[P]' : '';
    console.log(`${ability.id}: ${ability.name} ${typeStr} - ${tierStr}`);
    if (ability.levels && ability.levels[1]) {
      console.log(`   ${ability.levels[1].description.split('\n')[0].slice(0, 80)}...`);
    }
  });

  console.log(`\n${filtered.length} ability(ies) found.`);
}

/**
 * Get abilities at a specific tier
 */
function tier(tierNum) {
  const targetTier = parseInt(tierNum, 10);
  const abilities = loadAllAbilities();
  const filtered = abilities.filter(a => (a.tier || 1) === targetTier);

  if (filtered.length === 0) {
    console.log(`No abilities at tier ${targetTier}`);
    return;
  }

  // Sort by class then name
  filtered.sort((a, b) => {
    const classA = a.class || 'ZZZ'; // Universal at end
    const classB = b.class || 'ZZZ';
    if (classA !== classB) return classA.localeCompare(classB);
    return a.name.localeCompare(b.name);
  });

  console.log(`Tier ${targetTier} abilities:\n`);
  filtered.forEach(ability => {
    const classStr = ability.class || 'Universal';
    const typeStr = ability.action_type === 'passive' ? '[P]' : '';
    console.log(`${ability.id}: ${ability.name} ${typeStr} (${classStr})`);
  });

  console.log(`\n${filtered.length} ability(ies) found.`);
}

/**
 * Validate ability IDs in YAML format
 */
function validate(abilitiesYaml) {
  let knownAbilities;
  try {
    knownAbilities = yaml.parse(abilitiesYaml);
  } catch (e) {
    console.error('Invalid abilities YAML');
    process.exit(1);
  }

  if (!Array.isArray(knownAbilities)) {
    console.error('Abilities must be an array');
    process.exit(1);
  }

  if (knownAbilities.length === 0) {
    console.log('✅ No abilities to validate.');
    return;
  }

  let errors = 0;
  let valid = 0;

  knownAbilities.forEach(entry => {
    const abilityId = typeof entry === 'string' ? entry : entry.id;
    const ability = loadAbility(abilityId);
    if (!ability) {
      errors++;
      console.log(`❌ INVALID: "${abilityId}" not found in database`);

      // Try to find similar abilities
      const allAbilities = loadAllAbilities();
      const similar = allAbilities
        .filter(a => a.name.toLowerCase().includes(abilityId.toLowerCase()) || a.id.includes(abilityId))
        .slice(0, 3);

      if (similar.length > 0) {
        console.log(`   Did you mean one of these?`);
        similar.forEach(s => console.log(`     - ${s.id}: ${s.name}`));
      }
    } else {
      valid++;
      console.log(`✅ VALID: ${ability.id} (${ability.name})`);
    }
  });

  console.log(`\n${valid} valid, ${errors} invalid`);

  if (errors > 0) {
    process.exit(1);
  }
}

/**
 * Resolve ability IDs to full data
 */
function resolve(abilitiesYaml) {
  let knownAbilities;
  try {
    knownAbilities = yaml.parse(abilitiesYaml);
  } catch (e) {
    console.error('Invalid abilities YAML');
    process.exit(1);
  }

  if (!Array.isArray(knownAbilities)) {
    console.error('Abilities must be an array');
    process.exit(1);
  }

  let hasUnknown = false;
  const resolved = knownAbilities.map(entry => {
    const abilityId = typeof entry === 'string' ? entry : entry.id;
    const level = typeof entry === 'object' ? entry.level : 1;
    const ability = loadAbility(abilityId);

    if (!ability) {
      hasUnknown = true;
      console.error(`\n⚠️  WARNING: Ability "${abilityId}" not found in database!`);
      console.error(`   Use 'similar' command to find valid IDs:`);
      console.error(`   node abilities.js similar "${abilityId}"\n`);
      return { ...entry, name: '[UNKNOWN]', error: 'Ability not found in database' };
    }

    return {
      ...ability,
      known_level: level,
      source: typeof entry === 'object' ? entry.source : null,
      learned_date: typeof entry === 'object' ? entry.learned_date : null
    };
  });

  if (hasUnknown) {
    console.error('---');
  }
  console.log(yaml.stringify(resolved));
}

/**
 * Display abilities in readable format
 */
function display(abilitiesYaml) {
  let knownAbilities;
  try {
    knownAbilities = yaml.parse(abilitiesYaml);
  } catch (e) {
    console.error('Invalid abilities YAML');
    process.exit(1);
  }

  if (!Array.isArray(knownAbilities)) {
    console.error('Abilities must be an array');
    process.exit(1);
  }

  if (knownAbilities.length === 0) {
    console.log('No known abilities.');
    return;
  }

  let hasUnknown = false;
  knownAbilities.forEach(entry => {
    const abilityId = typeof entry === 'string' ? entry : entry.id;
    const level = typeof entry === 'object' ? entry.level : 1;
    const ability = loadAbility(abilityId);

    if (!ability) {
      hasUnknown = true;
      console.log(`- ⚠️  [${abilityId}] UNKNOWN ABILITY`);
      console.log(`     WARNING: This ability ID is not in the database!`);
      return;
    }

    const isPassive = ability.action_type === 'passive';
    const passiveTag = isPassive ? ' [PASSIVE]' : '';
    const levelData = ability.levels ? ability.levels[level] : null;
    const wpCost = levelData ? levelData.willpower_cost : '?';

    console.log(`- ${ability.name}${passiveTag} (Lv${level})`);
    console.log(`    ID: ${ability.id} | Type: ${ability.type} | WP Cost: ${wpCost}`);
    if (levelData && levelData.description) {
      console.log(`    ${levelData.description.split('\n')[0]}`);
    }
  });

  if (hasUnknown) {
    console.error(`\n⚠️  Some abilities are not in the database!`);
    console.error(`   Use 'node abilities.js similar "<name>"' to find valid IDs.`);
  }
}

/**
 * Load completed quests for a player character
 */
function loadCompletedQuests(flags) {
  const github = flags.github;
  const character = flags.character;
  if (!github || !character) return null;

  const questsPath = path.join(PROJECT_ROOT, 'worlds', WORLD_ID, 'players', github, 'personas', character, 'quests.yaml');
  if (!fs.existsSync(questsPath)) return [];

  const content = fs.readFileSync(questsPath, 'utf8');
  const questsData = yaml.parse(content);
  if (!questsData) return [];

  const completed = questsData.completed_quests || questsData.completed || [];
  return completed.map(q => typeof q === 'string' ? q : q.id);
}

/**
 * Check if a persona can use an ability
 */
function canUse(personaYaml, abilityId, flags = {}) {
  let persona;
  try {
    persona = yaml.parse(personaYaml);
  } catch (e) {
    console.error('Invalid persona YAML');
    process.exit(1);
  }

  const ability = loadAbility(abilityId);
  if (!ability) {
    console.log(`❌ Ability not found: ${abilityId}`);
    process.exit(1);
  }

  const checks = [];
  let canUseAbility = true;

  // Check if ability is known
  const knownAbilities = persona.abilities?.known || [];
  const knownEntry = knownAbilities.find(a =>
    (typeof a === 'string' ? a : a.id) === abilityId
  );

  if (!knownEntry) {
    checks.push(`❌ Ability not in known list`);
    canUseAbility = false;
  } else {
    checks.push(`✅ Ability is known`);
  }

  // Get level
  const knownLevel = knownEntry ? (typeof knownEntry === 'object' ? knownEntry.level : 1) : 1;
  const levelData = ability.levels ? ability.levels[knownLevel] : null;

  // Check willpower
  if (levelData && levelData.willpower_cost > 0) {
    const currentWP = persona.resources?.willpower || 0;
    if (currentWP >= levelData.willpower_cost) {
      checks.push(`✅ Willpower: ${currentWP} >= ${levelData.willpower_cost} required`);
    } else {
      checks.push(`❌ Insufficient willpower: ${currentWP} < ${levelData.willpower_cost} required`);
      canUseAbility = false;
    }
  }

  // Check usage limits
  if (ability.limits && ability.limits.max_uses) {
    const resetType = ability.limits.reset || 'combat';
    const usageKey = `${abilityId}`;
    const usage = persona.abilities?.usage?.[resetType]?.[usageKey] || 0;

    if (usage < ability.limits.max_uses) {
      checks.push(`✅ Uses: ${usage}/${ability.limits.max_uses} (resets on ${resetType})`);
    } else {
      checks.push(`❌ Max uses reached: ${usage}/${ability.limits.max_uses} (resets on ${resetType})`);
      canUseAbility = false;
    }
  }

  // Check stat prerequisites
  if (ability.prerequisites) {
    const prereqs = ability.prerequisites;
    const stats = persona.stats || {};

    for (const [key, value] of Object.entries(prereqs)) {
      if (key.startsWith('min_')) {
        const stat = key.slice(4);
        const statValue = stats[stat] || 10;
        if (statValue >= value) {
          checks.push(`✅ ${stat}: ${statValue} >= ${value}`);
        } else {
          checks.push(`❌ ${stat}: ${statValue} < ${value} required`);
          canUseAbility = false;
        }
      }
    }

    // Check ability prerequisites
    if (prereqs.abilities && Array.isArray(prereqs.abilities) && prereqs.abilities.length > 0) {
      for (const reqAbilityId of prereqs.abilities) {
        const hasAbility = knownAbilities.some(a =>
          (typeof a === 'string' ? a : a.id) === reqAbilityId
        );
        const reqAbility = loadAbility(reqAbilityId);
        const reqName = reqAbility ? reqAbility.name : reqAbilityId;
        if (hasAbility) {
          checks.push(`✅ Prereq ability: ${reqName} (known)`);
        } else {
          checks.push(`❌ Prereq ability: ${reqName} (not known)`);
          canUseAbility = false;
        }
      }
    }

    // Check quest prerequisites
    if (prereqs.quests && Array.isArray(prereqs.quests) && prereqs.quests.length > 0) {
      if (!flags.github || !flags.character) {
        checks.push(`⚠️  Quest prereqs exist but --github/--character not provided (skipping)`);
      } else {
        const completedQuests = loadCompletedQuests(flags);
        if (completedQuests === null) {
          checks.push(`⚠️  Could not load quest data (skipping quest checks)`);
        } else {
          for (const reqQuestId of prereqs.quests) {
            if (completedQuests.includes(reqQuestId)) {
              checks.push(`✅ Prereq quest: ${reqQuestId} (completed)`);
            } else {
              checks.push(`❌ Prereq quest: ${reqQuestId} (not completed)`);
              canUseAbility = false;
            }
          }
        }
      }
    }
  }

  // Output results
  console.log(`Ability: ${ability.name} (${ability.id})`);
  console.log(`Level: ${knownLevel}`);
  console.log(`\nChecks:`);
  checks.forEach(c => console.log(`  ${c}`));
  console.log(`\nResult: ${canUseAbility ? '✅ CAN USE' : '❌ CANNOT USE'}`);

  process.exit(canUseAbility ? 0 : 1);
}

/**
 * Check if a persona can learn an ability
 */
function canLearn(personaYaml, abilityId, flags = {}) {
  let persona;
  try {
    persona = yaml.parse(personaYaml);
  } catch (e) {
    console.error('Invalid persona YAML');
    process.exit(1);
  }

  const ability = loadAbility(abilityId);
  if (!ability) {
    console.log(`❌ Ability not found: ${abilityId}`);
    process.exit(1);
  }

  const checks = [];
  let canLearnAbility = true;

  // Check if already known
  const knownAbilities = persona.abilities?.known || [];
  const alreadyKnown = knownAbilities.some(a =>
    (typeof a === 'string' ? a : a.id) === abilityId
  );

  if (alreadyKnown) {
    checks.push(`❌ Already known`);
    canLearnAbility = false;
  } else {
    checks.push(`✅ Not yet known`);
  }

  // Check tier gate
  const playerTier = persona.progression?.tier || 1;
  const abilityTier = ability.tier || 1;
  if (playerTier >= abilityTier) {
    checks.push(`✅ Tier: ${playerTier} >= ${abilityTier} required`);
  } else {
    checks.push(`❌ Tier: ${playerTier} < ${abilityTier} required`);
    canLearnAbility = false;
  }

  // Check class eligibility
  const playerClass = persona.class || persona.progression?.class || null;
  const abilityClass = ability.class || null;
  let isCrossClass = false;

  if (!abilityClass) {
    checks.push(`✅ Class: Universal (available to all)`);
  } else if (playerClass && abilityClass.toLowerCase() === playerClass.toLowerCase()) {
    checks.push(`✅ Class: ${abilityClass} (matches your class)`);
  } else {
    // Cross-class check
    const playerXP = persona.progression?.xp || 0;
    if (playerXP >= 2000) {
      isCrossClass = true;
      checks.push(`✅ Class: ${abilityClass} (cross-class, XP ${playerXP} >= 2000, gold cost doubled)`);
    } else {
      checks.push(`❌ Class: ${abilityClass} (cross-class requires XP >= 2000, you have ${playerXP})`);
      canLearnAbility = false;
    }
  }

  // Check stat prerequisites
  if (ability.prerequisites) {
    const prereqs = ability.prerequisites;
    const stats = persona.stats || {};

    for (const [key, value] of Object.entries(prereqs)) {
      if (key.startsWith('min_')) {
        const stat = key.slice(4);
        const statValue = stats[stat] || 10;
        if (statValue >= value) {
          checks.push(`✅ ${stat}: ${statValue} >= ${value}`);
        } else {
          checks.push(`❌ ${stat}: ${statValue} < ${value} required`);
          canLearnAbility = false;
        }
      }
    }

    // Check ability prerequisites
    if (prereqs.abilities && Array.isArray(prereqs.abilities) && prereqs.abilities.length > 0) {
      for (const reqAbilityId of prereqs.abilities) {
        const hasAbility = knownAbilities.some(a =>
          (typeof a === 'string' ? a : a.id) === reqAbilityId
        );
        const reqAbility = loadAbility(reqAbilityId);
        const reqName = reqAbility ? reqAbility.name : reqAbilityId;
        if (hasAbility) {
          checks.push(`✅ Prereq ability: ${reqName} (known)`);
        } else {
          checks.push(`❌ Prereq ability: ${reqName} (not known)`);
          canLearnAbility = false;
        }
      }
    }

    // Check quest prerequisites
    if (prereqs.quests && Array.isArray(prereqs.quests) && prereqs.quests.length > 0) {
      if (!flags.github || !flags.character) {
        checks.push(`⚠️  Quest prereqs exist but --github/--character not provided (skipping)`);
      } else {
        const completedQuests = loadCompletedQuests(flags);
        if (completedQuests === null) {
          checks.push(`⚠️  Could not load quest data (skipping quest checks)`);
        } else {
          for (const reqQuestId of prereqs.quests) {
            if (completedQuests.includes(reqQuestId)) {
              checks.push(`✅ Prereq quest: ${reqQuestId} (completed)`);
            } else {
              checks.push(`❌ Prereq quest: ${reqQuestId} (not completed)`);
              canLearnAbility = false;
            }
          }
        }
      }
    }
  }

  // Check gold cost
  const levelData = ability.levels ? ability.levels[1] : null;
  let goldCost = levelData ? (levelData.learn_cost || 0) : 0;
  if (isCrossClass) goldCost *= 2;

  const playerGold = persona.resources?.gold || 0;
  if (goldCost <= 0) {
    checks.push(`✅ Gold: Free to learn`);
  } else if (playerGold >= goldCost) {
    checks.push(`✅ Gold: ${playerGold} >= ${goldCost}${isCrossClass ? ' (doubled for cross-class)' : ''}`);
  } else {
    checks.push(`❌ Gold: ${playerGold} < ${goldCost}${isCrossClass ? ' (doubled for cross-class)' : ''}`);
    canLearnAbility = false;
  }

  // Check spell capacity (if spell type)
  if (ability.type === 'spell') {
    const mind = persona.stats?.mind || 10;
    const maxSpells = Math.floor(mind / 5);
    const knownSpells = knownAbilities.filter(a => {
      const id = typeof a === 'string' ? a : a.id;
      const ab = loadAbility(id);
      return ab && ab.type === 'spell';
    }).length;

    if (knownSpells < maxSpells) {
      checks.push(`✅ Spell capacity: ${knownSpells}/${maxSpells} (mind ${mind})`);
    } else {
      checks.push(`❌ Spell capacity: ${knownSpells}/${maxSpells} full (need higher mind)`);
      canLearnAbility = false;
    }
  }

  // Output results
  console.log(`Ability: ${ability.name} (${ability.id})`);
  console.log(`Class: ${ability.class || 'Universal'} | Tier: ${abilityTier} | Type: ${ability.type}`);
  console.log(`Cost: ${goldCost}g${isCrossClass ? ' (cross-class doubled)' : ''}`);
  console.log(`\nChecks:`);
  checks.forEach(c => console.log(`  ${c}`));
  console.log(`\nResult: ${canLearnAbility ? '✅ CAN LEARN' : '❌ CANNOT LEARN'}`);

  process.exit(canLearnAbility ? 0 : 1);
}

/**
 * Show abilities newly available to learn at current tier/class
 */
function newlyAvailable(personaYaml) {
  let persona;
  try {
    persona = yaml.parse(personaYaml);
  } catch (e) {
    console.error('Invalid persona YAML');
    process.exit(1);
  }

  const abilities = loadAllAbilities();
  const knownAbilities = persona.abilities?.known || [];
  const knownIds = knownAbilities.map(a => typeof a === 'string' ? a : a.id);
  const playerTier = persona.progression?.tier || 1;
  const playerClass = persona.class || persona.progression?.class || null;
  const playerXP = persona.progression?.xp || 0;

  // Filter to learnable abilities
  const learnable = abilities.filter(a => {
    // Skip already known
    if (knownIds.includes(a.id)) return false;
    // Skip enemy-tagged
    if (a.tags && a.tags.includes('enemy')) return false;
    // Tier gate
    if ((a.tier || 1) > playerTier) return false;
    return true;
  });

  // Categorize
  const sameClass = [];
  const universal = [];
  const crossClass = [];

  for (const a of learnable) {
    const abilityClass = a.class || null;
    if (!abilityClass) {
      universal.push(a);
    } else if (playerClass && abilityClass.toLowerCase() === playerClass.toLowerCase()) {
      sameClass.push(a);
    } else if (playerXP >= 2000) {
      crossClass.push(a);
    }
  }

  const sortByTierName = (a, b) => {
    const tierDiff = (a.tier || 1) - (b.tier || 1);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  };

  sameClass.sort(sortByTierName);
  universal.sort(sortByTierName);
  crossClass.sort(sortByTierName);

  const printAbility = (a, costMultiplier = 1) => {
    const levelData = a.levels ? a.levels[1] : null;
    const cost = levelData ? (levelData.learn_cost || 0) * costMultiplier : 0;
    const tierStr = `T${a.tier || 1}`;
    console.log(`  ${a.id}: ${a.name} (${tierStr}) - ${cost}g`);
  };

  console.log(`Newly Available Abilities for Tier ${playerTier} ${playerClass || 'Unknown'}:\n`);

  if (sameClass.length > 0) {
    console.log(`=== ${playerClass} Class ===`);
    sameClass.forEach(a => printAbility(a));
    console.log('');
  }

  if (universal.length > 0) {
    console.log(`=== Universal ===`);
    universal.forEach(a => printAbility(a));
    console.log('');
  }

  if (crossClass.length > 0) {
    console.log(`=== Cross-Class (2x gold cost) ===`);
    crossClass.forEach(a => printAbility(a, 2));
    console.log('');
  }

  const total = sameClass.length + universal.length + crossClass.length;
  if (total === 0) {
    console.log('No new abilities available at your current tier.');
  } else {
    console.log(`${total} ability(ies) available to learn.`);
  }
}

/**
 * Show willpower cost for an ability
 */
function cost(abilityId, level = '1') {
  const ability = loadAbility(abilityId);
  if (!ability) {
    console.error(`Ability not found: ${abilityId}`);
    process.exit(1);
  }

  const levelNum = parseInt(level, 10);
  const levelData = ability.levels ? ability.levels[levelNum] : null;

  if (!levelData) {
    console.error(`Level ${levelNum} not found for ability ${ability.name}`);
    process.exit(1);
  }

  console.log(`${ability.name} (Level ${levelNum})`);
  console.log(`  Willpower Cost: ${levelData.willpower_cost}`);
  console.log(`  Learn Cost: ${levelData.learn_cost}g`);
  if (ability.limits) {
    if (ability.limits.max_uses) {
      console.log(`  Max Uses: ${ability.limits.max_uses} (resets on ${ability.limits.reset || 'never'})`);
    }
    if (ability.limits.cooldown_rounds) {
      console.log(`  Cooldown: ${ability.limits.cooldown_rounds} rounds`);
    }
  }
}

/**
 * Show all available tags
 */
function tags() {
  const abilities = loadAllAbilities();
  const tagCounts = {};

  abilities.forEach(ability => {
    (ability.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  console.log('Available tags:\n');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} ability(ies)`);
    });
}

// Filter out --world argument and parse remaining args
const filteredArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--world='));
const [command, ...args] = filteredArgs;

switch (command) {
  case 'get':
    get(args[0]);
    break;
  case 'list':
    list(args);
    break;
  case 'search':
    search(args.join(' '));
    break;
  case 'similar':
    similar(args.join(' '));
    break;
  case 'class':
    classAbilities(args[0]);
    break;
  case 'tier':
    tier(args[0]);
    break;
  case 'validate':
    validate(args.join(' '));
    break;
  case 'resolve':
    resolve(args.join(' '));
    break;
  case 'display':
    display(args.join(' '));
    break;
  case 'can-use': {
    const parsed = parseArgs(args);
    canUse(parsed.positional[0], parsed.positional[1], parsed.flags);
    break;
  }
  case 'can-learn': {
    const parsed = parseArgs(args);
    canLearn(parsed.positional[0], parsed.positional[1], parsed.flags);
    break;
  }
  case 'newly-available':
    newlyAvailable(args[0]);
    break;
  case 'cost':
    cost(args[0], args[1] || '1');
    break;
  case 'tags':
    tags();
    break;
  default:
    console.log(`Usage:
  node abilities.js --world=<world> get <id>              Get ability by ID
  node abilities.js --world=<world> list [filters]        List abilities with optional filters
  node abilities.js --world=<world> search <query>        Search abilities by name/description/tags
  node abilities.js --world=<world> similar <name>        Check for similar abilities before creating
  node abilities.js --world=<world> class <class>         Get all abilities for a class
  node abilities.js --world=<world> tier <n>              Get abilities at a specific tier
  node abilities.js --world=<world> validate <yaml>       Validate ability IDs exist in database
  node abilities.js --world=<world> resolve <yaml>        Resolve ability IDs to full data
  node abilities.js --world=<world> display <yaml>        Display abilities in readable format
  node abilities.js --world=<world> can-use <persona> <id> [--github=<gh> --character=<char>]
                                                          Check if persona can use ability
  node abilities.js --world=<world> can-learn <persona> <id> [--github=<gh> --character=<char>]
                                                          Check if persona can learn ability
  node abilities.js --world=<world> newly-available <persona>
                                                          Show abilities available to learn
  node abilities.js --world=<world> cost <id> [level]     Show willpower/learn costs
  node abilities.js --world=<world> tags                  Show all available tags

Required:
  --world=<world>       World ID (e.g., alpha)

Optional (for can-use, can-learn):
  --github=<username>   GitHub username (for quest prereq checks)
  --character=<name>    Character name (for quest prereq checks)

List Filters:
  --type=<type>         Filter by type (spell, ability, passive)
  --subtype=<subtype>   Filter by subtype (physical, mental, creation, etc.)
  --class=<class>       Filter by class (Codebreaker, Loresmith, Voidwalker, Datamancer, null/universal)
  --tier=<n>            Filter by tier (abilities at or below tier n)
  --tags=<tag1,tag2>    Filter by tags (OR logic: any tag matches)
  --tags-all=<t1,t2>    Filter by tags (AND logic: all tags must match)

Examples:
  node abilities.js list --class=Datamancer
  node abilities.js list --type=passive
  node abilities.js list --tier=3 --tags=combat
  node abilities.js search fire
  node abilities.js cost lkhskejx 2
  node abilities.js can-learn '<persona-yaml>' lkhskejx --github=player --character=coda
  node abilities.js newly-available '<persona-yaml>'`);
    process.exit(command ? 1 : 0);
}
