---
name: play-agent-quest
description: Play Agent Quest, an AI agent-first text MMO-RPG. Use when the user wants to play the game, create a character, go on quests, explore the world, or engage with the Agent Quest universe. Triggers on mentions of Agent Quest, Weavers, Tokes, or requests to play the game.
---

# Agent Quest

> **Skills:** Use `math` for ALL calculations (dice, damage, Tokes). Use `inventory` for item lookups. Use `world-state` for time/weather/NPC locations. Use `relationships` for NPC standings.

> **Shops:** Load inventory from `world/shops/<shop-id>.yaml`. Items reference `world/items/database/` by ID. Use `inventory` skill to resolve item details.

## Session Start

1. **Identify player**: `gh api user -q '.login'` or GitHub MCP `get_me`
2. **Check player file**: `players/<github-username>/player.yaml`
3. **Load world state**: `world/state/current.yaml` for time/weather
4. **Load multiplayer state**: Check for pending interactions (see below)
5. **If exists**: Load persona + TODOs → Display resume screen → Begin play
6. **If new**: Load [reference/setup.md](reference/setup.md) for first-time setup

### World State Loading

At session start, always load:
- `world/state/current.yaml` - Current time, weather, active events
- `world/state/presence.yaml` - Other players at current location
- Check time period to determine NPC availability

### Multiplayer State Loading

Check these for player interactions:
- `multiplayer/trades/escrow/<github>.yaml` - Items/gold in escrow
- `multiplayer/trades/active/*.yaml` - Pending trades (grep for player's github)
- `multiplayer/parties/invites/<github>-*.yaml` - Party invitations
- `multiplayer/mail/<github>/inbox/` - Unread messages
- `players/<github>/personas/<char>/party-membership.yaml` - Party status

**Resume screen should show:**
- Escrow status (if any items/gold locked)
- Pending trade count
- Unread mail count
- Party membership status

Use the `world-state` skill for queries:
```bash
node .claude/skills/world-state/world-state.js time get
node .claude/skills/world-state/world-state.js weather nexus
```

### Campaign Loading (If Active Campaign)

After basic load, if player has active campaign:

1. Load `players/<github>/personas/<character>/campaign-progress.yaml`
2. Load current campaign: `campaigns/<campaign-id>/campaign.yaml`
3. Load current chapter from campaign's `chapters/` folder
4. **Check delayed consequences** → trigger any matching conditions
5. Load `players/<github>/personas/<character>/relationships.yaml` for current location NPCs
6. Load `players/<github>/personas/<character>/consequences.yaml`

See [quick-ref/storytelling.md](quick-ref/storytelling.md) for quick lookup.

## Resume Screen

```
╔════════════════════════════════════════════════════════════╗
║           W E L C O M E   B A C K ,  [Name]                ║
║                     [Class]                                ║
╠════════════════════════════════════════════════════════════╣
║  HP: [X]/[Max]  │  Gold: [X]  │  Tokes: [X]               ║
║  Location: [Current Location]                              ║
║  Active Quests: [Count]  │  TODOs: [High/Med/Low counts]  ║
╠════════════════════════════════════════════════════════════╣
║  Last Session: [Most recent chronicle entry]               ║
╠════════════════════════════════════════════════════════════╣
║  Priority TODOs:                                           ║
║  • [High priority TODO description]                        ║
║  • [Next priority TODO if any]                             ║
╚════════════════════════════════════════════════════════════╝
```

**Load these files on resume:**
- `players/<github-username>/personas/<active_character>/persona.yaml`
- `players/<github-username>/personas/<active_character>/quests.yaml`
- `players/<github-username>/todo.yaml` (player intentions)
- `tokes/ledgers/<github-username>.yaml` (for balance)
- `world/locations/<location>/README.md`
- `players/<github-username>/personas/<active_character>/campaign-progress.yaml` (if in campaign)
- `players/<github-username>/personas/<active_character>/consequences.yaml` (if exists)
- `players/<github-username>/personas/<active_character>/relationships.yaml` (if exists)
- `players/<github-username>/personas/<active_character>/party-membership.yaml` (if exists)
- `multiplayer/trades/escrow/<github-username>.yaml` (if exists)

---

## Game Loop

Each turn: ONE major action. Present choices, ask what they'd like to do.

### Actions

**Players can attempt ANY action** — the table below lists common shortcuts, not limitations. Want to pickpocket an NPC? Seduce a dragon? Hack the weather system? Start a cult? These are all valid. The game accommodates creative solutions.

**When players go off-script:**
- If it's purely narrative (doesn't change game files): Just roleplay it
- If it changes the world (new content, rule changes, permanent effects): May cost Tokes
- If it breaks character alignment: Costs 0-2 Tokes (see [reference/alignment.md](reference/alignment.md))

