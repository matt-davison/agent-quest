#!/usr/bin/env node
// scripts/rt-session.js
// Helper for realtime multiplayer session management
// Usage: node scripts/rt-session.js <command> [args]

const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs");
const path = require("path");

const REPO = "matt-davison/agent-quest";
const RT_SESSION_MARKER = "/tmp/agent-quest-rt-session";
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

function getActiveSession() {
  if (!existsSync(RT_SESSION_MARKER)) return null;
  try {
    return readFileSync(RT_SESSION_MARKER, "utf-8").trim();
  } catch {
    return null;
  }
}

function generateSessionId() {
  const now = new Date();
  const date = now.toISOString().replace(/[-T:]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `rt-${date.slice(0, 8)}-${date.slice(8, 14)}-${rand}`;
}

// --- GitHub API Helpers ---

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
  // Check if branch exists on remote
  const exists = exec(
    `gh api "repos/${REPO}/git/ref/heads/${branch}" -q ".ref" 2>/dev/null`
  );
  if (exists) return true;

  // Get the SHA of the base branch
  const baseSha = exec(
    `gh api "repos/${REPO}/git/ref/heads/${baseBranch}" -q ".object.sha" 2>/dev/null`
  );
  if (!baseSha) return false;

  // Create the branch
  const result = exec(
    `gh api "repos/${REPO}/git/refs" --method POST -f ref="refs/heads/${branch}" -f sha="${baseSha}" 2>/dev/null`
  );
  return !!result;
}

// --- Simple YAML Helpers (no dependency) ---

