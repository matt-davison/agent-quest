#!/usr/bin/env node
// scripts/dream-session.js
// Helper for dream/autopilot session management
// Usage: node scripts/dream-session.js <command> [args]

const { readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs");
const path = require("path");

const DREAM_MARKER = "/tmp/agent-quest-dreaming.json";

// --- Utilities ---

function readMarker() {
  if (!existsSync(DREAM_MARKER)) return null;
  try {
    return JSON.parse(readFileSync(DREAM_MARKER, "utf-8"));
  } catch {
    return null;
  }
}

function writeMarker(state) {
  writeFileSync(DREAM_MARKER, JSON.stringify(state, null, 2));
}

function loadDreamPattern(world, github, character) {
  const projectDir = path.resolve(__dirname, "..");
  const paths = [
    path.join(projectDir, `worlds/${world}/players/${github}/personas/${character}/dream-pattern.yaml`),
    path.join(projectDir, `worlds/${world}/players/${github}/personas/${character}/autopilot-config.yaml`),
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      // Simple YAML field extraction (no dependency)
      const text = readFileSync(p, "utf-8");
      return parseSimpleFields(text);
    }
  }
  return null;
}

function parseSimpleFields(text) {
  const fields = {};
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/^(\w[\w_]*):\s*(.+)$/);
    if (match) {
      let val = match[2].trim().replace(/^["']|["']$/g, "");
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (/^\d+$/.test(val)) val = parseInt(val, 10);
      fields[match[1]] = val;
    }
  }
  return fields;
}

function getNestedField(text, path) {
  // Simple nested YAML field lookup e.g. "guardrails.full_autonomy"
  const parts = path.split(".");
  const regex = new RegExp(`^\\s*${parts[parts.length - 1]}:\\s*(.+)$`, "m");
  const match = text.match(regex);
  if (!match) return null;
  let val = match[1].trim().replace(/^["']|["']$/g, "");
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  return val;
}

// --- CLI Commands ---

const command = process.argv[2];

switch (command) {
  case "start-dream": {
    const github = process.argv[3];
    const character = process.argv[4];
    const world = process.argv[5] || "alpha";

    if (!github || !character) {
      console.error("Usage: dream-session.js start-dream <github> <character> [world]");
      process.exit(1);
    }

    // Check for existing dream
    if (existsSync(DREAM_MARKER)) {
      console.error("Dream already active. Wake first before starting a new dream.");
      process.exit(1);
    }

    // Load dream pattern config if it exists
    const pattern = loadDreamPattern(world, github, character);
    const projectDir = path.resolve(__dirname, "..");

    // Also try reading raw YAML for nested fields
    let rawYaml = "";
    const patternPaths = [
      path.join(projectDir, `worlds/${world}/players/${github}/personas/${character}/dream-pattern.yaml`),
      path.join(projectDir, `worlds/${world}/players/${github}/personas/${character}/autopilot-config.yaml`),
    ];
    for (const p of patternPaths) {
      if (existsSync(p)) {
        rawYaml = readFileSync(p, "utf-8");
        break;
      }
    }

    const fullAutonomy = rawYaml ? getNestedField(rawYaml, "guardrails.full_autonomy") === true : false;
    const checkpointInterval = (pattern && pattern.checkpoint_interval) || 5;
    const maxTurns = (pattern && pattern.turns) || null;
    const scope = (pattern && pattern.scope) || "full";
    const mode = fullAutonomy ? "continuous" : ((pattern && pattern.mode) || "continuous");

    const state = {
      player_github: github,
      character: character,
      world: world,
      persona_path: `worlds/${world}/players/${github}/personas/${character}`,
      scope: scope,
      mode: mode,
      goal: (pattern && pattern.goal) || null,
      full_autonomy: fullAutonomy,
      turn_count: 0,
      max_turns: maxTurns,
      checkpoint_interval: checkpointInterval,
      last_checkpoint_turn: 0,
      loop_counter: 0,
      max_loops: 200,
      last_turn_summary: "",
      start_time: new Date().toISOString(),
      anchor_point: null,
      goal_achieved: false,
    };

    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "get-dream": {
    const state = readMarker();
    if (!state) {
      process.exit(1);
    }
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "increment-turn": {
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    state.turn_count++;
    state.loop_counter++;
    writeMarker(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "set-summary": {
    const summary = process.argv.slice(3).join(" ");
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    state.last_turn_summary = summary;
    writeMarker(state);
    console.log("Summary updated");
    break;
  }

  case "checkpoint-due": {
    const state = readMarker();
    if (!state) {
      process.exit(1);
    }
    const interval = state.checkpoint_interval || 5;
    const turnsSinceCheckpoint = state.turn_count - state.last_checkpoint_turn;
    const due = turnsSinceCheckpoint >= interval;
    console.log(due ? "true" : "false");
    break;
  }

  case "checkpoint-done": {
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    state.last_checkpoint_turn = state.turn_count;
    writeMarker(state);
    console.log("Checkpoint recorded");
    break;
  }

  case "should-wake": {
    const state = readMarker();
    if (!state) {
      console.log("true");
      break;
    }

    // Full autonomy never wakes automatically
    if (state.full_autonomy) {
      console.log("false");
      break;
    }

    // Check anchor point
    if (state.anchor_point) {
      console.log("true");
      break;
    }

    // Check goal achieved
    if (state.goal_achieved && state.mode === "goal") {
      console.log("true");
      break;
    }

    // Check turn limit
    if (state.max_turns && state.turn_count >= state.max_turns) {
      console.log("true");
      break;
    }

    // No wake condition met
    console.log("false");
    break;
  }

  case "set-goal-achieved": {
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    state.goal_achieved = true;
    writeMarker(state);
    console.log("Goal marked as achieved");
    break;
  }

  case "set-anchor-point": {
    const reason = process.argv.slice(3).join(" ");
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    state.anchor_point = reason || "Unspecified anchor point";
    writeMarker(state);
    console.log("Anchor point set");
    break;
  }

  case "wake": {
    const state = readMarker();
    if (!state) {
      console.error("No active dream");
      process.exit(1);
    }
    // Delete marker
    unlinkSync(DREAM_MARKER);
    // Print final state for wake summary
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "get-loop-counter": {
    const state = readMarker();
    if (!state) {
      console.log("0");
      break;
    }
    console.log(String(state.loop_counter || 0));
    break;
  }

  case "reset-loop-counter": {
    const state = readMarker();
    if (!state) {
      process.exit(1);
    }
    state.loop_counter = 0;
    writeMarker(state);
    console.log("0");
    break;
  }

  default:
    console.log(`Usage: node scripts/dream-session.js <command> [args]

Commands:
  start-dream <github> <character> [world]  Start a dream session
  get-dream                                  Get current dream state (exit 1 if none)
  increment-turn                             Increment turn_count + loop_counter
  set-summary <text>                         Store last turn summary
  checkpoint-due                             Print true/false based on checkpoint interval
  checkpoint-done                            Mark checkpoint as completed
  should-wake                                Evaluate wake conditions
  set-goal-achieved                          Set goal_achieved flag
  set-anchor-point <reason>                  Set anchor point (triggers wake)
  wake                                       Delete marker, print final state
  get-loop-counter                           Print current loop counter
  reset-loop-counter                         Reset loop counter to 0`);
    break;
}