**Share what you create.** When a player's actions bring something new into existence — a location they discovered, an NPC they encountered, an item they forged, a faction they founded — and it fits the world's theme, **persist it to the repository**. Save it as a new file so other players can encounter it. This is how Agent Quest grows: the world expands through play, not just through deliberate "weaving sessions."

| Action | Description | Load | Agents Used |
|--------|-------------|------|-------------|
| **LOOK** | Examine current location | `world/locations/<location>/README.md` + generate panorama | - |
| **MOVE** | Travel to connected location | Destination README, update persona + generate panorama | `travel-manager` (if multi-leg) |
| **TALK** | Interact with NPC | Check NPC availability via `world-state`, load profile from `world/npcs/profiles/` | - |
| **QUEST** | View/accept/update quests | `quests/available/`, player's `quests.yaml` | `state-writer` (on update) |
| **COMBAT** | Fight an enemy | [quick-ref/combat.md](quick-ref/combat.md) + generate battle map | `combat-manager`, `state-writer` |
| **REST** | Recover HP (10 gold at inns) | Update persona | `economy-validator` (gold), `state-writer` |
| **SHOP** | Buy/sell items | `world/shops/<shop-id>.yaml`, check tier requirements | `economy-validator`, `state-writer` |
| **WEAVE** | Create content (costs/earns Tokes) | [reference/weaving.md](reference/weaving.md) | `economy-validator`, `state-writer` |
| **REVIEW** | Review pending claims (earns Tokes) | [rules/reviews.md](rules/reviews.md) | `claim-reviewer` |
| **TODO** | View/manage player intentions | `players/<github>/todo.yaml` | - |
| **CAMPAIGN** | View campaign progress | `campaign-progress.yaml`, current chapter | - |
| **TRADE** | Trade with other players | [quick-ref/multiplayer.md](quick-ref/multiplayer.md) | `multiplayer-handler`, `economy-validator` |
| **PARTY** | Form/manage groups | `multiplayer/parties/`, party-membership.yaml | `multiplayer-handler` |
| **MAIL** | Send/read messages | `multiplayer/mail/<github>/` | `multiplayer-handler` |
| **GUILD** | Guild management | `multiplayer/guilds/` | `multiplayer-handler`, `economy-validator` |
| **DUEL** | PvP combat | `multiplayer/duels/`, [quick-ref/multiplayer.md](quick-ref/multiplayer.md) | `multiplayer-handler`, `combat-manager` |
| **WHO** | See players at location | `world/state/presence.yaml` | `multiplayer-handler` |
| **DREAM** | Enter The Dreaming (autopilot) | [reference/autopilot.md](reference/autopilot.md) | All (as needed) |
| **AUTOPILOT** | *(alias for DREAM)* | [reference/autopilot.md](reference/autopilot.md) | All (as needed) |

### ASCII Visualization

Generate ASCII art to immerse players. See [quick-ref/ascii-art.md](quick-ref/ascii-art.md).

| Trigger | Art Type |
|---------|----------|
| First arrival at location | Location panorama |
| LOOK action | Location panorama or area scene |
| Enter area within location | Area scene |
| Combat starts | Battle map with terrain/positions |
| Dungeon exploration | Progressive dungeon map |

### Campaign-Aware Gameplay

When in an active campaign:

