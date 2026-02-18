#!/usr/bin/env node
// scripts/multiplayer-session.js
// Unified multiplayer session management — replaces both local-party.js and rt-session.js
// Supports local (couch co-op), remote (RT), and hybrid sessions via a single marker file.
// Usage: node scripts/multiplayer-session.js <command> [args]

const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } = require("fs");
const path = require("path");

// --- Constants ---

const REPO = "matt-davison/agent-quest";
const SESSION_MARKER = "/tmp/agent-quest-session.yaml";
const DREAM_MARKER = "/tmp/agent-quest-dreaming.json";

// Legacy markers (backward compat)
const LEGACY_RT_MARKER = "/tmp/agent-quest-rt-session";
const LEGACY_LP_MARKER = "/tmp/agent-quest-local-party.yaml";

// RT temp file prefixes (unchanged from rt-session.js)
const RT_OUTBOX_PREFIX = "/tmp/agent-quest-rt-outbox-";
const RT_STATE_PREFIX = "/tmp/agent-quest-rt-state-";
const RT_LASTSEEN_PREFIX = "/tmp/agent-quest-rt-lastseen-";
const RT_LOOPS_PREFIX = "/tmp/agent-quest-rt-loops-";

// --- Utilities ---

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      timeout: 15000,
      ...opts,
    }).trim();
  } catch {
    return null;
  }
}

function getGitHubUser() {
  return exec('gh api user -q ".login"');
}

function generateSessionId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6);
  return `ms-${date}-${time}-${rand}`;
}

// --- Session Marker I/O ---

function readSession() {
  if (!existsSync(SESSION_MARKER)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_MARKER, "utf-8"));
  } catch {
    return null;
  }
}

function writeSession(state) {
  writeFileSync(SESSION_MARKER, JSON.stringify(state, null, 2));
}

function getActiveSessionId() {
  const session = readSession();
  return session ? session.session_id : null;
}

// --- Persona Loading ---

