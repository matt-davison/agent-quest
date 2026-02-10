#!/usr/bin/env node
// scripts/local-party.js
// Helper for local multiplayer (couch co-op) session management
// Usage: node scripts/local-party.js <command> [args]

const { readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs");
const path = require("path");

const PARTY_MARKER = "/tmp/agent-quest-local-party.yaml";
const DREAM_MARKER = "/tmp/agent-quest-dreaming.json";

// --- Utilities ---

function readMarker() {
  if (!existsSync(PARTY_MARKER)) return null;
  try {
    return JSON.parse(readFileSync(PARTY_MARKER, "utf-8"));
  } catch {
    return null;
  }
}

function writeMarker(state) {
  writeFileSync(PARTY_MARKER, JSON.stringify(state, null, 2));
}

function loadPersonaSummary(world, github, character) {
  const projectDir = path.resolve(__dirname, "..");
  const personaPath = path.join(
    projectDir,
    `worlds/${world}/players/${github}/personas/${character}/persona.yaml`
  );
  if (!existsSync(personaPath)) return null;

  const text = readFileSync(personaPath, "utf-8");
  const fields = {};

  // Extract key fields from persona YAML
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  if (nameMatch) fields.name = nameMatch[1].trim().replace(/^["']|["']$/g, "");

  const classMatch = text.match(/^class:\s*(.+)$/m);
  if (classMatch)
    fields.class = classMatch[1].trim().replace(/^["']|["']$/g, "");

  const levelMatch = text.match(/^\s*level:\s*(\d+)/m);
  if (levelMatch) fields.level = parseInt(levelMatch[1], 10);

  const hpMatch = text.match(/^\s*current:\s*(\d+)/m);
  if (hpMatch) fields.hp = parseInt(hpMatch[1], 10);

  const maxHpMatch = text.match(/^\s*max:\s*(\d+)/m);
  if (maxHpMatch) fields.max_hp = parseInt(maxHpMatch[1], 10);

  const locationMatch = text.match(/^\s*current_location:\s*(.+)$/m);
  if (locationMatch)
    fields.location = locationMatch[1].trim().replace(/^["']|["']$/g, "");

  const goldMatch = text.match(/^\s*gold:\s*(\d+)/m);
  if (goldMatch) fields.gold = parseInt(goldMatch[1], 10);

  return fields;
}

function calculateGroups(characters) {
  const groups = {};
  const groupLabels = "abcdefghijklmnopqrstuvwxyz";
  const locationMap = {};

  // Group characters by location
  for (const char of characters) {
    const loc = char.location || "unknown";
    if (!locationMap[loc]) locationMap[loc] = [];
    locationMap[loc].push(char.character);
  }

  // Assign group labels
  let groupIdx = 0;
  for (const [location, members] of Object.entries(locationMap)) {
    const label = groupLabels[groupIdx] || `group-${groupIdx}`;
    groups[label] = { location, members };
    // Update character group assignments
    for (const char of characters) {
      if (members.includes(char.character)) {
        char.group = label;
      }
    }
    groupIdx++;
  }

  return groups;
}

function generateSessionId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `lp-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

// --- CLI Commands ---

const command = process.argv[2];

switch (command) {
  case "create": {
    // Parse args: --world <world> --github <github> --char <char> [--char <char> ...]
    const args = process.argv.slice(3);
    let world = "alpha";
    let github = null;
    const characters = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--world" && args[i + 1]) {
        world = args[++i];
      } else if (args[i] === "--github" && args[i + 1]) {
        github = args[++i];
      } else if (args[i] === "--char" && args[i + 1]) {
        characters.push(args[++i]);
      }
    }

    if (!github) {
      console.error(
        "Usage: local-party.js create --github <github> --char <char> [--char <char> ...] [--world <world>]"
      );
      process.exit(1);
    }

    if (characters.length < 2) {
      console.error("Local party requires at least 2 characters.");
      process.exit(1);
    }

    if (characters.length > 4) {
      console.error("Local party supports a maximum of 4 characters.");
      process.exit(1);
    }

    // Check for active dream session (mutually exclusive)
    if (existsSync(DREAM_MARKER)) {
      console.error(
        "Cannot start local party while a Dream session is active. Wake first."
      );
      process.exit(1);
    }

    // Check for existing local party
    if (existsSync(PARTY_MARKER)) {
      console.error(
        "Local party already active. End it first before starting a new one."
      );
      process.exit(1);
    }

    // Validate all characters belong to the github user and load summaries
    const charData = [];
    for (const char of characters) {
      const summary = loadPersonaSummary(world, github, char);
      if (!summary) {
        console.error(
          `Character "${char}" not found for player ${github} in world ${world}.`
        );
        process.exit(1);
      }
      charData.push({
        character: char,
        name: summary.name || char,
        class: summary.class || "Unknown",
        level: summary.level || 1,
        hp: summary.hp,
        max_hp: summary.max_hp,
        gold: summary.gold || 0,
        location: summary.location || "unknown",
        group: null,
      });
    }

    // Calculate initial groups based on locations
    const groups = calculateGroups(charData);

    // Build turn order: iterate groups, within each group list members in order
    const turnOrder = [];
    for (const [, groupInfo] of Object.entries(groups)) {
      for (const member of groupInfo.members) {
        if (!turnOrder.includes(member)) {
          turnOrder.push(member);
        }
      }
    }

    const state = {
      session_id: generateSessionId(),
      world,
      github,
      created: new Date().toISOString(),
      characters: charData,
      turn: {
        round: 1,
        order: turnOrder,
        current_index: 0,
      },
      groups,
    };

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "status": {
    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "next-turn": {
    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    // Find unique groups in turn order
    const groupOrder = [];
    const seen = new Set();
    for (const charId of state.turn.order) {
      const char = state.characters.find((c) => c.character === charId);
      if (char && char.group && !seen.has(char.group)) {
        seen.add(char.group);
        groupOrder.push(char.group);
      }
    }

    // Current group
    const currentChar =
      state.characters.find(
        (c) => c.character === state.turn.order[state.turn.current_index]
      ) || state.characters[0];
    const currentGroup = currentChar.group;
    const currentGroupIdx = groupOrder.indexOf(currentGroup);

    // Advance to next group
    const nextGroupIdx = (currentGroupIdx + 1) % groupOrder.length;
    const nextGroup = groupOrder[nextGroupIdx];

    // If we wrapped around, increment round
    if (nextGroupIdx <= currentGroupIdx) {
      state.turn.round++;
    }

    // Set current_index to the first character in the next group
    const nextGroupFirstChar = state.turn.order.find((charId) => {
      const char = state.characters.find((c) => c.character === charId);
      return char && char.group === nextGroup;
    });
    state.turn.current_index = state.turn.order.indexOf(nextGroupFirstChar);

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "split": {
    // Usage: local-party.js split <character> [--to-group <group-id>]
    const charId = process.argv[3];
    const args = process.argv.slice(4);
    let toGroup = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--to-group" && args[i + 1]) {
        toGroup = args[++i];
      }
    }

    if (!charId) {
      console.error("Usage: local-party.js split <character> [--to-group <group-id>]");
      process.exit(1);
    }

    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    const char = state.characters.find((c) => c.character === charId);
    if (!char) {
      console.error(`Character "${charId}" not in local party.`);
      process.exit(1);
    }

    const oldGroup = char.group;

    // Determine new group label
    if (!toGroup) {
      // Generate a new group label not already in use
      const usedLabels = new Set(Object.keys(state.groups));
      const labels = "abcdefghijklmnopqrstuvwxyz";
      for (const l of labels) {
        if (!usedLabels.has(l)) {
          toGroup = l;
          break;
        }
      }
    }

    // Remove from old group
    if (state.groups[oldGroup]) {
      state.groups[oldGroup].members = state.groups[oldGroup].members.filter(
        (m) => m !== charId
      );
      // Remove empty groups
      if (state.groups[oldGroup].members.length === 0) {
        delete state.groups[oldGroup];
      }
    }

    // Add to new group
    if (!state.groups[toGroup]) {
      state.groups[toGroup] = {
        location: char.location,
        members: [],
      };
    }
    state.groups[toGroup].members.push(charId);
    char.group = toGroup;

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "merge": {
    // Usage: local-party.js merge <group-a> <group-b>
    const groupA = process.argv[3];
    const groupB = process.argv[4];

    if (!groupA || !groupB) {
      console.error("Usage: local-party.js merge <group-a> <group-b>");
      process.exit(1);
    }

    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    if (!state.groups[groupA]) {
      console.error(`Group "${groupA}" does not exist.`);
      process.exit(1);
    }
    if (!state.groups[groupB]) {
      console.error(`Group "${groupB}" does not exist.`);
      process.exit(1);
    }

    // Merge B into A
    for (const member of state.groups[groupB].members) {
      state.groups[groupA].members.push(member);
      const char = state.characters.find((c) => c.character === member);
      if (char) {
        char.group = groupA;
        char.location = state.groups[groupA].location;
      }
    }
    delete state.groups[groupB];

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "update-location": {
    // Usage: local-party.js update-location <character> <location-id>
    const charId = process.argv[3];
    const locationId = process.argv[4];

    if (!charId || !locationId) {
      console.error(
        "Usage: local-party.js update-location <character> <location-id>"
      );
      process.exit(1);
    }

    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    const char = state.characters.find((c) => c.character === charId);
    if (!char) {
      console.error(`Character "${charId}" not in local party.`);
      process.exit(1);
    }

    char.location = locationId;

    // Recalculate groups after location change
    state.groups = calculateGroups(state.characters);

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "update-groups": {
    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    // Recalculate groups based on current character locations
    state.groups = calculateGroups(state.characters);

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "end": {
    const state = readMarker();
    if (!state) {
      console.error("No active local party.");
      process.exit(1);
    }

    // Delete marker
    unlinkSync(PARTY_MARKER);

    // Print final state for session summary
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  default:
    console.log(`Usage: node scripts/local-party.js <command> [args]

Commands:
  create --github <gh> --char <c> [--char <c> ...] [--world <w>]
                                       Create local party session (2-4 chars)
  status                               Get current party state (exit 1 if none)
  next-turn                            Advance to next group's turn
  split <character> [--to-group <id>]  Move character to new/different group
  merge <group-a> <group-b>            Merge two groups (B into A)
  update-location <character> <loc>    Update character location + regroup
  update-groups                        Recalculate groups from current locations
  end                                  Delete marker, print final state`);
    break;
}