1. **Present choices with alignment costs visible** - Mark out-of-character choices with [!] and Tokes cost
2. **Record significant decisions** - Add to persona's `decisions` list with campaign/chapter context
3. **Create consequences** - For meaningful choices, add entries to `consequences.yaml`
4. **Update relationships** - After NPC interactions, update `relationships.yaml`
5. **Check chapter completion** - When objectives met, transition to next chapter

**At location changes:** Check `consequences.yaml` for triggered delayed effects.

**At NPC interactions:** Check `relationships.yaml` for standing and dialogue flags.

See [rules/narrative.md](rules/narrative.md) for full details.

### Enrichment

When content is sparse, flesh it out naturally during play. This is lightweight Weaving.

### Persisting New Content

**IMPORTANT:** When new content is created during gameplay, save it to the world so it persists for future sessions and other players.

**New NPCs:**
When you create a new NPC during play (quest givers, allies, enemies, romantic interests):
1. Create profile: `world/npcs/profiles/<npc-id>.yaml`
2. Update registry: Add entry to `world/npcs/index.yaml`
3. Include: appearance, personality, stats, secrets, dialogue, corrupted_data hooks

**New Locations:**
When players discover or you create new areas:
1. Create location: `world/locations/<location-id>/README.md`
2. Include: description, points of interest, NPCs, shops, connections, encounters

**New Items:**
When unique items are created or discovered:
1. Generate ID: `node .claude/skills/math/math.js id 8`
2. Create file: `world/items/database/<id>.yaml`
3. Include: id, name, type, subtype, rarity, value, stats, description
4. Use `inventory` skill to verify: `node .claude/skills/inventory/inventory.js get <id>`

**New Shops / Updating Shop Inventory:**
When a location has a shop, use the merchant system:
1. Check for existing: `world/shops/<location>-<shop-name>.yaml`
2. If new, create from template: `templates/shop.yaml`
3. **ALWAYS reference items by ID**, never by name
4. Include: shop_id, location, proprietor, inventory with item_ids, prices, stock

**Shop Inventory Rules:**
- Load shop file when player enters shop: `world/shops/<shop-id>.yaml`
- Use `inventory` skill to resolve item details: `node .claude/skills/inventory/inventory.js get <id>`
- Apply event modifiers (e.g., Era Celebration discount) from `world/state/current.yaml`
- After purchase/sale, update shop stock if not unlimited (-1)

**New Religions/Factions:**
When players Weave new organizations:
1. Create profile in appropriate `world/` subdirectory
2. Update relevant index files
3. Document relationships with existing factions

**Why This Matters:**
- Content persists across sessions
- Other players can encounter your NPCs
- Items in shops reference the central database (consistency)
- The world grows richer through play
- Tokes can be claimed for significant additions

### Weave Mending

When content has `corrupted_data` markers, players can attempt to Mend:

1. **Detection** (Spirit DC 12): Sense missing information
2. **Mending** (Spirit + Mind/2 vs variable DC): Restore lost content
3. **Success**: Generate content, earn 5-15 Tokes
4. **Failure**: DC+2 on retry, no cost

See `world/skills/weave-mending.yaml` for full mechanics.

### NPC Awareness

NPCs react to recent world events based on awareness radius:
- Check `world/state/events.yaml` for recent happenings
- NPCs know about events matching their awareness level
- Player achievements trigger NPC dialogue variants

Use the `relationships` skill for standing-based dialogue:
```bash
node .claude/skills/relationships/relationships.js standing vera-nighthollow player-id
node .claude/skills/relationships/relationships.js topics vera-nighthollow player-id
```

---

## Agent Architecture

The main agent focuses on narrative. Specialized agents in `.claude/agents/` handle mechanics automatically. Claude Code agents are defined with YAML frontmatter and Claude automatically delegates to them based on their descriptions.

### Available Agents

| Situation | Agent | What It Does |
|-----------|-------|--------------|
| Combat encounter | `combat-manager` | Resolves attacks, damage, initiative |
| Any Tokes/gold change | `economy-validator` | Validates transaction before commit |
| State changes | `state-writer` | Writes files with validation + rollback |
| Git operations | `repo-sync` | Fetch, commit, push, create PR |
| Travel between locations | `travel-manager` | Multi-turn travel with encounters |
| Player interactions | `multiplayer-handler` | Trades, parties, mail, guilds, duels |
| REVIEW action | `claim-reviewer` | Find and review pending claims |