function parseSimpleYaml(text) {
  // Minimal YAML-like parser for our structured outbox/session files
  // Returns the raw text for full parsing by the caller
  return text;
}

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
  // Split on message boundaries (lines starting with "  - seq:")
  const blocks = outboxText.split(/(?=\s+-\s+seq:\s+)/);
  const results = [];
  for (const block of blocks) {
    const seqMatch = block.match(/seq:\s*(\d+)/);
    if (seqMatch && parseInt(seqMatch[1], 10) > afterSeq) {
      // Extract key fields
      const seq = parseInt(seqMatch[1], 10);
      const type =
        block.match(/type:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") ||
        "unknown";
      const narrative =
        block
          .match(/narrative:\s*["']?(.+?)["']?\s*$/m)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "";
      const to =
        block
          .match(/^\s+to:\s*["']?(.+?)["']?\s*$/m)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || null;
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

// --- Session Timeout Check ---

function isSessionTimedOut(sessionYaml, timeoutMinutes = 10) {
  const lastActivity = getYamlField(sessionYaml, "last_activity");
  if (!lastActivity) return false;
  const lastTime = new Date(lastActivity).getTime();
  const now = Date.now();
  return now - lastTime > timeoutMinutes * 60 * 1000;
}

// --- Inbox Helpers ---

function checkInbox(playerGithub) {
  // Fetch the inbox branch
  exec(
    `git fetch origin "refs/heads/inbox/${playerGithub}" 2>/dev/null || true`
  );

  // Read notifications
  const content = exec(
    `git show "origin/inbox/${playerGithub}:notifications.yaml" 2>/dev/null`
  );
  if (!content) return [];

  // Parse pending notifications
  const blocks = content.split(/(?=\s+-\s+seq:\s+)/);
  const pending = [];
  for (const block of blocks) {
    const status =
      block.match(/status:\s*(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, "") ||
      "";
    if (
      status === "pending" ||
      status === "unread" ||
      status === "delivered"
    ) {
      const seq = block.match(/seq:\s*(\d+)/)?.[1] || "?";
      const type =
        block
          .match(/type:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "unknown";
      const from =
        block
          .match(/from:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "unknown";
      const fromChar =
        block
          .match(/from_character:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "";
      const message =
        block
          .match(/message:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "";
      const subject =
        block
          .match(/subject:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "";
      const sessionId =
        block
          .match(/session_id:\s*(.+)/)?.[1]
          ?.trim()
          .replace(/^["']|["']$/g, "") || "";

      pending.push({ seq, type, from, fromChar, message, subject, sessionId, status });
    }
  }
  return pending;
}

// --- Check for New RT Messages ---

function checkForNewMessages(sessionId, myGithub) {
  // Fetch all msg branches for this session
  exec(
    `git fetch origin "refs/heads/rt/${sessionId}/msg/*:refs/remotes/origin/rt/${sessionId}/msg/*" 2>/dev/null || true`
  );

  // Read session.yaml to get participant list
  exec(
    `git fetch origin "refs/heads/rt/${sessionId}/session" 2>/dev/null || true`
  );
  const sessionYaml = exec(
    `git show "origin/rt/${sessionId}/session:session.yaml" 2>/dev/null`
  );
  if (!sessionYaml) return [];

  // Check session timeout
  if (isSessionTimedOut(sessionYaml)) return [];

  // Get all participants (host + guests)
  const hostGithub = getYamlField(sessionYaml, "  github") || "";
  const participants = [hostGithub];

  // Find guest github usernames
  const guestMatches = sessionYaml.matchAll(
    /- github:\s*["']?(.+?)["']?\s*$/gm
  );
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

// --- Format Messages for Output ---

function formatInboxNotifications(notifications) {
  if (notifications.length === 0) return "";
  const lines = [`[INBOX] ${notifications.length} new notification(s):`];

  for (const n of notifications) {
    switch (n.type) {
      case "rt-invite":
        lines.push(
          `  ${n.seq}. [RT INVITE] ${n.fromChar || n.from} (${n.from}) invites you to a realtime session (${n.sessionId})`
        );
        break;
      case "friend-request":
        lines.push(
          `  ${n.seq}. [FRIEND] ${n.fromChar || n.from} (${n.from}) wants to be friends: ${n.message}`
        );
        break;
      case "party-invite":
        lines.push(
          `  ${n.seq}. [PARTY] ${n.fromChar || n.from} (${n.from}) invites you to a party: ${n.message}`
        );
        break;
      case "trade-offer":
        lines.push(
          `  ${n.seq}. [TRADE] ${n.fromChar || n.from} (${n.from}) sent a trade offer: ${n.message}`
        );
        break;
      case "mail":
        lines.push(
          `  ${n.seq}. [MAIL] ${n.fromChar || n.from} (${n.from}): "${n.subject || n.message}"`
        );
        break;
      case "guild-invite":
        lines.push(
          `  ${n.seq}. [GUILD] ${n.fromChar || n.from} (${n.from}) invites you to their guild: ${n.message}`
        );
        break;
      case "duel-challenge":
        lines.push(
          `  ${n.seq}. [DUEL] ${n.fromChar || n.from} (${n.from}) challenges you to a duel: ${n.message}`
        );
        break;
      default:
        lines.push(`  ${n.seq}. [${n.type.toUpperCase()}] ${n.fromChar || n.from}: ${n.message || n.subject}`);
    }
  }
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
  case "generate-session-id": {
    console.log(generateSessionId());
    break;
  }

  case "get-session": {
    const sid = getActiveSession();
    if (sid) {
      console.log(sid);
    } else {
      process.exit(1);
    }
    break;
  }

  case "set-session": {
    const sid = process.argv[3];
    if (!sid) {
      console.error("Usage: rt-session.js set-session <session-id>");
      process.exit(1);
    }
    writeFileSync(RT_SESSION_MARKER, sid);
    console.log(`Session marker set: ${sid}`);
    break;
  }

  case "clear-session": {
    if (existsSync(RT_SESSION_MARKER)) {
      unlinkSync(RT_SESSION_MARKER);
      console.log("Session marker cleared");
    }
    break;
  }

  case "create-session": {
    // Create a new RT session with branches
    const github = getGitHubUser();
    if (!github) {
      console.error("Not authenticated with GitHub");
      process.exit(1);
    }

    const sid = generateSessionId();
    const character = process.argv[3] || "Unknown";

    // Parse flags from remaining args
    const rawArgs = process.argv.slice(4);
    let turnMode = "simultaneous";
    const guests = [];
    for (let i = 0; i < rawArgs.length; i++) {
      if (rawArgs[i] === "--turn-mode" && rawArgs[i + 1]) {
        turnMode = rawArgs[i + 1];
        i++; // skip value
      } else {
        guests.push(rawArgs[i]);
      }
    }

    if (!["simultaneous", "initiative"].includes(turnMode)) {
      console.error(`Invalid turn mode: ${turnMode}. Use "simultaneous" or "initiative".`);
      process.exit(1);
    }

    // Create session.yaml content
    const now = new Date().toISOString();
    let guestYaml = "";
    for (const g of guests) {
      guestYaml += `  - github: "${g}"\n    character: ""\n    status: invited\n    role: player\n`;
    }

    const sessionYaml = `session_id: "${sid}"
created: "${now}"
status: active
host:
  github: "${github}"
  character: "${character}"
guests:
${guestYaml || "  []"}
settings:
  max_idle_polls: 5
  poll_interval_sec: 3
  turn_mode: ${turnMode}
last_activity: "${now}"
`;

    // Create outbox content
    const outboxYaml = `player: "${github}"
character: "${character}"
messages: []
`;

    // Create branches and push files
    const sessionBranch = `rt/${sid}/session`;
    const msgBranch = `rt/${sid}/msg/${github}`;
    const stateBranch = `rt/${sid}/state`;

    const ok1 = ensureBranchExists(sessionBranch);
    const ok2 = ensureBranchExists(msgBranch);
    const ok3 = ensureBranchExists(stateBranch);

    if (!ok1 || !ok2 || !ok3) {
      console.error("Failed to create RT branches");
      process.exit(1);
    }

    pushFileToRemote(
      sessionBranch,
      "session.yaml",
      sessionYaml,
      `RT: create session ${sid}`
    );
    pushFileToRemote(
      msgBranch,
      "outbox.yaml",
      outboxYaml,
      `RT: init outbox for ${github}`
    );
    pushFileToRemote(
      stateBranch,
      "state.yaml",
      `version: 0\ntimestamp: "${now}"\npending_deltas: {}\n`,
      `RT: init state for ${sid}`
    );

    // Set local session marker
    writeFileSync(RT_SESSION_MARKER, sid);

    console.log(
      JSON.stringify({
        session_id: sid,
        session_branch: sessionBranch,
        msg_branch: msgBranch,
        state_branch: stateBranch,
        host: github,
        guests: guests,
      })
    );
    break;
  }

  case "join-session": {
    const sid = process.argv[3];
    const github = getGitHubUser();

    // Parse character and --spectator flag from remaining args
    const joinArgs = process.argv.slice(4);
    let character = "Unknown";
    let isSpectator = false;
    for (let i = 0; i < joinArgs.length; i++) {
      if (joinArgs[i] === "--spectator") {
        isSpectator = true;
      } else if (!character || character === "Unknown") {
        character = joinArgs[i];
      }
    }

    const role = isSpectator ? "spectator" : "player";

    if (!sid || !github) {
      console.error("Usage: rt-session.js join-session <session-id> [character-name] [--spectator]");
      process.exit(1);
    }

    // Only create msg branch for players (spectators get no outbox)
    if (!isSpectator) {
      const msgBranch = `rt/${sid}/msg/${github}`;
      ensureBranchExists(msgBranch);

      const outboxYaml = `player: "${github}"
character: "${character}"
messages: []
`;
      pushFileToRemote(
        msgBranch,
        "outbox.yaml",
        outboxYaml,
        `RT: init outbox for ${github}`
      );
    }

    // Update session.yaml to mark self as joined
    const sessionBranch = `rt/${sid}/session`;
    const sessionContent = getRemoteFileContent(sessionBranch, "session.yaml");
    if (sessionContent) {
      // Check if guest was pre-invited (exists in session.yaml)
      const guestExists = sessionContent.includes(`github: "${github}"`);

      let updated;
      if (guestExists) {
        // Update existing guest entry: status to joined, set character and role
        updated = sessionContent
          .replace(
            new RegExp(
              `(- github: "${github}"\\n\\s+character: )"[^"]*"(\\n\\s+status: )\\w+(\\n\\s+role: )\\w+`,
              "m"
            ),
            `$1"${character}"$2joined$3${role}`
          )
          .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);

        // Fallback: if no role field existed in the original (backward compat)
        if (updated === sessionContent.replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`)) {
          updated = sessionContent
            .replace(
              new RegExp(
                `(- github: "${github}"\\n\\s+character: )"[^"]*"(\\n\\s+status: )\\w+`,
                "m"
              ),
              `$1"${character}"$2joined\n    role: ${role}`
            )
            .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
        }
      } else {
        // Append new guest entry (not pre-invited)
        const newGuest = `  - github: "${github}"\n    character: "${character}"\n    status: joined\n    role: ${role}\n`;
        // Insert before settings: line
        updated = sessionContent
          .replace(
            /^(settings:)/m,
            `${newGuest}$1`
          )
          .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
      }

      pushFileToRemote(
        sessionBranch,
        "session.yaml",
        updated,
        `RT: ${github} joined session${isSpectator ? " as spectator" : ""}`
      );
    }

    // Set local marker
    writeFileSync(RT_SESSION_MARKER, sid);

    console.log(
      JSON.stringify({
        session_id: sid,
        player: github,
        character: character,
        role: role,
        status: "joined",
      })
    );
    break;
  }

  case "end-session": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) {
      console.error("No active session");
      process.exit(1);
    }

    // Update session status to ended
    const sessionBranch = `rt/${sid}/session`;
    const sessionContent = getRemoteFileContent(sessionBranch, "session.yaml");
    if (sessionContent) {
      const updated = sessionContent
        .replace(/status:\s*active/, "status: ended")
        .replace(/last_activity:.*/, `last_activity: "${new Date().toISOString()}"`);
      pushFileToRemote(
        sessionBranch,
        "session.yaml",
        updated,
        `RT: session ended`
      );
    }

    // Clean up local files
    if (existsSync(RT_SESSION_MARKER)) unlinkSync(RT_SESSION_MARKER);

    // Clean up temp files for this session
    const { readdirSync } = require("fs");
    try {
      const tmpFiles = readdirSync("/tmp");
      for (const f of tmpFiles) {
        if (f.includes(`agent-quest-rt`) && f.includes(sid)) {
          try { unlinkSync(`/tmp/${f}`); } catch {}
        }
      }
    } catch {}

    console.log(JSON.stringify({ session_id: sid, status: "ended" }));
    break;
  }

  case "check-inbox": {
    const github = process.argv[3] || getGitHubUser();
    if (!github) {
      console.error("Usage: rt-session.js check-inbox [github-username]");
      process.exit(1);
    }
    const notifications = checkInbox(github);
    const output = formatInboxNotifications(notifications);
    if (output) console.log(output);
    break;
  }

  case "check-messages": {
    const sid = process.argv[3] || getActiveSession();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: rt-session.js check-messages [session-id] [github]");
      process.exit(1);
    }

    const messages = checkForNewMessages(sid, github);
    const output = formatRtMessages(messages);
    if (output) console.log(output);
    break;
  }

  case "push-outbox": {
    // Push a local outbox temp file to the remote branch
    const sid = process.argv[3] || getActiveSession();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: rt-session.js push-outbox [session-id] [github]");
      process.exit(1);
    }

    const tempFile = `${RT_OUTBOX_PREFIX}${sid}.yaml`;
    if (!existsSync(tempFile)) {
      console.error(`No outbox file at ${tempFile}`);
      process.exit(1);
    }

    const content = readFileSync(tempFile, "utf-8");
    const branch = `rt/${sid}/msg/${github}`;
    pushFileToRemote(branch, "outbox.yaml", content, `RT: ${github} action`);
    console.log("Outbox pushed");
    break;
  }

  case "push-state": {
    // Push a local state temp file to the remote state branch
    const sid = process.argv[3] || getActiveSession();

    if (!sid) {
      console.error("Usage: rt-session.js push-state [session-id]");
      process.exit(1);
    }

    const tempFile = `${RT_STATE_PREFIX}${sid}.yaml`;
    if (!existsSync(tempFile)) {
      console.error(`No state file at ${tempFile}`);
      process.exit(1);
    }

    const content = readFileSync(tempFile, "utf-8");
    const branch = `rt/${sid}/state`;
    pushFileToRemote(branch, "state.yaml", content, `RT: state update`);
    console.log("State pushed");
    break;
  }

  case "send-invite": {
    // Send an RT invite to another player's inbox
    const sid = process.argv[3];
    const targetGithub = process.argv[4];
    const fromGithub = process.argv[5] || getGitHubUser();
    const fromCharacter = process.argv[6] || "Unknown";

    if (!sid || !targetGithub) {
      console.error(
        "Usage: rt-session.js send-invite <session-id> <target-github> [from-github] [from-character]"
      );
      process.exit(1);
    }

    const inboxBranch = `inbox/${targetGithub}`;
    ensureBranchExists(inboxBranch);

    // Read existing notifications (or start fresh)
    let existing = getRemoteFileContent(inboxBranch, "notifications.yaml");
    let nextSeq = 1;

    if (existing) {
      const seqs = getMessageSeqs(existing);
      nextSeq = seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
    } else {
      existing = `player: "${targetGithub}"\nnotifications:\n`;
    }

    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    const notification = `  - seq: ${nextSeq}
    timestamp: "${now}"
    type: rt-invite
    from: "${fromGithub}"
    from_character: "${fromCharacter}"
    session_id: "${sid}"
    message: "${fromCharacter} invites you to a realtime adventure session."
    expires: "${expires}"
    status: pending
`;

    // Append to notifications
    const updated = existing.trimEnd() + "\n" + notification;
    pushFileToRemote(
      inboxBranch,
      "notifications.yaml",
      updated,
      `RT invite from ${fromGithub}`
    );

    console.log(
      JSON.stringify({
        sent: true,
        to: targetGithub,
        session_id: sid,
        seq: nextSeq,
      })
    );
    break;
  }

  case "send-notification": {
    // Send a generic notification to another player's inbox
    const type = process.argv[3];
    const targetGithub = process.argv[4];
    const fromGithub = process.argv[5];
    const fromCharacter = process.argv[6];
    const message = process.argv[7];
    const extraJson = process.argv[8];

    const validTypes = [
      "friend-request",
      "party-invite",
      "trade-offer",
      "mail",
      "guild-invite",
      "duel-challenge",
    ];

    if (!type || !targetGithub || !fromGithub || !fromCharacter || !message) {
      console.error(
        `Usage: rt-session.js send-notification <type> <target-github> <from-github> <from-character> <message> [extra-json]

Supported types: ${validTypes.join(", ")}`
      );
      process.exit(1);
    }

    if (!validTypes.includes(type)) {
      console.error(
        `Invalid notification type: "${type}"\nSupported types: ${validTypes.join(", ")}`
      );
      process.exit(1);
    }

    // Type-specific expiration durations (in milliseconds)
    const expirations = {
      "friend-request": 7 * 24 * 3600000,   // 7 days
      "party-invite": 48 * 3600000,          // 48 hours
      "trade-offer": 72 * 3600000,           // 72 hours
      "mail": 30 * 24 * 3600000,             // 30 days
      "guild-invite": 7 * 24 * 3600000,      // 7 days
      "duel-challenge": 24 * 3600000,        // 24 hours
    };

    const inboxBranch = `inbox/${targetGithub}`;
    ensureBranchExists(inboxBranch);

    // Read existing notifications (or start fresh)
    let existing = getRemoteFileContent(inboxBranch, "notifications.yaml");
    let nextSeq = 1;

    if (existing) {
      const seqs = getMessageSeqs(existing);
      nextSeq = seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
    } else {
      existing = `player: "${targetGithub}"\nnotifications:\n`;
    }

    const now = new Date().toISOString();
    const expires = new Date(
      Date.now() + expirations[type]
    ).toISOString();

    // Build extra fields from optional JSON
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

    // Append to notifications
    const updated = existing.trimEnd() + "\n" + notification;
    pushFileToRemote(
      inboxBranch,
      "notifications.yaml",
      updated,
      `${type} from ${fromGithub} to ${targetGithub}`
    );

    console.log(
      JSON.stringify({
        sent: true,
        type: type,
        to: targetGithub,
        from: fromGithub,
        seq: nextSeq,
      })
    );
    break;
  }

  case "get-loop-counter": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) process.exit(1);
    console.log(getLoopCounter(sid));
    break;
  }

  case "increment-loop-counter": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) process.exit(1);
    console.log(incrementLoopCounter(sid));
    break;
  }

  case "reset-loop-counter": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) process.exit(1);
    resetLoopCounter(sid);
    console.log("0");
    break;
  }

  case "session-info": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) {
      console.error("No active session");
      process.exit(1);
    }

    exec(
      `git fetch origin "refs/heads/rt/${sid}/session" 2>/dev/null || true`
    );
    const content = exec(
      `git show "origin/rt/${sid}/session:session.yaml" 2>/dev/null`
    );
    if (content) {
      console.log(content);
    } else {
      console.error("Session not found");
      process.exit(1);
    }
    break;
  }

  case "outbox-path": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) process.exit(1);
    console.log(`${RT_OUTBOX_PREFIX}${sid}.yaml`);
    break;
  }

  case "state-path": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) process.exit(1);
    console.log(`${RT_STATE_PREFIX}${sid}.yaml`);
    break;
  }

  case "cleanup-branches": {
    const sid = process.argv[3] || getActiveSession();
    if (!sid) {
      console.error("Usage: rt-session.js cleanup-branches <session-id>");
      process.exit(1);
    }

    // List and delete all rt/<sid>/* branches
    const refs = exec(
      `gh api "repos/${REPO}/git/matching-refs/heads/rt/${sid}/" -q ".[].ref" 2>/dev/null`
    );
    if (refs) {
      for (const ref of refs.split("\n")) {
        if (ref) {
          exec(
            `gh api "repos/${REPO}/git/${ref}" --method DELETE 2>/dev/null`
          );
        }
      }
      console.log("Branches cleaned up");
    }
    break;
  }

  case "check-turn": {
    const sid = process.argv[3] || getActiveSession();
    const github = process.argv[4] || getGitHubUser();

    if (!sid || !github) {
      console.error("Usage: rt-session.js check-turn [session-id] [github]");
      process.exit(1);
    }

    // Fetch state branch
    exec(
      `git fetch origin "refs/heads/rt/${sid}/state" 2>/dev/null || true`
    );
    const stateYaml = exec(
      `git show "origin/rt/${sid}/state:state.yaml" 2>/dev/null`
    );

    if (!stateYaml) {
      // No state = free play
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_state" }));
      break;
    }

    // Check for active encounter
    const encounterStatus = getYamlField(stateYaml, "  status");
    if (encounterStatus !== "active") {
      // No active encounter = free play
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_encounter" }));
      break;
    }

    // Parse turn_order array
    const turnOrderMatch = stateYaml.match(/turn_order:\s*\[([^\]]*)\]/);
    if (!turnOrderMatch) {
      console.log(JSON.stringify({ is_my_turn: true, reason: "no_turn_order" }));
      break;
    }

    const turnOrder = turnOrderMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s);

    // Parse current_turn index
    const currentTurnStr = getYamlField(stateYaml, "  current_turn");
    const currentTurn = currentTurnStr !== null ? parseInt(currentTurnStr, 10) : 0;
    const currentPlayer = turnOrder[currentTurn] || turnOrder[0] || "";

    console.log(
      JSON.stringify({
        is_my_turn: currentPlayer === github,
        current_player: currentPlayer,
        turn_index: currentTurn,
        turn_order: turnOrder,
      })
    );
    break;
  }

  default:
    console.log(`Usage: node scripts/rt-session.js <command> [args]

Commands:
  generate-session-id              Generate a new session ID
  get-session                      Get active session ID from marker file
  set-session <id>                 Set session marker
  clear-session                    Remove session marker
  create-session <char> [guests..] Create a new RT session with branches
  join-session <id> [char]         Join an existing RT session
  end-session [id]                 End an RT session
  check-inbox [github]             Check player's inbox for notifications
  check-messages [sid] [github]    Check for new RT messages
  push-outbox [sid] [github]       Push local outbox to remote
  push-state [sid]                 Push local state to remote
  send-invite <sid> <target> [from] [char]  Send RT invite
  send-notification <type> <target> <from> <char> <msg> [json]  Send inbox notification
  get-loop-counter [sid]           Get stop-hook loop counter
  increment-loop-counter [sid]     Increment loop counter
  reset-loop-counter [sid]         Reset loop counter
  session-info [sid]               Display session metadata
  outbox-path [sid]                Print temp outbox file path
  state-path [sid]                 Print temp state file path
  check-turn [sid] [github]        Check if it's player's turn (initiative mode)
  cleanup-branches <sid>           Delete RT branches from remote`);
    break;
}
