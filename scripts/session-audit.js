#!/usr/bin/env node

/**
 * Session Audit Logger
 *
 * Tracks game actions for debugging and rule enforcement verification.
 * Creates an audit trail that can be reviewed to ensure proper subagent usage.
 * Logs are stored per-persona to track which character performed each action.
 *
 * Usage:
 *   node scripts/session-audit.js log <github> <character> <action> [options]
 *   node scripts/session-audit.js view <github> <character> [--session <id>]
 *   node scripts/session-audit.js validate <github> <character> [--session <id>]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const AUDIT_DIR = 'players';

// Actions that MUST use specific subagents
const REQUIRED_SUBAGENTS = {
  'combat': ['combat-manager'],
  'attack': ['combat-manager'],
  'trade_create': ['multiplayer-handler', 'economy-validator'],
  'trade_accept': ['multiplayer-handler', 'economy-validator'],
  'party_create': ['multiplayer-handler'],
  'party_invite': ['multiplayer-handler'],
  'mail_send': ['multiplayer-handler'],
  'duel': ['multiplayer-handler', 'combat-manager'],
  'spend_tokes': ['economy-validator'],
  'spend_gold': ['economy-validator'],
  'earn_tokes': ['economy-validator'],
  'weave_strike': ['combat-manager', 'economy-validator'],
  'travel': ['travel-manager'],
  'move': ['travel-manager'],
  'review': ['claim-reviewer'],
  'save': ['repo-sync', 'state-writer'],
  'session_end': ['repo-sync'],
  'session_start': ['repo-sync'],
};

// Get current timestamp
function timestamp() {
  return new Date().toISOString();
}

// Get session ID (date-based)
function getSessionId() {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '');
}

// Normalize character name to directory format
function charDir(character) {
  return character.toLowerCase().replace(/\s+/g, '-');
}

// Get audit file path (stored per-persona)
function getAuditPath(github, character) {
  return path.join(AUDIT_DIR, github, 'personas', charDir(character), 'session-audit.yaml');
}

// Load or create audit file
function loadAudit(github, character) {
  const auditPath = getAuditPath(github, character);

  if (!fs.existsSync(auditPath)) {
    return {
      github: github,
      character: character,
      sessions: {}
    };
  }

  try {
    return yaml.load(fs.readFileSync(auditPath, 'utf8'));
  } catch (e) {
    console.error(`Error loading audit file: ${e.message}`);
    return {
      github: github,
      character: character,
      sessions: {}
    };
  }
}

// Save audit file
function saveAudit(github, character, audit) {
  const auditPath = getAuditPath(github, character);
  const dir = path.dirname(auditPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(auditPath, yaml.dump(audit, { lineWidth: -1 }));
}

// Log an action
function logAction(github, character, action, details) {
  const audit = loadAudit(github, character);
  const sessionId = getSessionId();

  if (!audit.sessions[sessionId]) {
    audit.sessions[sessionId] = {
      started: timestamp(),
      character: character,
      actions: []
    };
  }

  const entry = {
    timestamp: timestamp(),
    action: action,
    character: character,
    details: details || {},
  };

  // Check if subagents were used
  const requiredSubagents = REQUIRED_SUBAGENTS[action.toLowerCase()];
  if (requiredSubagents) {
    entry.required_subagents = requiredSubagents;
    entry.subagents_used = details.subagents_used || [];

    const missing = requiredSubagents.filter(s => !entry.subagents_used.includes(s));
    if (missing.length > 0) {
      entry.warning = `Missing required subagent(s): ${missing.join(', ')}`;
    }
  }

  audit.sessions[sessionId].actions.push(entry);
  audit.sessions[sessionId].last_action = timestamp();

  saveAudit(github, character, audit);

  console.log(`Logged: ${action} (${character})`);
  if (entry.warning) {
    console.log(`WARNING: ${entry.warning}`);
  }
}

// View audit log
function viewAudit(github, character, sessionId) {
  const audit = loadAudit(github, character);

  if (sessionId) {
    const session = audit.sessions[sessionId];
    if (!session) {
      console.log(`No session found: ${sessionId}`);
      return;
    }
    console.log(`\nSession: ${sessionId}`);
    console.log(`Character: ${session.character || character}`);
    console.log(`Started: ${session.started}`);
    console.log(`Actions: ${session.actions.length}`);
    console.log('');

    for (const action of session.actions) {
      console.log(`  [${action.timestamp}] ${action.action}`);
      if (action.warning) {
        console.log(`    WARNING: ${action.warning}`);
      }
    }
  } else {
    console.log(`\nAudit log for: ${character} (${github})`);
    console.log('Sessions:');

    for (const [id, session] of Object.entries(audit.sessions)) {
      const warnings = session.actions.filter(a => a.warning).length;
      console.log(`  ${id}: ${session.actions.length} actions, ${warnings} warnings`);
    }
  }
}

// Validate session for proper subagent usage
function validateAudit(github, character, sessionId) {
  const audit = loadAudit(github, character);
  const sessions = sessionId ? { [sessionId]: audit.sessions[sessionId] } : audit.sessions;

  let totalActions = 0;
  let violations = 0;
  const issues = [];

  for (const [sid, session] of Object.entries(sessions)) {
    if (!session) continue;

    for (const action of session.actions) {
      totalActions++;

      if (action.warning) {
        violations++;
        issues.push({
          session: sid,
          timestamp: action.timestamp,
          action: action.action,
          issue: action.warning
        });
      }
    }
  }

  console.log('\nSession Audit Validation');
  console.log('========================\n');
  console.log(`Player: ${github}`);
  console.log(`Character: ${character}`);
  console.log(`Sessions checked: ${Object.keys(sessions).length}`);
  console.log(`Total actions: ${totalActions}`);
  console.log(`Violations: ${violations}`);

  if (issues.length > 0) {
    console.log('\nIssues found:');
    for (const issue of issues) {
      console.log(`  [${issue.session}] ${issue.action}: ${issue.issue}`);
    }
    console.log('\nValidation FAILED');
    process.exit(1);
  } else {
    console.log('\nValidation PASSED');
    process.exit(0);
  }
}

// Main
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  node scripts/session-audit.js log <github> <character> <action> [--subagents <list>] [--details <json>]');
    console.log('  node scripts/session-audit.js view <github> <character> [--session <id>]');
    console.log('  node scripts/session-audit.js validate <github> <character> [--session <id>]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/session-audit.js log matt-davison Coda combat --subagents combat-manager,state-writer');
    console.log('  node scripts/session-audit.js view matt-davison Coda');
    console.log('  node scripts/session-audit.js validate matt-davison Zynita');
    process.exit(1);
  }

  switch (command) {
    case 'log': {
      const github = args[1];
      const character = args[2];
      const action = args[3];

      if (!github || !character || !action) {
        console.error('Usage: log <github> <character> <action>');
        process.exit(1);
      }

      const details = {};

      // Parse optional arguments
      for (let i = 4; i < args.length; i++) {
        if (args[i] === '--subagents' && args[i + 1]) {
          details.subagents_used = args[i + 1].split(',');
          i++;
        } else if (args[i] === '--details' && args[i + 1]) {
          try {
            Object.assign(details, JSON.parse(args[i + 1]));
          } catch (e) {
            console.error('Invalid JSON for --details');
          }
          i++;
        }
      }

      logAction(github, character, action, details);
      break;
    }

    case 'view': {
      const github = args[1];
      const character = args[2];
      if (!github || !character) {
        console.error('Usage: view <github> <character> [--session <id>]');
        process.exit(1);
      }

      const sessionIdx = args.indexOf('--session');
      const sessionId = sessionIdx !== -1 ? args[sessionIdx + 1] : null;

      viewAudit(github, character, sessionId);
      break;
    }

    case 'validate': {
      const github = args[1];
      const character = args[2];
      if (!github || !character) {
        console.error('Usage: validate <github> <character> [--session <id>]');
        process.exit(1);
      }

      const sessionIdx = args.indexOf('--session');
      const sessionId = sessionIdx !== -1 ? args[sessionIdx + 1] : null;

      validateAudit(github, character, sessionId);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