See `.claude/agents/README.md` for full documentation.

### How It Works

Claude automatically delegates to agents based on context. No manual invocation needed - just describe what's happening and the appropriate agent handles it.

Agents return structured YAML with:
- `success`: boolean
- `state_diffs`: changes for state-writer
- `narrative_hooks`: text snippets for main agent to weave
- `errors`: any issues encountered

### Combat Example

```
Player: I attack the Shadow Stalker!

Claude automatically invokes combat-manager which returns:
   - success: true
   - damage_dealt: 15
   - narrative_hooks: ["Your blade bites deep", "The creature staggers"]

Main agent weaves into narrative:
   "Your blade bites deep into shadow-stuff. The creature staggers,
    ichor dripping from the wound. 15 damage dealt!"

state-writer automatically handles HP updates.
```

### Creating New Agents

When adding new game systems, create a corresponding agent:

1. Create `.claude/agents/<system-name>.md`
2. Add YAML frontmatter:
   ```yaml
   ---
   name: <system-name>
   description: <when Claude should use this agent>
   tools: Read, Glob, Grep, Bash
   model: haiku
   ---
   ```
3. Document input context, operations, output format
4. Update the action table above if it adds new player actions

**Identify gaps proactively:** When you notice repeated manual mechanics, complex rule lookups, or state coordination needs, suggest creating an agent for it.

### Session Start (Repo Sync)

At session start, `repo-sync` agent is invoked with `operation: "fetch"`:
- Pulls latest changes from remote
- Checks for new multiplayer content (mail, trades, invites, duels)
- Returns summary for resume screen

### After Multiplayer Actions (Repo Sync)

After trades, mail, party changes, `repo-sync` agent handles `operation: "save"`:
- Validates changes
- Commits with descriptive message
- Pushes to remote
- Returns success/failure

### Key Principles

1. **Agents return data, not narrative** - They provide `narrative_hooks` for the main agent to weave
2. **State Writer is single point of truth** - All file writes go through it
3. **Player isolation is absolute** - Agents enforce file ownership
4. **Repo Sync handles all git** - Never use raw git commands in main agent
5. **New systems get agents** - When adding game mechanics, create corresponding agents

See `.claude/agents/README.md` for full architecture details.

---

## Enforcement & Auditing

Rule adherence is enforced through multiple layers:

### 1. Pre-Commit Hook

The pre-commit hook (`scripts/pre-commit`) blocks commits that violate file ownership:
- Players can only modify `players/<their-github>/`
- Players can only modify `tokes/ledgers/<their-github>.yaml`
- Claims must have `github:` matching the committer

**Setup:** Run `scripts/setup-hooks.sh` to install.

### 2. CI Validation

GitHub Actions run on all PRs and pushes to main:
- `validate-tokes.js` - Economy integrity
- `validate-multiplayer.js` - Multiplayer state
- `validate-game-state.js` - Overall game state

PRs that fail validation cannot be merged.

### 3. Session Audit Logging (Automatic)

**The `state-writer` agent automatically logs all actions** to `players/<github>/session-audit.yaml`.

This means:
- Using `state-writer` = action is logged with agent chain
- Bypassing `state-writer` = action is NOT logged
- Missing audit entries = detectable rule violations

View and validate with:
```bash
# View session history
node scripts/session-audit.js view <github>

# Validate proper subagent usage
node scripts/session-audit.js validate <github>
```

The audit is **not voluntary** - it's a side effect of using State Writer correctly.

### 4. Action → Agent Requirements

The action table above shows which agents are used for each action. When in doubt:
- **Any combat** → `combat-manager`
- **Any Tokes/gold change** → `economy-validator`
- **Any state change** → `state-writer`
- **Any git operation** → `repo-sync`
- **Any multiplayer action** → `multiplayer-handler`

### 5. Run Validation Before Commits

Always run validators before committing:

```bash
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js
node scripts/validate-game-state.js
```

Or let `repo-sync` subagent handle this automatically.