function loadPersonaSummary(world, github, character) {
  const projectDir = path.resolve(__dirname, "..");
  const personaPath = path.join(
    projectDir,
    `worlds/${world}/players/${github}/personas/${character}/persona.yaml`
  );
  if (!existsSync(personaPath)) return null;

  const text = readFileSync(personaPath, "utf-8");
  const fields = {};

  const nameMatch = text.match(/^name:\s*(.+)$/m);
  if (nameMatch) fields.name = nameMatch[1].trim().replace(/^["']|["']$/g, "");

  const classMatch = text.match(/^class:\s*(.+)$/m);
  if (classMatch) fields.class = classMatch[1].trim().replace(/^["']|["']$/g, "");

  const levelMatch = text.match(/^\s*level:\s*(\d+)/m);
  if (levelMatch) fields.level = parseInt(levelMatch[1], 10);

  const hpMatch = text.match(/^\s*current:\s*(\d+)/m);
  if (hpMatch) fields.hp = parseInt(hpMatch[1], 10);

  const maxHpMatch = text.match(/^\s*max:\s*(\d+)/m);
  if (maxHpMatch) fields.max_hp = parseInt(maxHpMatch[1], 10);

  // Willpower
  const wpText = text.match(/willpower:\s*\n\s*current:\s*(\d+)\s*\n\s*max:\s*(\d+)/m);
  if (wpText) {
    fields.wp = parseInt(wpText[1], 10);
    fields.max_wp = parseInt(wpText[2], 10);
  }

  const locationMatch = text.match(/^\s*current_location:\s*(.+)$/m);
  if (locationMatch) fields.location = locationMatch[1].trim().replace(/^["']|["']$/g, "");

  const goldMatch = text.match(/^\s*gold:\s*(\d+)/m);
  if (goldMatch) fields.gold = parseInt(goldMatch[1], 10);

  return fields;
}

// --- Group Calculation ---

function calculateGroups(participants) {
  const groups = {};
  const groupLabels = "abcdefghijklmnopqrstuvwxyz";
  const locationMap = {};

  for (const p of participants) {
    const loc = p.location || "unknown";
    if (!locationMap[loc]) locationMap[loc] = [];
    locationMap[loc].push(p.id);
  }

  let groupIdx = 0;
  for (const [location, members] of Object.entries(locationMap)) {
    const label = groupLabels[groupIdx] || `group-${groupIdx}`;
    groups[label] = { location, members };
    for (const p of participants) {
      if (members.includes(p.id)) {
        p.group = label;
      }
    }
    groupIdx++;
  }

  return groups;
}

// --- Compute session_type from transports ---

function computeSessionType(participants) {
  const transports = new Set(participants.map((p) => p.transport));
  if (transports.has("local") && transports.has("remote")) return "hybrid";
  if (transports.has("remote")) return "remote";
  return "local";
}

// --- GitHub API Helpers (from rt-session.js) ---

function getRemoteFileContent(branch, filePath) {
  const result = exec(
    `gh api "repos/${REPO}/contents/${filePath}" --method GET -f ref="${branch}" -q ".content" 2>/dev/null`
  );
  if (!result) return null;
  return Buffer.from(result, "base64").toString("utf-8");
}

function getRemoteFileSha(branch, filePath) {
  return exec(
    `gh api "repos/${REPO}/contents/${filePath}" --method GET -f ref="${branch}" -q ".sha" 2>/dev/null`
  );
}

function pushFileToRemote(branch, filePath, content, message) {
  const b64 = Buffer.from(content).toString("base64");
  const sha = getRemoteFileSha(branch, filePath);
  const shaFlag = sha ? `-f sha="${sha}"` : "";
  const cmd = `gh api "repos/${REPO}/contents/${filePath}" --method PUT -f message="${message}" -f branch="${branch}" -f content="${b64}" ${shaFlag}`;
  return exec(cmd);
}

function ensureBranchExists(branch, baseBranch = "main") {
  const exists = exec(
    `gh api "repos/${REPO}/git/ref/heads/${branch}" -q ".ref" 2>/dev/null`
  );
  if (exists) return true;

  const baseSha = exec(
    `gh api "repos/${REPO}/git/ref/heads/${baseBranch}" -q ".object.sha" 2>/dev/null`
  );
  if (!baseSha) return false;

  const result = exec(
    `gh api "repos/${REPO}/git/refs" --method POST -f ref="refs/heads/${branch}" -f sha="${baseSha}" 2>/dev/null`
  );
  return !!result;
}

// --- Simple YAML Helpers ---

function getYamlField(text, field) {
  const match = text.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

function getMessageSeqs(outboxText) {
  const seqs = [];
  const matches = outboxText.matchAll(/^\s*-\s*seq:\s*(\d+)/gm);
  for (const m of matches) {
    seqs.push(parseInt(m[1], 10));
  }
  return seqs;
}

function getMaxSeq(outboxText) {
  const seqs = getMessageSeqs(outboxText);
  return seqs.length > 0 ? Math.max(...seqs) : 0;
}

function getMessagesAfterSeq(outboxText, afterSeq) {
  const blocks = outboxText.split(/(?=\s+-\s+seq:\s+)/);
  const results = [];
  for (const block of blocks) {
    const seqMatch = block.match(/seq:\s*(\d+)/);
    if (seqMatch && parseInt(seqMatch[1], 10) > afterSeq) {
      const seq = parseInt(seqMatch[1], 10);
      const type = block.match(/type:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "unknown";
      const narrative = block.match(/narrative:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const to = block.match(/^\s+to:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim().replace(/^["']|["']$/g, "") || null;
      results.push({ seq, type, narrative, to, raw: block.trim() });
    }
  }
  return results;
}

// --- Cursor Management ---

function getLastSeen(sessionId, playerGithub) {
  const file = `${RT_LASTSEEN_PREFIX}${sessionId}-${playerGithub}`;
  if (!existsSync(file)) return 0;
  try {
    return parseInt(readFileSync(file, "utf-8").trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function setLastSeen(sessionId, playerGithub, seq) {
  const file = `${RT_LASTSEEN_PREFIX}${sessionId}-${playerGithub}`;
  writeFileSync(file, String(seq));
}

// --- Loop Counter ---

function getLoopCounter(sessionId) {
  const file = `${RT_LOOPS_PREFIX}${sessionId}`;
  if (!existsSync(file)) return 0;
  try {
    return parseInt(readFileSync(file, "utf-8").trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function incrementLoopCounter(sessionId) {
  const count = getLoopCounter(sessionId) + 1;
  writeFileSync(`${RT_LOOPS_PREFIX}${sessionId}`, String(count));
  return count;
}

function resetLoopCounter(sessionId) {
  writeFileSync(`${RT_LOOPS_PREFIX}${sessionId}`, "0");
}

// --- Session Timeout ---

function isSessionTimedOut(sessionYaml, timeoutMinutes = 10) {
  const lastActivity = getYamlField(sessionYaml, "last_activity");
  if (!lastActivity) return false;
  const lastTime = new Date(lastActivity).getTime();
  return Date.now() - lastTime > timeoutMinutes * 60 * 1000;
}

// --- Inbox Helpers ---

function getPriority(type) {
  const priorities = {
    "rt-invite": "high",
    "duel-challenge": "high",
    "trade-offer": "medium",
    "guild-invite": "medium",
    "party-invite": "medium",
    "mail": "low",
    "friend-request": "low",
  };
  return priorities[type] || "low";
}

function getNotificationIcon(type) {
  const icons = {
    "rt-invite": "🔴",
    "duel-challenge": "⚔️",
    "trade-offer": "💰",
    "guild-invite": "🏛️",
    "party-invite": "👥",
    "mail": "📧",
    "friend-request": "🤝",
  };
  return icons[type] || "📨";
}

function getExpiryTime(block) {
  const expiresStr = block.match(/expires:\s*["']?([^"'\n]+)["']?/)?.[1]?.trim();
  if (!expiresStr) return null;
  const expiresAt = new Date(expiresStr).getTime();
  if (isNaN(expiresAt)) return null;
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return "EXPIRED";
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `in ${diffMin} minute${diffMin !== 1 ? "s" : ""}`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `in ${diffHr} hour${diffHr !== 1 ? "s" : ""}`;
  const diffDays = Math.floor(diffHr / 24);
  return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

function padRight(str, length) {
  const visible = str.replace(/[\u{1F000}-\u{1FFFF}]/gu, "  ").replace(/[\u{2600}-\u{27FF}]/gu, " ");
  const pad = length - visible.length;
  return str + " ".repeat(Math.max(0, pad));
}

function checkInbox(playerGithub) {
  exec(`git fetch origin "refs/heads/inbox/${playerGithub}" 2>/dev/null || true`);

  const content = exec(
    `git show "origin/inbox/${playerGithub}:notifications.yaml" 2>/dev/null`
  );
  if (!content) return [];

  const blocks = content.split(/(?=\s+-\s+seq:\s+)/);
  const pending = [];
  for (const block of blocks) {
    const status = block.match(/status:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
    if (status === "pending" || status === "unread" || status === "delivered") {
      const seq = block.match(/seq:\s*(\d+)/)?.[1] || "?";
      const type = block.match(/type:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "unknown";
      const from = block.match(/from:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "unknown";
      const fromChar = block.match(/from_character:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const message = block.match(/message:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const subject = block.match(/subject:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const sessionId = block.match(/session_id:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const priority = getPriority(type);
      const expiresIn = getExpiryTime(block);
      pending.push({ seq, type, from, fromChar, message, subject, sessionId, status, priority, expiresIn });
    }
  }
  return pending;
}

// --- RT Message Checking ---

function checkForNewMessages(sessionId, myGithub) {
  exec(`git fetch origin "refs/heads/rt/${sessionId}/msg/*:refs/remotes/origin/rt/${sessionId}/msg/*" 2>/dev/null || true`);
  exec(`git fetch origin "refs/heads/rt/${sessionId}/session" 2>/dev/null || true`);

  const sessionYaml = exec(
    `git show "origin/rt/${sessionId}/session:session.yaml" 2>/dev/null`
  );
  if (!sessionYaml) return [];
  if (isSessionTimedOut(sessionYaml)) return [];

  const hostGithub = getYamlField(sessionYaml, "  github") || "";
  const participants = [hostGithub];

  const guestMatches = sessionYaml.matchAll(/- github:\s*["']?(.+?)["']?\s*$/gm);
  for (const m of guestMatches) {
    if (!participants.includes(m[1].trim())) {
      participants.push(m[1].trim());
    }
  }

  const newMessages = [];
  for (const player of participants) {
    if (player === myGithub || !player) continue;

    const outbox = exec(
      `git show "origin/rt/${sessionId}/msg/${player}:outbox.yaml" 2>/dev/null`
    );
    if (!outbox) continue;

    const lastSeen = getLastSeen(sessionId, player);
    const messages = getMessagesAfterSeq(outbox, lastSeen);

    if (messages.length > 0) {
      const character = getYamlField(outbox, "character") || player;
      const maxSeq = Math.max(...messages.map((m) => m.seq));
      setLastSeen(sessionId, player, maxSeq);
      newMessages.push({ player, character, messages });
    }
  }

  return newMessages;
}

// --- Format Helpers ---

function formatInboxNotifications(notifications) {
  if (notifications.length === 0) return "";

  const BOX_WIDTH = 61;
  const INNER_WIDTH = BOX_WIDTH - 2; // inside the │ chars

  function boxLine(text) {
    // Pad text to fill inner width (accounting for emoji widths)
    const visible = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, "  ").replace(/[\u{2600}-\u{27FF}]/gu, " ");
    const pad = INNER_WIDTH - visible.length;
    return `║ ${text}${" ".repeat(Math.max(0, pad - 1))}║`;
  }

  function truncate(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + "...";
  }

  const lines = [];
  lines.push(`╔${"═".repeat(BOX_WIDTH)}╗`);

  const title = `📬 INBOX NOTIFICATIONS (${notifications.length})`;
  const titleVisible = title.replace(/[\u{1F000}-\u{1FFFF}]/gu, "  ").replace(/[\u{2600}-\u{27FF}]/gu, " ");
  const titlePad = Math.floor((INNER_WIDTH - titleVisible.length) / 2);
  const titleRight = INNER_WIDTH - titleVisible.length - titlePad;
  lines.push(`║${" ".repeat(titlePad)}${title}${" ".repeat(Math.max(0, titleRight - 1))}║`);

  // Group by priority
  const priorityGroups = [
    { key: "high", label: "🔴 HIGH PRIORITY", notifications: [] },
    { key: "medium", label: "🟡 AWAITING RESPONSE", notifications: [] },
    { key: "low", label: "📋 GENERAL", notifications: [] },
  ];

  for (const n of notifications) {
    const group = priorityGroups.find(g => g.key === n.priority) || priorityGroups[2];
    group.notifications.push(n);
  }

  let itemNum = 1;
  let firstGroup = true;

  for (const group of priorityGroups) {
    if (group.notifications.length === 0) continue;

    lines.push(`╠${"═".repeat(BOX_WIDTH)}╣`);
    lines.push(boxLine(` ${group.label}`));

    for (const n of group.notifications) {
      const icon = getNotificationIcon(n.type);
      const sender = n.fromChar ? `${n.fromChar} (${n.from})` : n.from;
      const typeLabel = n.type.replace(/-/g, " ").toUpperCase();

      lines.push(boxLine(`  ${itemNum}. [${typeLabel}] ${icon} ${truncate(sender, 30)}`));

      // Type-specific detail lines
      switch (n.type) {
        case "rt-invite":
          lines.push(boxLine(`     → Realtime session invitation`));
          if (n.sessionId) lines.push(boxLine(`     → Session: ${truncate(n.sessionId, 40)}`));
          break;
        case "duel-challenge":
          lines.push(boxLine(`     → Challenges you to a duel`));
          if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        case "trade-offer":
          lines.push(boxLine(`     → Sent a trade offer`));
          if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        case "mail":
          if (n.subject) lines.push(boxLine(`     → Subject: "${truncate(n.subject, 40)}"`));
          else if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        case "party-invite":
          lines.push(boxLine(`     → Party invitation`));
          if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        case "guild-invite":
          lines.push(boxLine(`     → Guild invitation`));
          if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        case "friend-request":
          lines.push(boxLine(`     → Friend request`));
          if (n.message) lines.push(boxLine(`     → ${truncate(n.message, 45)}`));
          break;
        default:
          if (n.message || n.subject) lines.push(boxLine(`     → ${truncate(n.message || n.subject, 45)}`));
      }

      if (n.expiresIn) {
        const expLabel = n.expiresIn === "EXPIRED" ? "⚠️  EXPIRED" : `⏱  Expires: ${n.expiresIn}`;
        lines.push(boxLine(`     → ${expLabel}`));
      }

      itemNum++;
    }
  }

  lines.push(`╚${"═".repeat(BOX_WIDTH)}╝`);
  return lines.join("\n");
}

function formatRtMessages(allPlayerMessages) {
  if (allPlayerMessages.length === 0) return "";
  const lines = ["[RT UPDATE] New actions from other players:"];

  for (const { player, character, messages } of allPlayerMessages) {
    for (const msg of messages) {
      if (msg.narrative) {
        lines.push(`[${player}/${character}] ${msg.narrative}`);
      } else {
        lines.push(`[${player}/${character}] (${msg.type}) seq:${msg.seq}`);
      }
    }
  }
  lines.push("Process these actions and narrate the results.");
  return lines.join("\n");
}

// --- CLI Commands ---

const command = process.argv[2];

switch (command) {
  // ==========================================================================
  // SESSION LIFECYCLE
  // ==========================================================================

  case "create": {
    const args = process.argv.slice(3);
    let world = "alpha";
    let github = null;
    const characters = [];
    const remoteGuests = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--world" && args[i + 1]) {
        world = args[++i];
      } else if (args[i] === "--github" && args[i + 1]) {
        github = args[++i];
      } else if (args[i] === "--char" && args[i + 1]) {
        characters.push(args[++i]);
      } else if (args[i] === "--remote-guest" && args[i + 1]) {
        remoteGuests.push(args[++i]);
      }
    }

    if (!github) {
      github = getGitHubUser();
    }
    if (!github) {
      console.error("Usage: multiplayer-session.js create --github <gh> --char <c> [--char <c>] [--remote-guest <gh>] [--world <w>]");
      process.exit(1);
    }

    if (characters.length < 1) {
      console.error("At least one character required.");
      process.exit(1);
    }

    if (characters.length > 4) {
      console.error("Maximum 4 local characters.");
      process.exit(1);
    }

    // Check for active dream session
    if (existsSync(DREAM_MARKER)) {
      console.error("Cannot start session while a Dream session is active. Wake first.");
      process.exit(1);
    }

    // Check for existing session
    if (existsSync(SESSION_MARKER)) {
      console.error("A multiplayer session is already active. End it first.");
      process.exit(1);
    }

    // Build participants from local characters
    const participants = [];
    for (const char of characters) {
      const summary = loadPersonaSummary(world, github, char);
      if (!summary) {
        console.error(`Character "${char}" not found for player ${github} in world ${world}.`);
        process.exit(1);
      }
      participants.push({
        id: char,
        github,
        character: char,
        transport: "local",
        role: "player",
        name: summary.name || char,
        class: summary.class || "Unknown",
        level: summary.level || 1,
        hp: summary.hp,
        max_hp: summary.max_hp,
        wp: summary.wp,
        max_wp: summary.max_wp,
        gold: summary.gold || 0,
        location: summary.location || "unknown",
        group: null,
      });
    }

    // Add remote guest placeholders
    for (const guestGithub of remoteGuests) {
      participants.push({
        id: guestGithub,
        github: guestGithub,
        character: "",
        transport: "remote",
        role: "player",
        name: guestGithub,
        class: "",
        level: 0,
        hp: 0,
        max_hp: 0,
        wp: 0,
        max_wp: 0,
        gold: 0,
        location: participants[0]?.location || "unknown",
        group: null,
        status: "invited",
      });
    }

    // Calculate groups
    const groups = calculateGroups(participants);

    const sessionId = generateSessionId();
    const hasRemote = remoteGuests.length > 0;

    const state = {
      session_id: sessionId,
      world,
      session_type: computeSessionType(participants),
      host: { github },
      created: new Date().toISOString(),
      participants,
      groups,
      turn: {
        round: 1,
        mode: "group",
        current_group: Object.keys(groups)[0] || "a",
        pending_actions: {
          local: [],
          remote_awaiting: remoteGuests.map((g) => g),
        },
      },
      remote: {
        enabled: hasRemote,
        outbox_path: hasRemote ? `${RT_OUTBOX_PREFIX}${sessionId}.yaml` : null,
        state_path: hasRemote ? `${RT_STATE_PREFIX}${sessionId}.yaml` : null,
        max_idle_polls: 5,
        poll_interval_sec: 3,
      },
    };

    // If remote participants, set up RT branches
    if (hasRemote) {
      const now = new Date().toISOString();

      // Build session.yaml for remote branch (backward compat with RT system)
      let guestYaml = "";
      for (const g of remoteGuests) {
        guestYaml += `  - github: "${g}"\n    character: ""\n    status: invited\n    role: player\n`;
      }

      const sessionBranchYaml = `session_id: "${sessionId}"
created: "${now}"
status: active
host:
  github: "${github}"
  character: "${characters[0]}"
guests:
${guestYaml || "  []"}
settings:
  max_idle_polls: 5
  poll_interval_sec: 3
  turn_mode: simultaneous
last_activity: "${now}"
`;

      const outboxYaml = `player: "${github}"
character: "${characters[0]}"
messages: []
`;

      const sessionBranch = `rt/${sessionId}/session`;
      const msgBranch = `rt/${sessionId}/msg/${github}`;
      const stateBranch = `rt/${sessionId}/state`;

      const ok1 = ensureBranchExists(sessionBranch);
      const ok2 = ensureBranchExists(msgBranch);
      const ok3 = ensureBranchExists(stateBranch);

      if (!ok1 || !ok2 || !ok3) {
        console.error("Failed to create RT branches");
        process.exit(1);
      }

      pushFileToRemote(sessionBranch, "session.yaml", sessionBranchYaml, `Session: create ${sessionId}`);
      pushFileToRemote(msgBranch, "outbox.yaml", outboxYaml, `Session: init outbox for ${github}`);
      pushFileToRemote(stateBranch, "state.yaml", `version: 0\ntimestamp: "${now}"\npending_deltas: {}\n`, `Session: init state for ${sessionId}`);

      // Also write legacy RT marker for backward compat during transition
      writeFileSync(LEGACY_RT_MARKER, sessionId);
    }

    writeSession(state);
    console.log(JSON.stringify(state, null, 2));
    break;
  }

  case "join": {
    const sid = process.argv[3];
    const character = process.argv[4] || "Unknown";
    const joinArgs = process.argv.slice(5);
    let isSpectator = joinArgs.includes("--spectator");

    const github = getGitHubUser();
    if (!sid || !github) {
      console.error("Usage: multiplayer-session.js join <session-id> <character> [--spectator]");
      process.exit(1);
    }

    const role = isSpectator ? "spectator" : "player";

    // Create msg branch for players
    if (!isSpectator) {
      const msgBranch = `rt/${sid}/msg/${github}`;
      ensureBranchExists(msgBranch);

      const outboxYaml = `player: "${github}"\ncharacter: "${character}"\nmessages: []\n`;
      pushFileToRemote(msgBranch, "outbox.yaml", outboxYaml, `Session: init outbox for ${github}`);
    }

    // Update remote session.yaml
    const sessionBranch = `rt/${sid}/session`;
    const sessionContent = getRemoteFileContent(sessionBranch, "session.yaml");
    if (sessionContent) {
      const guestExists = sessionContent.includes(`github: "${github}"`);
      let updated;

      if (guestExists) {
        updated = sessionContent
          .replace(
            new RegExp(`(- github: "${github}"\\n\\s+character: )"[^"]*"(\\n\\s+status: )\\w+(\\n\\s+role: )\\w+`, "m"),
            `$1"${character}"$2joined$3${role}`
          )
          .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);

        if (updated === sessionContent.replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`)) {
          updated = sessionContent
            .replace(
              new RegExp(`(- github: "${github}"\\n\\s+character: )"[^"]*"(\\n\\s+status: )\\w+`, "m"),
              `$1"${character}"$2joined\n    role: ${role}`
            )
            .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
        }
      } else {
        const newGuest = `  - github: "${github}"\n    character: "${character}"\n    status: joined\n    role: ${role}\n`;
        updated = sessionContent
          .replace(/^(settings:)/m, `${newGuest}$1`)
          .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
      }

      pushFileToRemote(sessionBranch, "session.yaml", updated, `Session: ${github} joined${isSpectator ? " as spectator" : ""}`);
    }

    // Set local markers
    writeFileSync(LEGACY_RT_MARKER, sid);

    // Create/update unified session marker
    const existingSession = readSession();
    if (existingSession && existingSession.session_id === sid) {
      // Add ourselves as remote participant
      const newParticipant = {
        id: character,
        github,
        character,
        transport: "remote",
        role,
        name: character,
        class: "",
        level: 0,
        location: "unknown",
        group: null,
      };
      existingSession.participants.push(newParticipant);
      existingSession.session_type = computeSessionType(existingSession.participants);
      writeSession(existingSession);
    } else {
      // Create a minimal session marker for the joining player
      const joinState = {
        session_id: sid,
        world: "alpha",
        session_type: "remote",
        host: { github: "unknown" },
        created: new Date().toISOString(),
        participants: [
          {
            id: character,
            github,
            character,
            transport: "remote",
            role,
            name: character,
            class: "",
            level: 0,
            location: "unknown",
            group: null,
          },
        ],
        groups: {},
        turn: { round: 1, mode: "group", current_group: "a", pending_actions: { local: [], remote_awaiting: [] } },
        remote: {
          enabled: true,
          outbox_path: `${RT_OUTBOX_PREFIX}${sid}.yaml`,
          state_path: `${RT_STATE_PREFIX}${sid}.yaml`,
          max_idle_polls: 5,
          poll_interval_sec: 3,
        },
      };
      writeSession(joinState);
    }

    console.log(JSON.stringify({ session_id: sid, player: github, character, role, status: "joined" }));
    break;
  }

  case "end": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const sid = session.session_id;

    // If remote, update session status on remote branch
    if (session.remote?.enabled) {
      const sessionBranch = `rt/${sid}/session`;
      const sessionContent = getRemoteFileContent(sessionBranch, "session.yaml");
      if (sessionContent) {
        const updated = sessionContent
          .replace(/status:\s*active/, "status: ended")
          .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
        pushFileToRemote(sessionBranch, "session.yaml", updated, "Session ended");
      }
    }

    // Clean up all marker files
    if (existsSync(SESSION_MARKER)) unlinkSync(SESSION_MARKER);
    if (existsSync(LEGACY_RT_MARKER)) unlinkSync(LEGACY_RT_MARKER);
    if (existsSync(LEGACY_LP_MARKER)) unlinkSync(LEGACY_LP_MARKER);

    // Clean up temp files
    try {
      const tmpFiles = readdirSync("/tmp");
      for (const f of tmpFiles) {
        if (f.includes("agent-quest-rt") && f.includes(sid)) {
          try { unlinkSync(`/tmp/${f}`); } catch {}
        }
      }
    } catch {}

    console.log(JSON.stringify({ session_id: sid, status: "ended", final_state: session }));
    break;
  }

  case "status": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  // ==========================================================================
  // GROUPS / TURNS (from local-party.js)
  // ==========================================================================

  case "next-turn": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const groupOrder = [];
    const seen = new Set();
    for (const p of session.participants) {
      if (p.group && !seen.has(p.group)) {
        seen.add(p.group);
        groupOrder.push(p.group);
      }
    }

    const currentGroup = session.turn.current_group;
    const currentGroupIdx = groupOrder.indexOf(currentGroup);

    const nextGroupIdx = (currentGroupIdx + 1) % groupOrder.length;
    const nextGroup = groupOrder[nextGroupIdx];

    if (nextGroupIdx <= currentGroupIdx) {
      session.turn.round++;
    }

    session.turn.current_group = nextGroup;

    // Reset pending actions for the new group
    const nextGroupMembers = session.groups[nextGroup]?.members || [];
    session.turn.pending_actions = {
      local: [],
      remote_awaiting: nextGroupMembers.filter((id) => {
        const p = session.participants.find((pp) => pp.id === id);
        return p && p.transport === "remote";
      }),
    };

    writeSession(session);
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  case "split": {
    const charId = process.argv[3];
    const splitArgs = process.argv.slice(4);
    let toGroup = null;

    for (let i = 0; i < splitArgs.length; i++) {
      if (splitArgs[i] === "--to-group" && splitArgs[i + 1]) {
        toGroup = splitArgs[++i];
      }
    }

    if (!charId) {
      console.error("Usage: multiplayer-session.js split <character> [--to-group <group-id>]");
      process.exit(1);
    }

    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const participant = session.participants.find((p) => p.id === charId);
    if (!participant) {
      console.error(`Participant "${charId}" not in session.`);
      process.exit(1);
    }

    const oldGroup = participant.group;

    if (!toGroup) {
      const usedLabels = new Set(Object.keys(session.groups));
      const labels = "abcdefghijklmnopqrstuvwxyz";
      for (const l of labels) {
        if (!usedLabels.has(l)) {
          toGroup = l;
          break;
        }
      }
    }

    // Remove from old group
    if (session.groups[oldGroup]) {
      session.groups[oldGroup].members = session.groups[oldGroup].members.filter((m) => m !== charId);
      if (session.groups[oldGroup].members.length === 0) {
        delete session.groups[oldGroup];
      }
    }

    // Add to new group
    if (!session.groups[toGroup]) {
      session.groups[toGroup] = { location: participant.location, members: [] };
    }
    session.groups[toGroup].members.push(charId);
    participant.group = toGroup;

    writeSession(session);
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  case "merge": {
    const groupA = process.argv[3];
    const groupB = process.argv[4];

    if (!groupA || !groupB) {
      console.error("Usage: multiplayer-session.js merge <group-a> <group-b>");
      process.exit(1);
    }

    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    if (!session.groups[groupA]) {
      console.error(`Group "${groupA}" does not exist.`);
      process.exit(1);
    }
    if (!session.groups[groupB]) {
      console.error(`Group "${groupB}" does not exist.`);
      process.exit(1);
    }

    for (const member of session.groups[groupB].members) {
      session.groups[groupA].members.push(member);
      const p = session.participants.find((pp) => pp.id === member);
      if (p) {
        p.group = groupA;
        p.location = session.groups[groupA].location;
      }
    }
    delete session.groups[groupB];

    writeSession(session);
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  case "update-location": {
    const charId = process.argv[3];
    const locationId = process.argv[4];

    if (!charId || !locationId) {
      console.error("Usage: multiplayer-session.js update-location <character> <location-id>");
      process.exit(1);
    }

    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const participant = session.participants.find((p) => p.id === charId);
    if (!participant) {
      console.error(`Participant "${charId}" not in session.`);
      process.exit(1);
    }

    participant.location = locationId;
    session.groups = calculateGroups(session.participants);
    session.session_type = computeSessionType(session.participants);

    writeSession(session);
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  case "update-groups": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    session.groups = calculateGroups(session.participants);

    writeSession(session);
    console.log(JSON.stringify(session, null, 2));
    break;
  }

  // ==========================================================================
  // REMOTE TRANSPORT (from rt-session.js)
  // ==========================================================================

  case "check-messages": {
    const sid = process.argv[3] || getActiveSessionId();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: multiplayer-session.js check-messages [session-id] [github]");
      process.exit(1);
    }

    const messages = checkForNewMessages(sid, github);
    const output = formatRtMessages(messages);
    if (output) console.log(output);
    break;
  }

  case "check-inbox": {
    const github = process.argv[3] || getGitHubUser();
    if (!github) {
      console.error("Usage: multiplayer-session.js check-inbox [github-username]");
      process.exit(1);
    }
    const notifications = checkInbox(github);
    const output = formatInboxNotifications(notifications);
    if (output) console.log(output);
    break;
  }

  case "count-inbox": {
    const github = process.argv[3] || getGitHubUser();
    if (!github) {
      console.error("Usage: multiplayer-session.js count-inbox [github]");
      process.exit(1);
    }
    const notifications = checkInbox(github);
    const urgent = notifications.filter(n => n.priority === "high").length;
    console.log(JSON.stringify({ total: notifications.length, urgent }));
    break;
  }

  case "push-outbox": {
    const sid = process.argv[3] || getActiveSessionId();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: multiplayer-session.js push-outbox [session-id] [github]");
      process.exit(1);
    }

    const tempFile = `${RT_OUTBOX_PREFIX}${sid}.yaml`;
    if (!existsSync(tempFile)) {
      console.error(`No outbox file at ${tempFile}`);
      process.exit(1);
    }

    const content = readFileSync(tempFile, "utf-8");
    const branch = `rt/${sid}/msg/${github}`;
    pushFileToRemote(branch, "outbox.yaml", content, `Session: ${github} action`);
    console.log("Outbox pushed");
    break;
  }

  case "push-state": {
    const sid = process.argv[3] || getActiveSessionId();

    if (!sid) {
      console.error("Usage: multiplayer-session.js push-state [session-id]");
      process.exit(1);
    }

    const tempFile = `${RT_STATE_PREFIX}${sid}.yaml`;
    if (!existsSync(tempFile)) {
      console.error(`No state file at ${tempFile}`);
      process.exit(1);
    }

    const content = readFileSync(tempFile, "utf-8");
    const branch = `rt/${sid}/state`;
    pushFileToRemote(branch, "state.yaml", content, "Session: state update");
    console.log("State pushed");
    break;
  }

  case "send-invite": {
    const sid = process.argv[3];
    const targetGithub = process.argv[4];
    const fromGithub = process.argv[5] || getGitHubUser();
    const fromCharacter = process.argv[6] || "Unknown";

    if (!sid || !targetGithub) {
      console.error("Usage: multiplayer-session.js send-invite <session-id> <target-github> [from-github] [from-character]");
      process.exit(1);
    }

    const inboxBranch = `inbox/${targetGithub}`;
    ensureBranchExists(inboxBranch);

    let existing = getRemoteFileContent(inboxBranch, "notifications.yaml");
    let nextSeq = 1;

    if (existing) {
      const seqs = getMessageSeqs(existing);
      nextSeq = seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
    } else {
      existing = `player: "${targetGithub}"\nnotifications:\n`;
    }

    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 3600000).toISOString();

    const notification = `  - seq: ${nextSeq}
    timestamp: "${now}"
    type: rt-invite
    from: "${fromGithub}"
    from_character: "${fromCharacter}"
    session_id: "${sid}"
    message: "${fromCharacter} invites you to a multiplayer session."
    expires: "${expires}"
    status: pending
`;

    const updated = existing.trimEnd() + "\n" + notification;
    pushFileToRemote(inboxBranch, "notifications.yaml", updated, `Session invite from ${fromGithub}`);

    console.log(JSON.stringify({ sent: true, to: targetGithub, session_id: sid, seq: nextSeq }));
    break;
  }

  case "send-notification": {
    const type = process.argv[3];
    const targetGithub = process.argv[4];
    const fromGithub = process.argv[5];
    const fromCharacter = process.argv[6];
    const message = process.argv[7];
    const extraJson = process.argv[8];

    const validTypes = ["friend-request", "party-invite", "trade-offer", "mail", "guild-invite", "duel-challenge"];

    if (!type || !targetGithub || !fromGithub || !fromCharacter || !message) {
      console.error(`Usage: multiplayer-session.js send-notification <type> <target-github> <from-github> <from-character> <message> [extra-json]\n\nSupported types: ${validTypes.join(", ")}`);
      process.exit(1);
    }

    if (!validTypes.includes(type)) {
      console.error(`Invalid notification type: "${type}"\nSupported types: ${validTypes.join(", ")}`);
      process.exit(1);
    }

    const expirations = {
      "friend-request": 7 * 24 * 3600000,
      "party-invite": 48 * 3600000,
      "trade-offer": 72 * 3600000,
      "mail": 30 * 24 * 3600000,
      "guild-invite": 7 * 24 * 3600000,
      "duel-challenge": 24 * 3600000,
    };

    const inboxBranch = `inbox/${targetGithub}`;
    ensureBranchExists(inboxBranch);

    let existing = getRemoteFileContent(inboxBranch, "notifications.yaml");
    let nextSeq = 1;

    if (existing) {
      const seqs = getMessageSeqs(existing);
      nextSeq = seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
    } else {
      existing = `player: "${targetGithub}"\nnotifications:\n`;
    }

    const now = new Date().toISOString();
    const expires = new Date(Date.now() + expirations[type]).toISOString();

    let extraFields = "";
    if (extraJson) {
      try {
        const extra = JSON.parse(extraJson);
        for (const [key, value] of Object.entries(extra)) {
          extraFields += `    ${key}: "${value}"\n`;
        }
      } catch (e) {
        console.error(`Invalid extra JSON: ${e.message}`);
        process.exit(1);
      }
    }

    const notification = `  - seq: ${nextSeq}
    timestamp: "${now}"
    type: ${type}
    from: "${fromGithub}"
    from_character: "${fromCharacter}"
    message: "${message}"
    expires: "${expires}"
    status: pending
${extraFields}`;

    const updated = existing.trimEnd() + "\n" + notification;
    pushFileToRemote(inboxBranch, "notifications.yaml", updated, `${type} from ${fromGithub} to ${targetGithub}`);

    console.log(JSON.stringify({ sent: true, type, to: targetGithub, from: fromGithub, seq: nextSeq }));
    break;
  }

  case "check-turn": {
    const sid = process.argv[3] || getActiveSessionId();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: multiplayer-session.js check-turn [session-id] [github]");
      process.exit(1);
    }

    exec(`git fetch origin "refs/heads/rt/${sid}/state" 2>/dev/null || true`);
    const stateYaml = exec(`git show "origin/rt/${sid}/state:state.yaml" 2>/dev/null`);

    if (!stateYaml) {
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_state" }));
      break;
    }

    const encounterStatus = getYamlField(stateYaml, "  status");
    if (encounterStatus !== "active") {
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_encounter" }));
      break;
    }

    const turnOrderMatch = stateYaml.match(/turn_order:\s*\[([^\]]*)\]/);
    if (!turnOrderMatch) {
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_turn_order" }));
      break;
    }

    const turnOrder = turnOrderMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s);

    const currentTurnStr = getYamlField(stateYaml, "  current_turn");
    const currentTurn = currentTurnStr !== null ? parseInt(currentTurnStr, 10) : 0;
    const currentPlayer = turnOrder[currentTurn] || turnOrder[0] || "";

    console.log(JSON.stringify({ is_my_turn: currentPlayer === github, current_player: currentPlayer, turn_index: currentTurn, turn_order: turnOrder }));
    break;
  }

  // ==========================================================================
  // HYBRID-SPECIFIC
  // ==========================================================================

  case "submit-local-actions": {
    const actionsJson = process.argv[3];
    if (!actionsJson) {
      console.error("Usage: multiplayer-session.js submit-local-actions '<json>'");
      process.exit(1);
    }

    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    try {
      const actions = JSON.parse(actionsJson);
      session.turn.pending_actions.local = actions;
      writeSession(session);
      console.log(JSON.stringify({ submitted: true, actions }));
    } catch (e) {
      console.error(`Invalid JSON: ${e.message}`);
      process.exit(1);
    }
    break;
  }

  case "check-group-ready": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const localSubmitted = session.turn.pending_actions.local.length > 0;
    const remoteAwaiting = session.turn.pending_actions.remote_awaiting;
    const allReady = localSubmitted && remoteAwaiting.length === 0;

    console.log(JSON.stringify({
      ready: allReady,
      local_submitted: localSubmitted,
      remote_awaiting: remoteAwaiting,
    }));
    break;
  }

  case "resolve-group-turn": {
    const session = readSession();
    if (!session) {
      console.error("No active session.");
      process.exit(1);
    }

    const result = {
      local_actions: session.turn.pending_actions.local,
      group: session.turn.current_group,
      round: session.turn.round,
    };

    // Clear pending actions
    session.turn.pending_actions = { local: [], remote_awaiting: [] };
    writeSession(session);

    console.log(JSON.stringify(result, null, 2));
    break;
  }

  // ==========================================================================
  // LOOP COUNTER (carried from rt-session.js)
  // ==========================================================================

  case "get-loop-counter": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) process.exit(1);
    console.log(getLoopCounter(sid));
    break;
  }

  case "increment-loop-counter": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) process.exit(1);
    console.log(incrementLoopCounter(sid));
    break;
  }

  case "reset-loop-counter": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) process.exit(1);
    resetLoopCounter(sid);
    console.log("0");
    break;
  }

  // ==========================================================================
  // INFO / PATHS
  // ==========================================================================

  case "session-info": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) {
      console.error("No active session");
      process.exit(1);
    }

    exec(`git fetch origin "refs/heads/rt/${sid}/session" 2>/dev/null || true`);
    const content = exec(`git show "origin/rt/${sid}/session:session.yaml" 2>/dev/null`);
    if (content) {
      console.log(content);
    } else {
      // Fall back to local session marker
      const session = readSession();
      if (session) {
        console.log(JSON.stringify(session, null, 2));
      } else {
        console.error("Session not found");
        process.exit(1);
      }
    }
    break;
  }

  case "outbox-path": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) process.exit(1);
    console.log(`${RT_OUTBOX_PREFIX}${sid}.yaml`);
    break;
  }

  case "state-path": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) process.exit(1);
    console.log(`${RT_STATE_PREFIX}${sid}.yaml`);
    break;
  }

  case "cleanup-branches": {
    const sid = process.argv[3] || getActiveSessionId();
    if (!sid) {
      console.error("Usage: multiplayer-session.js cleanup-branches <session-id>");
      process.exit(1);
    }

    const refs = exec(`gh api "repos/${REPO}/git/matching-refs/heads/rt/${sid}/" -q ".[].ref" 2>/dev/null`);
    if (refs) {
      for (const ref of refs.split("\n")) {
        if (ref) {
          exec(`gh api "repos/${REPO}/git/${ref}" --method DELETE 2>/dev/null`);
        }
      }
      console.log("Branches cleaned up");
    }
    break;
  }

  // ==========================================================================
  // LEGACY COMPAT
  // ==========================================================================

  case "get-session": {
    const sid = getActiveSessionId();
    if (sid) {
      console.log(sid);
    } else {
      // Fall back to legacy RT marker
      if (existsSync(LEGACY_RT_MARKER)) {
        console.log(readFileSync(LEGACY_RT_MARKER, "utf-8").trim());
      } else {
        process.exit(1);
      }
    }
    break;
  }

  case "set-session": {
    const sid = process.argv[3];
    if (!sid) {
      console.error("Usage: multiplayer-session.js set-session <session-id>");
      process.exit(1);
    }
    // Create minimal session marker
    writeSession({
      session_id: sid,
      world: "alpha",
      session_type: "remote",
      host: { github: "unknown" },
      created: new Date().toISOString(),
      participants: [],
      groups: {},
      turn: { round: 1, mode: "group", current_group: "a", pending_actions: { local: [], remote_awaiting: [] } },
      remote: { enabled: true },
    });
    // Also set legacy marker
    writeFileSync(LEGACY_RT_MARKER, sid);
    console.log(`Session marker set: ${sid}`);
    break;
  }

  case "clear-session": {
    if (existsSync(SESSION_MARKER)) unlinkSync(SESSION_MARKER);
    if (existsSync(LEGACY_RT_MARKER)) unlinkSync(LEGACY_RT_MARKER);
    if (existsSync(LEGACY_LP_MARKER)) unlinkSync(LEGACY_LP_MARKER);
    console.log("Session markers cleared");
    break;
  }

  // ==========================================================================
  // HELP
  // ==========================================================================

  default:
    console.log(`Usage: node scripts/multiplayer-session.js <command> [args]

Session Lifecycle:
  create --github <gh> --char <c> [--char <c>] [--remote-guest <gh>] [--world <w>]
                                       Create session (local, remote, or hybrid)
  join <session-id> <character> [--spectator]
                                       Join an existing session
  end                                  End active session
  status                               Get current session state

Groups / Turns:
  next-turn                            Advance to next group's turn
  split <character> [--to-group <id>]  Move character to new/different group
  merge <group-a> <group-b>            Merge two groups (B into A)
  update-location <character> <loc>    Update character location + regroup
  update-groups                        Recalculate groups from current locations

Remote Transport:
  check-messages [sid] [github]        Check for new RT messages
  check-inbox [github]                 Check inbox for notifications (formatted)
  count-inbox [github]                 Count inbox notifications (JSON: {total, urgent})
  push-outbox [sid] [github]           Push local outbox to remote
  push-state [sid]                     Push local state to remote
  send-invite <sid> <target> [from] [char]
                                       Send session invite
  send-notification <type> <target> <from> <char> <msg> [json]
                                       Send inbox notification
  check-turn [sid] [github]            Check turn (initiative mode)

Hybrid:
  submit-local-actions '<json>'        Buffer local actions for group turn
  check-group-ready                    All participants submitted?
  resolve-group-turn                   Return all actions, clear pending

Utility:
  get-loop-counter [sid]               Get stop-hook loop counter
  increment-loop-counter [sid]         Increment loop counter
  reset-loop-counter [sid]             Reset loop counter
  session-info [sid]                   Display session metadata
  outbox-path [sid]                    Print temp outbox file path
  state-path [sid]                     Print temp state file path
  cleanup-branches <sid>               Delete RT branches from remote
  get-session                          Get active session ID
  set-session <id>                     Set session marker
  clear-session                        Remove all session markers`);
    break;
}
