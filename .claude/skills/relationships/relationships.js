#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Parse --world argument from command line
function parseWorldArg() {
  const worldArg = process.argv.find(arg => arg.startsWith('--world='));
  if (!worldArg) {
    console.error('Error: --world parameter is required');
    console.error('Usage: node relationships.js --world=<world-id> <command> [args]');
    console.error('Example: node relationships.js --world=alpha standing <npc-id> <player-id>');
    process.exit(1);
  }
  return worldArg.split('=')[1];
}

const WORLD_ID = parseWorldArg();
const ROOT = path.join(__dirname, '../../..');
const WORLD_ROOT = path.join(ROOT, 'worlds', WORLD_ID);
const PLAYERS_PATH = path.join(WORLD_ROOT, 'players');
const NPC_REGISTRY_DIR = path.join(WORLD_ROOT, 'npcs/registry');
const NPC_META_PATH = path.join(WORLD_ROOT, 'npcs/_meta.yaml');
const NPC_PROFILES_PATH = path.join(WORLD_ROOT, 'npcs/profiles');

// === LOADERS ===

function loadYaml(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return yaml.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveYaml(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, yaml.stringify(data, { lineWidth: 0 }), 'utf8');
}

function getRelationshipsPath(playerId, characterName) {
  // Try to find the active character if not specified
  const playerPath = path.join(PLAYERS_PATH, playerId);
  if (!characterName) {
    const playerFile = path.join(playerPath, 'player.yaml');
    if (fs.existsSync(playerFile)) {
      const player = loadYaml(playerFile);
      characterName = player?.active_character || 'default';
    } else {
      characterName = 'default';
    }
  }
  return path.join(playerPath, 'personas', characterName, 'relationships.yaml');
}

function loadRelationships(playerId, characterName) {
  const filePath = getRelationshipsPath(playerId, characterName);
  const data = loadYaml(filePath);
  if (!data) {
    // Return empty structure
    return {
      relationships: [],
      factions: [],
      summary: {
        total_npcs: 0,
        hostile: 0,
        unfriendly: 0,
        neutral: 0,
        friendly: 0,
        close: 0,
        devoted: 0,
        last_updated: new Date().toISOString()
      }
    };
  }
  return data;
}

function saveRelationships(playerId, characterName, data) {
  const filePath = getRelationshipsPath(playerId, characterName);
  saveYaml(filePath, data);
}

function loadNpcIndex() {
  // Load NPC registry from individual files in npcs/registry/
  const npcs = {};
  if (fs.existsSync(NPC_REGISTRY_DIR)) {
    const files = fs.readdirSync(NPC_REGISTRY_DIR).filter(f =>
      f.endsWith('.yaml') && f !== '_meta.yaml'
    );
    for (const file of files) {
      const data = loadYaml(path.join(NPC_REGISTRY_DIR, file));
      if (data) {
        const key = data.id || file.replace('.yaml', '');
        npcs[key] = data;
      }
    }
  }
  const meta = loadYaml(NPC_META_PATH) || {};
  return {
    npcs,
    disposition_map: meta.disposition_map || {},
    factions: meta.factions || {},
    profile_triggers: meta.profile_triggers || {}
  };
}

function loadNpcProfile(npcId) {
  const profilePath = path.join(NPC_PROFILES_PATH, `${npcId}.yaml`);
  return loadYaml(profilePath);
}

// === DISPOSITION FUNCTIONS ===

function getDisposition(standing) {
  if (standing <= -6) return 'hostile';
  if (standing <= -3) return 'unfriendly';
  if (standing <= 2) return 'neutral';
  if (standing <= 5) return 'friendly';
  if (standing <= 8) return 'close';
  return 'devoted';
}

function dispositionCommand(standingStr) {
  const standing = parseInt(standingStr, 10);
  if (isNaN(standing)) {
    console.error('Invalid standing: must be a number');
    process.exit(1);
  }
  console.log(getDisposition(standing));
}

// === STANDING FUNCTIONS ===