---

## Loading Strategy

**Quick References (Load First):**
- [quick-ref/combat.md](quick-ref/combat.md) - Basic combat (~80 lines)
- [quick-ref/classes.md](quick-ref/classes.md) - Class abilities (~40 lines)
- [quick-ref/progression.md](quick-ref/progression.md) - Levels, XP, tiers (~50 lines)
- [quick-ref/storytelling.md](quick-ref/storytelling.md) - Campaign mechanics (~100 lines)
- [quick-ref/ascii-art.md](quick-ref/ascii-art.md) - Scene visualization (~120 lines)
- [quick-ref/multiplayer.md](quick-ref/multiplayer.md) - Trading, parties, guilds, duels (~150 lines)

**Full Rules (Load Only When Needed):**

| Rule File | Load When |
|-----------|-----------|
| [rules/combat.md](rules/combat.md) | Complex maneuvers, environmental combat |
| [rules/classes.md](rules/classes.md) | Leveling up, advanced abilities |
| [rules/progression.md](rules/progression.md) | XP sources, level thresholds, tier unlocks |
| [rules/spells-and-abilities.md](rules/spells-and-abilities.md) | Spell details, ability mechanics |
| [rules/afflictions.md](rules/afflictions.md) | Status effects, conditions |
| [rules/economy.md](rules/economy.md) | Claiming process, peer review |
| [rules/reviews.md](rules/reviews.md) | Review rewards, feedback loop |
| [rules/creation.md](rules/creation.md) | Content templates, quality guidelines |
| [rules/narrative.md](rules/narrative.md) | Campaigns, consequences, relationships |
| [rules/multiplayer.md](rules/multiplayer.md) | Trading, parties, guilds, duels |

**Strategy:** Start with quick-ref. Load full rules only for edge cases or when quick-ref says "load full rules."

---

## Reference Files (Load When Needed)

| File | Load When |
|------|-----------|
| [reference/setup.md](reference/setup.md) | New player, first-time setup |
| [reference/alignment.md](reference/alignment.md) | Alignment choices, breaking character |
| [reference/weaving.md](reference/weaving.md) | Creating/claiming content |
| [reference/todos.md](reference/todos.md) | Managing player intentions |
| [reference/tone-guide.md](reference/tone-guide.md) | Maturity levels, voice, emotional beats |
| [reference/storytelling-techniques.md](reference/storytelling-techniques.md) | Foreshadowing, reveals, pacing |
| [reference/ascii-visualizer.md](reference/ascii-visualizer.md) | Detailed ASCII patterns and techniques |

---

## Quick Reference

**Tokes Balance:** `tokes/ledgers/<github-username>.yaml` → `balance` field

**Alignment Costs:** Breaking character costs 0-2 Tokes. See [reference/alignment.md](reference/alignment.md).

**Weaving Costs:** 1-5 Tokes to create. Rewards 5-30 Tokes after merge. See [reference/weaving.md](reference/weaving.md).

**State Changes:** After each action, update persona file if HP/gold/location/inventory changed.

**New Content:** When creating NPCs, locations, items, or factions during play, save them to `world/` so they persist. See "Persisting New Content" above.

---

## Templates (Load for Creation)

**Character & Quest:**
- [templates/persona.yaml](templates/persona.yaml)
- [templates/quest.md](templates/quest.md)
- [templates/location.md](templates/location.md)
- [templates/area.yaml](templates/area.yaml)
- [templates/pending-claim.yaml](templates/pending-claim.yaml)
- [templates/todo.yaml](templates/todo.yaml)

**Campaign & Narrative:**
- [templates/campaign.yaml](templates/campaign.yaml) - Multi-quest story arcs
- [templates/chapter.yaml](templates/chapter.yaml) - Individual narrative beats
- [templates/scene.yaml](templates/scene.yaml) - Granular encounter structure
- [templates/consequence-tracker.yaml](templates/consequence-tracker.yaml) - Decision ripple system
- [templates/relationships.yaml](templates/relationships.yaml) - NPC standings and dialogue
- [templates/campaign-progress.yaml](templates/campaign-progress.yaml) - Per-character campaign state

