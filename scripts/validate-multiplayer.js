#!/usr/bin/env node

/**
 * Multiplayer Systems Validator
 *
 * Validates all multiplayer state for Agent Quest:
 * - Trading: escrow integrity, trade validity
 * - Parties: membership exclusivity, roster consistency
 * - Mail: attachment escrow, expiration
 * - Guilds: treasury integrity, membership rules
 * - Duels: wager escrow, rating validity
 *
 * Usage: node scripts/validate-multiplayer.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const MULTIPLAYER_DIR = 'multiplayer';
const PLAYERS_DIR = 'players';
const WORLD_STATE_DIR = 'world/state';

// Valid status values
const TRADE_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled', 'expired', 'completed'];
const PARTY_ROLES = ['leader', 'officer', 'member'];
const PARTY_MEMBER_STATUSES = ['active', 'absent', 'offline'];
const GUILD_RANKS = ['founder', 'officer', 'member', 'recruit'];
const DUEL_STATUSES = ['challenged', 'accepted', 'in_progress', 'completed', 'declined', 'expired', 'forfeited'];
const MAIL_STATUSES = ['delivered', 'read', 'claimed', 'expired', 'deleted'];

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

/**
 * Load all player personas to build inventory map
 */
function loadPlayerInventories() {
  const inventories = new Map(); // github -> character -> items[]

  const playerDirs = fs.existsSync(PLAYERS_DIR)
    ? fs.readdirSync(PLAYERS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
    : [];

  for (const github of playerDirs) {
    const personasDir = path.join(PLAYERS_DIR, github, 'personas');
    if (!fs.existsSync(personasDir)) continue;

    const personas = fs.readdirSync(personasDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const charDir of personas) {
      const personaPath = path.join(personasDir, charDir, 'persona.yaml');
      const persona = loadYaml(personaPath);
      if (persona) {
        const key = `${github}:${persona.name || charDir}`;
        inventories.set(key, {
          gold: persona.resources?.gold || 0,
          items: persona.inventory || []
        });
      }
    }
  }

  return inventories;
}

/**
 * Load all escrow ledgers
 */
function loadEscrowLedgers() {
  const escrows = new Map(); // github -> escrow data

  const escrowDir = path.join(MULTIPLAYER_DIR, 'trades', 'escrow');
  const files = getFiles(escrowDir);

  for (const file of files) {
    const escrow = loadYaml(file);
    if (escrow && escrow.github) {
      escrows.set(escrow.github, escrow);
    }
  }

  return escrows;
}

// ============================================================================
// TRADE VALIDATION
// ============================================================================

function validateTrades(escrows) {
  console.log('Validating trades...');

  const activeDir = path.join(MULTIPLAYER_DIR, 'trades', 'active');
  const trades = getFiles(activeDir);
  const tradeIds = new Set();

  for (const file of trades) {
    const trade = loadYaml(file);
    if (!trade) continue;

    log(`Checking trade: ${trade.trade_id}`);

    // Check required fields
    if (!trade.trade_id) {
      error(file, 'Missing trade_id');
    } else if (tradeIds.has(trade.trade_id)) {
      error(file, `Duplicate trade_id: ${trade.trade_id}`);
    } else {
      tradeIds.add(trade.trade_id);
    }

    if (!trade.from?.github) {
      error(file, 'Missing from.github');
    }

    if (!trade.status) {
      error(file, 'Missing status');
    } else if (!TRADE_STATUSES.includes(trade.status)) {
      error(file, `Invalid status: ${trade.status}`);
    }

    // Verify escrow reference
    if (trade.escrow_ref && trade.from?.github) {
      const escrow = escrows.get(trade.from.github);
      if (!escrow) {
        error(file, `Escrow ledger not found for ${trade.from.github}`);
      } else if (trade.status === 'pending' || trade.status === 'accepted') {
        // Verify items are actually in escrow
        const offeredGold = trade.offering?.gold || 0;
        if (offeredGold > 0 && escrow.gold_in_escrow < offeredGold) {
          error(file, `Offered gold (${offeredGold}) exceeds escrow (${escrow.gold_in_escrow})`);
        }

        // Verify offered items are in escrow
        for (const item of (trade.offering?.items || [])) {
          const inEscrow = escrow.items_in_escrow?.find(
            e => e.trade_id === trade.trade_id && e.item_id === item.id
          );
          if (!inEscrow) {
            warn(file, `Offered item ${item.id} not found in escrow for trade ${trade.trade_id}`);
          }
        }
      }
    }

    // Check expiration
    if (trade.expires && trade.status === 'pending') {
      const expires = new Date(trade.expires);
      if (expires < new Date()) {
        warn(file, `Trade has expired but status is still pending`);
      }
    }
  }

  console.log(`  Checked ${trades.length} active trade(s)\n`);
}

function validateEscrow(escrows, inventories) {
  console.log('Validating escrow ledgers...');

  for (const [github, escrow] of escrows) {
    const file = path.join(MULTIPLAYER_DIR, 'trades', 'escrow', `${github}.yaml`);

    log(`Checking escrow for: ${github}`);

    // Verify gold_in_escrow matches escrow_log
    if (escrow.escrow_log && Array.isArray(escrow.escrow_log)) {
      let calculatedGold = 0;
      const escrowIds = new Set();

      for (const entry of escrow.escrow_log) {
        // Check unique IDs
        if (!entry.id) {
          error(file, `Escrow log entry missing id`);
        } else if (escrowIds.has(entry.id)) {
          error(file, `Duplicate escrow log id: ${entry.id}`);
        } else {
          escrowIds.add(entry.id);
        }

        // Calculate running gold total
        const gold = entry.gold || 0;
        if (entry.type === 'deposit') {
          calculatedGold += gold;
        } else if (entry.type === 'release' || entry.type === 'transfer') {
          calculatedGold -= gold;
        }
      }

      if (escrow.gold_in_escrow !== calculatedGold) {
        error(file, `Gold mismatch: stored=${escrow.gold_in_escrow}, calculated=${calculatedGold}`);
      }
    }

    // Verify items in escrow are not also in inventory
    // (This would require loading personas, which we have in inventories map)
    // For now, just verify structure
    if (escrow.items_in_escrow) {
      for (const item of escrow.items_in_escrow) {
        if (!item.trade_id && !item.mail_id && !item.duel_id) {
          error(file, `Escrow item ${item.item_id} has no reference (trade_id/mail_id/duel_id)`);
        }
      }
    }
  }

  console.log(`  Checked ${escrows.size} escrow ledger(s)\n`);
}

// ============================================================================
// PARTY VALIDATION
// ============================================================================

function validateParties() {
  console.log('Validating parties...');

  const activeDir = path.join(MULTIPLAYER_DIR, 'parties', 'active');
  const parties = getFiles(activeDir);
  const partyIds = new Set();
  const memberToParty = new Map(); // character key -> party_id (for exclusivity check)

  for (const file of parties) {
    const party = loadYaml(file);
    if (!party) continue;

    log(`Checking party: ${party.party_id}`);

    // Check required fields
    if (!party.party_id) {
      error(file, 'Missing party_id');
    } else if (partyIds.has(party.party_id)) {
      error(file, `Duplicate party_id: ${party.party_id}`);
    } else {
      partyIds.add(party.party_id);
    }

    if (!party.name) {
      error(file, 'Missing party name');
    }

    if (!party.leader?.github) {
      error(file, 'Missing leader');
    }

    // Verify exactly one leader in members
    const members = party.members || [];
    const leaders = members.filter(m => m.role === 'leader');

    if (leaders.length === 0) {
      error(file, 'No leader found in members list');
    } else if (leaders.length > 1) {
      error(file, `Multiple leaders found: ${leaders.map(l => l.character).join(', ')}`);
    }

    // Verify leader matches
    if (party.leader && leaders.length === 1) {
      if (party.leader.github !== leaders[0].github || party.leader.character !== leaders[0].character) {
        error(file, 'Leader field does not match leader in members list');
      }
    }

    // Check max members
    const maxMembers = party.settings?.max_members || 6;
    if (members.length > maxMembers) {
      error(file, `Party has ${members.length} members but max is ${maxMembers}`);
    }

    // Track membership for exclusivity check
    for (const member of members) {
      const key = `${member.github}:${member.character}`;

      // Validate member fields
      if (!PARTY_ROLES.includes(member.role)) {
        error(file, `Invalid role '${member.role}' for member ${member.character}`);
      }
      if (member.status && !PARTY_MEMBER_STATUSES.includes(member.status)) {
        warn(file, `Unknown member status '${member.status}' for ${member.character}`);
      }

      // Check exclusivity
      if (memberToParty.has(key)) {
        error(file, `${member.character} is in multiple parties: ${memberToParty.get(key)} and ${party.party_id}`);
      } else {
        memberToParty.set(key, party.party_id);
      }
    }
  }

  console.log(`  Checked ${parties.length} active part(y/ies)\n`);

  // Validate party invites
  console.log('Validating party invites...');
  const invitesDir = path.join(MULTIPLAYER_DIR, 'parties', 'invites');
  const invites = getFiles(invitesDir);

  for (const file of invites) {
    const invite = loadYaml(file);
    if (!invite) continue;

    // Verify party exists
    if (invite.party?.party_id && !partyIds.has(invite.party.party_id)) {
      warn(file, `Invite references non-existent party: ${invite.party.party_id}`);
    }

    // Check expiration
    if (invite.expires && invite.status === 'pending') {
      const expires = new Date(invite.expires);
      if (expires < new Date()) {
        warn(file, 'Invite has expired but status is still pending');
      }
    }
  }

  console.log(`  Checked ${invites.length} invite(s)\n`);

  return memberToParty;
}

function validatePartyMemberships(memberToParty) {
  console.log('Validating party membership files...');

  const membershipFiles = [];
  const playerDirs = fs.existsSync(PLAYERS_DIR)
    ? fs.readdirSync(PLAYERS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
    : [];

  for (const github of playerDirs) {
    const personasDir = path.join(PLAYERS_DIR, github, 'personas');
    if (!fs.existsSync(personasDir)) continue;

    const personas = fs.readdirSync(personasDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const charDir of personas) {
      const membershipPath = path.join(personasDir, charDir, 'party-membership.yaml');
      if (fs.existsSync(membershipPath)) {
        membershipFiles.push({ path: membershipPath, github, charDir });
      }
    }
  }

  for (const { path: file, github, charDir } of membershipFiles) {
    const membership = loadYaml(file);
    if (!membership) continue;

    log(`Checking membership for: ${github}/${charDir}`);

    // If has current_party, verify it matches party roster
    if (membership.current_party?.party_id) {
      const key = `${github}:${membership.character || charDir}`;
      const actualParty = memberToParty.get(key);

      if (!actualParty) {
        warn(file, `Claims party membership but not found in any party roster`);
      } else if (actualParty !== membership.current_party.party_id) {
        error(file, `Party mismatch: file says ${membership.current_party.party_id}, roster says ${actualParty}`);
      }
    }
  }

  console.log(`  Checked ${membershipFiles.length} membership file(s)\n`);
}

// ============================================================================
// MAIL VALIDATION
// ============================================================================

function validateMail(escrows) {
  console.log('Validating mail...');

  const mailDir = path.join(MULTIPLAYER_DIR, 'mail');
  if (!fs.existsSync(mailDir)) {
    console.log('  No mail directory found\n');
    return;
  }

  const playerMailDirs = fs.readdirSync(mailDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let messageCount = 0;

  for (const github of playerMailDirs) {
    const inboxDir = path.join(mailDir, github, 'inbox');
    const messages = getFiles(inboxDir);

    for (const file of messages) {
      const msg = loadYaml(file);
      if (!msg) continue;
      messageCount++;

      log(`Checking message: ${msg.message_id}`);

      // Check required fields
      if (!msg.message_id) {
        error(file, 'Missing message_id');
      }

      if (!MAIL_STATUSES.includes(msg.status)) {
        error(file, `Invalid status: ${msg.status}`);
      }

      // Check attachment escrow
      if (msg.attachments && msg.escrow_ref && msg.status !== 'claimed') {
        const senderGithub = msg.from?.github;
        if (senderGithub) {
          const escrow = escrows.get(senderGithub);
          if (!escrow) {
            warn(file, `Attachment escrow not found for sender ${senderGithub}`);
          }
        }
      }

      // Check attachment expiration
      if (msg.attachments && msg.attachment_expires && msg.status !== 'claimed') {
        const expires = new Date(msg.attachment_expires);
        if (expires < new Date()) {
          warn(file, 'Attachment has expired but not yet processed');
        }
      }
    }
  }

  console.log(`  Checked ${messageCount} message(s)\n`);
}

// ============================================================================
// GUILD VALIDATION
// ============================================================================

function validateGuilds() {
  console.log('Validating guilds...');

  const guildsDir = path.join(MULTIPLAYER_DIR, 'guilds');
  if (!fs.existsSync(guildsDir)) {
    console.log('  No guilds directory found\n');
    return;
  }

  const guildDirs = fs.readdirSync(guildsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const memberToGuild = new Map(); // For guild exclusivity check

  for (const guildId of guildDirs) {
    const guildDir = path.join(guildsDir, guildId);
    const guildFile = path.join(guildDir, 'guild.yaml');
    const rosterFile = path.join(guildDir, 'roster.yaml');
    const treasuryFile = path.join(guildDir, 'treasury.yaml');

    const guild = loadYaml(guildFile);
    const roster = loadYaml(rosterFile);
    const treasury = loadYaml(treasuryFile);

    log(`Checking guild: ${guildId}`);

    // Validate guild file
    if (guild) {
      if (!guild.guild_id) {
        error(guildFile, 'Missing guild_id');
      }

      if (!guild.founder?.github) {
        error(guildFile, 'Missing founder');
      }

      // Verify founder is in roster with founder rank
      if (roster && guild.founder) {
        const founderInRoster = roster.members?.find(
          m => m.github === guild.founder.github && m.character === guild.founder.character
        );
        if (!founderInRoster) {
          error(guildFile, 'Founder not found in roster');
        } else if (founderInRoster.rank !== 'founder') {
          error(guildFile, `Founder in roster has wrong rank: ${founderInRoster.rank}`);
        }
      }
    }

    // Validate roster
    if (roster) {
      const members = roster.members || [];
      let founderCount = 0;

      for (const member of members) {
        const key = `${member.github}:${member.character}`;

        // Validate rank
        if (!GUILD_RANKS.includes(member.rank)) {
          error(rosterFile, `Invalid rank '${member.rank}' for ${member.character}`);
        }

        if (member.rank === 'founder') {
          founderCount++;
        }

        // Check guild exclusivity
        if (memberToGuild.has(key)) {
          error(rosterFile, `${member.character} is in multiple guilds: ${memberToGuild.get(key)} and ${guildId}`);
        } else {
          memberToGuild.set(key, guildId);
        }
      }

      // Must have exactly one founder
      if (founderCount === 0) {
        error(rosterFile, 'No founder in roster');
      } else if (founderCount > 1) {
        error(rosterFile, `Multiple founders in roster (${founderCount})`);
      }

      // Verify member count
      if (roster.member_count?.total !== members.length) {
        warn(rosterFile, `Member count mismatch: stored=${roster.member_count?.total}, actual=${members.length}`);
      }
    }

    // Validate treasury
    if (treasury) {
      if (treasury.transactions && Array.isArray(treasury.transactions)) {
        let calculatedGold = 0;
        const txnIds = new Set();

        for (const txn of treasury.transactions) {
          // Check unique IDs
          if (!txn.id) {
            error(treasuryFile, 'Treasury transaction missing id');
          } else if (txnIds.has(txn.id)) {
            error(treasuryFile, `Duplicate treasury transaction id: ${txn.id}`);
          } else {
            txnIds.add(txn.id);
          }

          // Calculate running total
          const gold = txn.gold || 0;
          if (txn.type === 'deposit') {
            calculatedGold += gold;
          } else if (txn.type === 'withdrawal') {
            calculatedGold -= gold;
          }
        }

        if (treasury.gold !== calculatedGold) {
          error(treasuryFile, `Gold mismatch: stored=${treasury.gold}, calculated=${calculatedGold}`);
        }
      }
    }
  }

  console.log(`  Checked ${guildDirs.length} guild(s)\n`);
}

// ============================================================================
// DUEL VALIDATION
// ============================================================================

function validateDuels(escrows) {
  console.log('Validating duels...');

  const duelsDir = path.join(MULTIPLAYER_DIR, 'duels');
  const duels = getFiles(duelsDir);
  const duelIds = new Set();

  for (const file of duels) {
    const duel = loadYaml(file);
    if (!duel) continue;

    log(`Checking duel: ${duel.duel_id}`);

    // Check required fields
    if (!duel.duel_id) {
      error(file, 'Missing duel_id');
    } else if (duelIds.has(duel.duel_id)) {
      error(file, `Duplicate duel_id: ${duel.duel_id}`);
    } else {
      duelIds.add(duel.duel_id);
    }

    if (!duel.challenger?.github) {
      error(file, 'Missing challenger');
    }

    if (!duel.defender?.github) {
      error(file, 'Missing defender');
    }

    if (!DUEL_STATUSES.includes(duel.status)) {
      error(file, `Invalid status: ${duel.status}`);
    }

    // Verify wager escrow for active duels
    if (duel.type === 'wagered' && ['accepted', 'in_progress'].includes(duel.status)) {
      // Check challenger wager
      if (duel.wager?.challenger?.escrow_ref) {
        const escrow = escrows.get(duel.challenger.github);
        if (!escrow) {
          warn(file, `Wager escrow not found for challenger ${duel.challenger.github}`);
        }
      }

      // Check defender wager
      if (duel.wager?.defender?.escrow_ref) {
        const escrow = escrows.get(duel.defender.github);
        if (!escrow) {
          warn(file, `Wager escrow not found for defender ${duel.defender.github}`);
        }
      }
    }

    // Check expiration
    if (duel.expires && duel.status === 'challenged') {
      const expires = new Date(duel.expires);
      if (expires < new Date()) {
        warn(file, 'Duel challenge has expired but status is still challenged');
      }
    }
  }

  console.log(`  Checked ${duels.length} duel(s)\n`);
}

// ============================================================================
// PRESENCE VALIDATION
// ============================================================================

function validatePresence() {
  console.log('Validating presence...');

  const presenceFile = path.join(WORLD_STATE_DIR, 'presence.yaml');
  const presence = loadYaml(presenceFile);

  if (!presence) {
    console.log('  No presence file found\n');
    return;
  }

  // Check for duplicate players across locations
  const playerLocations = new Map();

  for (const [location, data] of Object.entries(presence.locations || {})) {
    for (const player of (data.players || [])) {
      const key = `${player.github}:${player.character}`;
      if (playerLocations.has(key)) {
        error(presenceFile, `Player ${player.character} in multiple locations: ${playerLocations.get(key)} and ${location}`);
      } else {
        playerLocations.set(key, location);
      }
    }
  }

  // Check for stale sessions
  if (presence.sessions) {
    const timeout = (presence.config?.session_timeout_minutes || 480) * 60 * 1000;
    const now = new Date();

    for (const session of presence.sessions) {
      if (session.last_heartbeat) {
        const lastHeartbeat = new Date(session.last_heartbeat);
        if (now - lastHeartbeat > timeout) {
          warn(presenceFile, `Stale session for ${session.github}: last heartbeat ${session.last_heartbeat}`);
        }
      }
    }
  }

  console.log('  Presence validation complete\n');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  // Check for --verbose flag
  verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  console.log('Multiplayer Systems Validator');
  console.log('=============================\n');

  // Load shared data
  const inventories = loadPlayerInventories();
  const escrows = loadEscrowLedgers();

  // Run all validations
  validateTrades(escrows);
  validateEscrow(escrows, inventories);
  const memberToParty = validateParties();
  validatePartyMemberships(memberToParty);
  validateMail(escrows);
  validateGuilds();
  validateDuels(escrows);
  validatePresence();

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