function standingCommand(npcId, playerId) {
  if (!npcId || !playerId) {
    console.error('Usage: standing <npc-id> <player-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const npcIndex = loadNpcIndex();

  // Find existing relationship
  const rel = data.relationships.find(r => r.npc_id === npcId);

  if (rel) {
    console.log(`Standing with ${rel.npc_name || npcId}: ${rel.standing}`);
    console.log(`Disposition: ${rel.disposition || getDisposition(rel.standing)}`);
    if (rel.interactions && rel.interactions.length > 0) {
      const recent = rel.interactions[0];
      console.log(`Last interaction: ${recent.summary} (${recent.date})`);
    }
  } else {
    // Check NPC exists and get default disposition
    const npc = npcIndex.npcs[npcId];
    if (!npc) {
      console.error(`Unknown NPC: ${npcId}`);
      process.exit(1);
    }
    const defaultDisposition = npc.disposition_default || 'neutral';
    const defaultStanding = defaultDisposition === 'friendly' ? 3 :
                           defaultDisposition === 'hostile' ? -5 : 0;
    console.log(`Standing with ${npc.name}: ${defaultStanding} (default)`);
    console.log(`Disposition: ${defaultDisposition}`);
    console.log(`(No recorded interactions)`);
  }
}

function changeStanding(npcId, playerId, changeStr, reason) {
  if (!npcId || !playerId || !changeStr) {
    console.error('Usage: change <npc-id> <player-id> <amount> [reason]');
    process.exit(1);
  }

  const change = parseInt(changeStr, 10);
  if (isNaN(change)) {
    console.error('Invalid amount: must be a number');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const npcIndex = loadNpcIndex();
  const npc = npcIndex.npcs[npcId];

  if (!npc) {
    console.error(`Unknown NPC: ${npcId}`);
    process.exit(1);
  }

  // Find or create relationship
  let rel = data.relationships.find(r => r.npc_id === npcId);

  if (!rel) {
    const defaultDisposition = npc.disposition_default || 'neutral';
    const defaultStanding = defaultDisposition === 'friendly' ? 3 :
                           defaultDisposition === 'hostile' ? -5 : 0;
    rel = {
      npc_id: npcId,
      npc_name: npc.name,
      standing: defaultStanding,
      disposition: defaultDisposition,
      interactions: [],
      knowledge: [],
      player_knowledge: [],
      dialogue_flags: ['introduced'],
      locked_topics: [],
      modifiers: []
    };
    data.relationships.push(rel);
  }

  const oldStanding = rel.standing;
  rel.standing = Math.max(-10, Math.min(10, rel.standing + change));
  rel.disposition = getDisposition(rel.standing);

  // Record interaction
  rel.interactions.unshift({
    date: new Date().toISOString().split('T')[0],
    type: 'interaction',
    summary: reason || `Standing ${change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}`,
    standing_change: change
  });

  // Update summary
  updateSummary(data);

  saveRelationships(playerId, null, data);

  console.log(`${npc.name}: ${oldStanding} → ${rel.standing} (${change >= 0 ? '+' : ''}${change})`);
  console.log(`Disposition: ${rel.disposition}`);
}

function updateSummary(data) {
  const summary = {
    total_npcs: data.relationships.length,
    hostile: 0,
    unfriendly: 0,
    neutral: 0,
    friendly: 0,
    close: 0,
    devoted: 0,
    highest_standing: { npc: null, value: -Infinity },
    lowest_standing: { npc: null, value: Infinity },
    last_updated: new Date().toISOString()
  };

  data.relationships.forEach(rel => {
    const disp = getDisposition(rel.standing);
    summary[disp]++;

    if (rel.standing > summary.highest_standing.value) {
      summary.highest_standing = { npc: rel.npc_id, value: rel.standing };
    }
    if (rel.standing < summary.lowest_standing.value) {
      summary.lowest_standing = { npc: rel.npc_id, value: rel.standing };
    }
  });

  if (summary.highest_standing.value === -Infinity) {
    summary.highest_standing = null;
  }
  if (summary.lowest_standing.value === Infinity) {
    summary.lowest_standing = null;
  }

  data.summary = summary;
}

// === DIALOGUE FUNCTIONS ===

function topicsCommand(npcId, playerId) {
  if (!npcId || !playerId) {
    console.error('Usage: topics <npc-id> <player-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const profile = loadNpcProfile(npcId);
  const rel = data.relationships.find(r => r.npc_id === npcId);

  const standing = rel ? rel.standing : 0;
  const flags = rel ? rel.dialogue_flags || [] : [];

  console.log(`Dialogue topics for ${npcId} (standing: ${standing}):`);
  console.log('\nUnlocked topics:');

  // Always available flags
  flags.forEach(flag => {
    console.log(`  [x] ${flag}`);
  });

  if (profile && profile.dialogue && profile.dialogue.topics) {
    // Check topic availability based on standing
    Object.entries(profile.dialogue.topics).forEach(([topic, content]) => {
      const available = flags.includes(topic) || flags.includes(`can_ask_about_${topic}`);
      if (available) {
        console.log(`  [x] ${topic}`);
      }
    });
  }

  // Show locked topics
  if (rel && rel.locked_topics && rel.locked_topics.length > 0) {
    console.log('\nLocked topics:');
    rel.locked_topics.forEach(locked => {
      console.log(`  [ ] ${locked.id} - requires: ${locked.requirement}`);
    });
  }

  // Show standing-gated content hints
  if (profile && profile.dialogue && profile.dialogue.topics) {
    console.log('\nStanding-gated content:');
    Object.entries(profile.dialogue.topics).forEach(([topic, content]) => {
      if (typeof content === 'object') {
        Object.keys(content).forEach(key => {
          if (key.startsWith('standing_')) {
            const req = parseInt(key.replace('standing_', ''), 10);
            const status = standing >= req ? '[x]' : '[ ]';
            console.log(`  ${status} ${topic} (standing ${req}+)`);
          }
        });
      }
    });
  }
}

function topicCheck(npcId, playerId, topicId) {
  if (!npcId || !playerId || !topicId) {
    console.error('Usage: topic-check <npc-id> <player-id> <topic-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const rel = data.relationships.find(r => r.npc_id === npcId);

  const flags = rel ? rel.dialogue_flags || [] : [];

  if (flags.includes(topicId) || flags.includes(`can_ask_about_${topicId}`)) {
    console.log('true');
    console.log(`Topic "${topicId}" is unlocked`);
  } else {
    console.log('false');
    // Check if it's in locked topics
    if (rel && rel.locked_topics) {
      const locked = rel.locked_topics.find(l => l.id === topicId);
      if (locked) {
        console.log(`Topic "${topicId}" is locked: ${locked.requirement}`);
      } else {
        console.log(`Topic "${topicId}" not found`);
      }
    } else {
      console.log(`Topic "${topicId}" not found`);
    }
  }
}

function topicUnlock(npcId, playerId, topicId) {
  if (!npcId || !playerId || !topicId) {
    console.error('Usage: topic-unlock <npc-id> <player-id> <topic-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const npcIndex = loadNpcIndex();
  const npc = npcIndex.npcs[npcId];

  if (!npc) {
    console.error(`Unknown NPC: ${npcId}`);
    process.exit(1);
  }

  // Find or create relationship
  let rel = data.relationships.find(r => r.npc_id === npcId);
  if (!rel) {
    rel = {
      npc_id: npcId,
      npc_name: npc.name,
      standing: 0,
      disposition: 'neutral',
      interactions: [],
      knowledge: [],
      player_knowledge: [],
      dialogue_flags: ['introduced'],
      locked_topics: [],
      modifiers: []
    };
    data.relationships.push(rel);
  }

  if (!rel.dialogue_flags) rel.dialogue_flags = [];

  if (rel.dialogue_flags.includes(topicId)) {
    console.log(`Topic "${topicId}" was already unlocked`);
    return;
  }

  rel.dialogue_flags.push(topicId);

  // Remove from locked if present
  if (rel.locked_topics) {
    rel.locked_topics = rel.locked_topics.filter(l => l.id !== topicId);
  }

  saveRelationships(playerId, null, data);
  console.log(`Unlocked topic "${topicId}" for ${npc.name}`);
}

// === OVERVIEW FUNCTIONS ===

function allCommand(playerId) {
  if (!playerId) {
    console.error('Usage: all <player-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);

  if (data.relationships.length === 0) {
    console.log('No recorded NPC relationships.');
    return;
  }

  console.log(`NPC Relationships for ${playerId}:`);
  console.log('');

  // Sort by standing (highest first)
  const sorted = [...data.relationships].sort((a, b) => b.standing - a.standing);

  sorted.forEach(rel => {
    const disp = getDisposition(rel.standing);
    const icon = rel.standing >= 3 ? '+' : rel.standing <= -3 ? '-' : '~';
    console.log(`  ${icon} ${rel.npc_name || rel.npc_id}: ${rel.standing} (${disp})`);
  });

  console.log('');
  console.log(`Total: ${data.relationships.length} NPCs`);
  if (data.summary) {
    console.log(`Friendly+: ${data.summary.friendly + data.summary.close + data.summary.devoted}`);
    console.log(`Hostile-: ${data.summary.hostile + data.summary.unfriendly}`);
  }
}

function friendlyCommand(playerId) {
  if (!playerId) {
    console.error('Usage: friendly <player-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const friendly = data.relationships.filter(r => r.standing >= 3);

  if (friendly.length === 0) {
    console.log('No friendly NPCs yet.');
    return;
  }

  console.log(`Friendly NPCs (standing >= 3):`);
  friendly.sort((a, b) => b.standing - a.standing).forEach(rel => {
    console.log(`  ${rel.npc_name || rel.npc_id}: ${rel.standing} (${getDisposition(rel.standing)})`);
  });
}

function hostileCommand(playerId) {
  if (!playerId) {
    console.error('Usage: hostile <player-id>');
    process.exit(1);
  }

  const data = loadRelationships(playerId);
  const hostile = data.relationships.filter(r => r.standing <= -3);

  if (hostile.length === 0) {
    console.log('No hostile NPCs.');
    return;
  }

  console.log(`Hostile NPCs (standing <= -3):`);
  hostile.sort((a, b) => a.standing - b.standing).forEach(rel => {
    console.log(`  ${rel.npc_name || rel.npc_id}: ${rel.standing} (${getDisposition(rel.standing)})`);
  });
}

// === MAIN ===

// Filter out --world argument and parse remaining args
const filteredArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--world='));
const [command, ...args] = filteredArgs;

switch (command) {
  case 'standing':
    standingCommand(args[0], args[1]);
    break;

  case 'disposition':
    dispositionCommand(args[0]);
    break;

  case 'change':
    changeStanding(args[0], args[1], args[2], args.slice(3).join(' '));
    break;

  case 'topics':
    topicsCommand(args[0], args[1]);
    break;

  case 'topic-check':
    topicCheck(args[0], args[1], args[2]);
    break;

  case 'topic-unlock':
    topicUnlock(args[0], args[1], args[2]);
    break;

  case 'all':
    allCommand(args[0]);
    break;

  case 'friendly':
    friendlyCommand(args[0]);
    break;

  case 'hostile':
    hostileCommand(args[0]);
    break;

  default:
    console.log(`Relationships Manager

Usage:
  node relationships.js --world=<world> <command> [args]

Required:
  --world=<world>       World ID (e.g., alpha)

Commands:
  standing <npc> <player>           Get current standing with NPC
  disposition <standing>            Get disposition string from number
  change <npc> <player> <amt> [msg] Change standing with NPC

  topics <npc> <player>             Get available dialogue topics
  topic-check <npc> <player> <id>   Check if topic is unlocked
  topic-unlock <npc> <player> <id>  Unlock a dialogue topic

  all <player>                      List all relationships
  friendly <player>                 List friendly NPCs (standing >= 3)
  hostile <player>                  List hostile NPCs (standing <= -3)

Disposition scale:
  -10 to -6: hostile
  -5 to -3:  unfriendly
  -2 to +2:  neutral
  +3 to +5:  friendly
  +6 to +8:  close
  +9 to +10: devoted`);
    process.exit(command ? 1 : 0);
}