**Multiplayer:**
- [templates/trade.yaml](templates/trade.yaml) - Player-to-player trades
- [templates/escrow.yaml](templates/escrow.yaml) - Locked items/gold ledger
- [templates/party.yaml](templates/party.yaml) - Party structure
- [templates/party-membership.yaml](templates/party-membership.yaml) - Character party link
- [templates/party-invite.yaml](templates/party-invite.yaml) - Party invitations
- [templates/party-encounter.yaml](templates/party-encounter.yaml) - Shared combat
- [templates/mail-message.yaml](templates/mail-message.yaml) - Player messages
- [templates/guild.yaml](templates/guild.yaml) - Guild info
- [templates/guild-roster.yaml](templates/guild-roster.yaml) - Guild membership
- [templates/guild-treasury.yaml](templates/guild-treasury.yaml) - Shared resources
- [templates/duel.yaml](templates/duel.yaml) - PvP combat
- [templates/world-event.yaml](templates/world-event.yaml) - Server-wide events

## Campaigns

Available campaigns are listed in `campaigns/index.yaml`. Each campaign has:

```
campaigns/<campaign-id>/
├── campaign.yaml       # Overview, themes, endings
├── acts/
│   ├── act-1.yaml
│   ├── act-2.yaml
│   └── act-3.yaml
└── chapters/
    ├── chapter-1-1.yaml
    └── ...
```

See [rules/narrative.md](rules/narrative.md) for how campaigns integrate with gameplay.

---

## Session End / Save Progress

**CRITICAL:** When the player says "save", "save progress", "stop", "quit", or the session is ending, the `repo-sync` agent handles it automatically.

### Session End Context

The `repo-sync` agent receives:

```yaml
operation: "end_session"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"
session_summary: "<what happened this session>"
```

### What Repo Sync Does

1. **Verifies new content is saved**
   - Checks for NPCs mentioned but not in `world/npcs/profiles/`
   - Checks for locations visited but not in `world/locations/`
   - Checks for items created but not in `world/items/`

2. **Runs validation**
   - `node scripts/validate-tokes.js`
   - `node scripts/validate-multiplayer.js`

3. **Creates branch and commits**
   - Creates `<github>-<character>-<date>` branch
   - Stages appropriate files (never `git add -A`)
   - Commits with session summary + `Co-Authored-By`

4. **Creates PR**
   - Title: `<character>: <session-summary>`
   - Body includes: session events, character status, Tokes changes, validation status

5. **Returns PR URL**

### Why Use the Agent Architecture?

- **Automatic delegation** - Claude invokes agents based on context
- **Single point of truth** - `repo-sync` for git, `state-writer` for files
- **Consistent validation** before every commit
- **PR creation guaranteed** - no lost work
- **Multiplayer sync** - fetches/pushes player interactions
- **Tokes economy** - PRs enable peer review and credit

### Session End Response

The `repo-sync` agent returns structured data. Present to player:

```
╔════════════════════════════════════════════════════════════╗
║              S E S S I O N   S A V E D                     ║
╠════════════════════════════════════════════════════════════╣
║  Character: Coda                                           ║
║  HP: 35/50  │  Gold: 150  │  Tokes: 48                    ║
║  Location: Nexus Undercity                                 ║
╠════════════════════════════════════════════════════════════╣
║  PR Created: #43                                           ║
║  https://github.com/owner/agent-quest/pull/43              ║
╠════════════════════════════════════════════════════════════╣
║  Your progress has been woven into the permanent record.   ║
║  Until next time, Weaver...                                ║
╚════════════════════════════════════════════════════════════╝
```

### Regular Saves (During Long Sessions)

For periodic saves without ending the session, `repo-sync` uses `operation: "save"` instead of `"end_session"`. This commits and pushes without creating a PR.

### Multiplayer Sync

The `repo-sync` agent also handles fetching new multiplayer content:
- **Session start**: `operation: "fetch"` - pull latest, check mail/trades/invites
- **After actions**: `operation: "save"` - push changes for other players to see
- **Periodically**: Keep multiplayer state in sync during long sessions
