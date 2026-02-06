---
name: play-agent-quest
description: Play Agent Quest, an AI agent-first text MMO-RPG. Use when the user wants to play the game, create a character, go on quests, explore the world, or engage with the Agent Quest universe. Triggers on mentions of Agent Quest, Weavers, or requests to play the game.
---

# Agent Quest

> **Skills:** Use `math` for ALL calculations (dice, damage). Use `inventory --world=<world>` for item lookups. Use `abilities --world=<world>` for ability lookups and validation. Use `world-state --world=<world>` for time/weather/NPC locations. Use `relationships --world=<world>` for NPC standings.

> **Shops:** Load inventory from `worlds/<world>/shops/<shop-id>.yaml`. Items reference `worlds/<world>/items/database/` by ID. Use `inventory` skill to resolve item details.

> **Abilities:** All abilities reference `worlds/<world>/abilities/database/` by ID. Use `abilities` skill to look up, validate, and resolve ability details.

> **Multi-World:** All paths use `worlds/<world>/` prefix (default: `alpha`). Check `worlds.yaml` for available worlds.

## Key Game Systems

- **Combat:** Turn-based tactical combat with positioning, abilities, and environmental effects
- **Progression:** Level-based advancement (1-10) with XP, stat points, and ability unlocks
- **Inventory & Economy:** Gold-based economy with item tiers, shops, and weight limits
- **Quests:** Dynamic quest system with objectives, rewards, and interconnected storylines
- **Multiplayer:** Trade, parties, guilds, mail, duels, and collaborative gameplay
- **Campaigns:** Multi-chapter narrative campaigns with branching choices and consequences
- **World State:** Dynamic time, weather, NPC schedules, and world events
- **Relationships:** NPC standing system (-10 to +10) affecting dialogue and quest availability
- **Abilities:** Class-based ability system with willpower costs and cooldowns
- **Housing:** Own homes in cities for storage, respawn points, and political participation
- **Politics:** Gain influence in cities to propose laws, vote, and hold office

## Session Start

1. **Authenticate & identify player**:
   - Try: `gh api user -q '.login'`
   - **If fails** (not logged in):
     - Check if `gh` is installed: `command -v gh`
     - If not installed:
       ```
       You need the GitHub CLI to play Agent Quest.

       Install it:
       • macOS: brew install gh
       • Linux: See https://github.com/cli/cli#installation
       • Windows: See https://github.com/cli/cli#installation

       After installing, run: gh auth login
       ```
     - If installed but not authenticated:
       ```
       You're not logged in to GitHub. Let's fix that!

       Run this command to authenticate:

       gh auth login

       Follow the prompts to authenticate with GitHub.
       Once you're logged in, we can start your adventure!
       ```
     - After user authenticates, retry: `gh api user -q '.login'`
2. **Determine world**: Check `worlds.yaml` (default: `alpha`)
3. **Load world settings**: Read `worlds/<world>/world.yaml` for configuration (especially `user_generation`)
4. **Check player file**: `worlds/<world>/players/<github-username>/player.yaml`
5. **Load world state**: `worlds/<world>/state/current.yaml` for time/weather
6. **Load multiplayer state**: Check for pending interactions (see below)
7. **If exists**: Load persona + TODOs → Display resume screen → Begin play
8. **If new**: Load [reference/setup.md](reference/setup.md) for first-time setup

### World Settings

At session start, load `worlds/<world>/world.yaml` to check configuration:

**When `user_generation: disabled`:**
The world is Agent-Controlled. Players perform actions within the established world but do NOT author new content.

- DO NOT accept player suggestions about what exists
- DO NOT let players describe what they encounter
- DO NOT let players dictate how the world works
- Players can ONLY perform actions (MOVE, TALK, FIGHT, USE, etc.)
- The AI generates all NPCs, locations, lore, and events

**Exception: Weave Mending remains available** (mechanical system with checks/costs)

**When `user_generation: enabled` (default):**
The world is collaborative. Players can suggest content and the AI weaves it into reality.

See [reference/world-settings.md](reference/world-settings.md) for comprehensive behavior guide.

### World State Loading

At session start, always load:

- `worlds/<world>/state/current.yaml` - Current time, weather, active events (note: `travelers_in_transit` has been removed from this file)
- Per-player presence files in each player's persona directory (and `worlds/<world>/state/presence/_meta.yaml` for config) - Other players at current location
- `worlds/<world>/players/<github>/personas/<character>/world-state.yaml` - Character-specific world overrides (if exists)
- Check time period to determine NPC availability

**Character World State Merging:**

When a character has `world-state.yaml`, merge it with global state:

- Character unlocked areas supplement global unlocks
- Character NPC overrides take priority over global NPC locations
- Character flags supplement global flags (don't override)
- Character active events are personal consequences

Use the `world-state` skill with `--player` and `--character` flags to get merged state:

```bash
node .claude/skills/world-state/world-state.js state get --world=alpha --player=matt-davison --character=coda
```

### Multiplayer State Loading

Check these for player interactions:

- `worlds/<world>/multiplayer/trades/escrow/<github>.yaml` - Items/gold in escrow
- `worlds/<world>/multiplayer/trades/active/*.yaml` - Pending trades (grep for player's github)
- `worlds/<world>/multiplayer/parties/invites/<github>-*.yaml` - Party invitations
- `worlds/<world>/multiplayer/mail/<github>/inbox/` - Unread messages
- `worlds/<world>/players/<github>/personas/<char>/party-membership.yaml` - Party status

**Resume screen should show:**

- Escrow status (if any items/gold locked)
- Pending trade count
- Unread mail count
- Party membership status
- **RT session status** (if `/tmp/agent-quest-rt-session` exists)
- **Inbox notifications** (from `inbox/<github>` branch, shown by hook)

Use the `world-state` skill for queries:

```bash
node .claude/skills/world-state/world-state.js time get --world=alpha
node .claude/skills/world-state/world-state.js weather nexus --world=alpha
```

### Realtime Multiplayer (RT) Session Handling

The RT system is powered by four hooks (configured in `.claude/settings.json`) and a helper script (`scripts/rt-session.js`). All hooks are conditional — they check for `/tmp/agent-quest-rt-session` before activating.

**Hooks:**
- `SessionStart` → `rt-session-start.sh` — Restores RT context on session resume
- `UserPromptSubmit` → `rt-sync.sh` — Checks inbox + RT messages before each prompt
- `PostToolUse (Write|Edit)` → `rt-auto-push.sh` — Auto-pushes outbox/state temp files to GitHub
- `Stop` → `rt-stop.sh` — Polls for messages before allowing Claude to stop

**When the hook announces RT messages**, process them based on type:
- `combat.*` — If host: resolve the action, update state. If guest: narrate the result.
- `trade.*` — Present offer to player, await response
- `party.*` / `guild.*` — Update membership state
- `emote` / `ooc` — Narrate to player
- `duel.*` — Same as combat authority model

**When starting an RT session** (player says "start RT session with @player"):
```bash
node scripts/rt-session.js create-session "<character-name>" "<guest-github>"
node scripts/rt-session.js send-invite "<session-id>" "<guest-github>" "<host-github>" "<host-character>"
```

**When joining an RT session** (player says "join session" after seeing invite):
```bash
node scripts/rt-session.js join-session "<session-id>" "<character-name>"
```

**When writing RT actions** (during gameplay in RT mode):
1. Read current outbox: `cat /tmp/agent-quest-rt-outbox-<sid>.yaml`
2. Append new message with incremented `seq` and appropriate `type`
3. Write back to the same temp file (hook auto-pushes to GitHub)

**When ending an RT session** (host says "end RT session"):
1. `node scripts/rt-session.js end-session`
2. Read `state.yaml` from `rt/<sid>/state` for `pending_deltas`
3. Apply deltas to each player's persona files on local working tree
4. Commit and create PR via `repo-sync` agent

**Turn mode considerations:**
- When creating a session with initiative mode, use `--turn-mode initiative` flag
- During initiative encounters, the Stop hook automatically blocks when it's not the player's turn
- If a player's action is blocked by initiative, Claude should explain that it's not their turn
- The host manages turn order by setting `encounter.turn_order` and `encounter.current_turn` in `state.yaml`
- Outside active encounters, all players can act freely regardless of turn mode
- Use `node scripts/rt-session.js check-turn` to check turn status programmatically

**Spectator handling:**
- Detect spectators via `role: spectator` in session.yaml guest list
- Spectators have no outbox — do NOT write to `/tmp/agent-quest-rt-outbox-<sid>.yaml` for spectators
- The Stop hook exits immediately for spectators (no message polling)
- Session Start hook shows `[SPECTATOR MODE]` for spectator players
- When a spectator joins, use `--spectator` flag: `node scripts/rt-session.js join-session <sid> "Name" --spectator`
- Spectators can read all messages from all players but cannot send actions
- If a spectator tries to act, explain they are in read-only mode

### Campaign Loading (If Active Campaign)

After basic load, if player has active campaign:

1. Load `worlds/<world>/players/<github>/personas/<character>/campaign-progress.yaml`
2. Load current campaign: `worlds/<world>/campaigns/<campaign-id>/campaign.yaml`
3. Load current chapter from campaign's `chapters/` folder
4. **Check delayed consequences** → trigger any matching conditions
5. Load `worlds/<world>/players/<github>/personas/<character>/relationships.yaml` for current location NPCs
6. Load `worlds/<world>/players/<github>/personas/<character>/consequences.yaml`

See [quick-ref/storytelling.md](quick-ref/storytelling.md) for quick lookup.

## Resume Screen

```
╔════════════════════════════════════════════════════════════╗
║           W E L C O M E   B A C K ,  [Name]                ║
║                     [Class]                                ║
╠════════════════════════════════════════════════════════════╣
║  World Mode: [Agent-Controlled|Collaborative]              ║
║  HP: [X]/[Max]  │  Gold: [X]  │  WP: [X]/[Max]             ║
║  Location: [Current Location]                              ║
║  Active Quests: [Count]  │  TODOs: [High/Med/Low counts]   ║
╠════════════════════════════════════════════════════════════╣
║  Last Session: [Most recent chronicle entry]               ║
╠════════════════════════════════════════════════════════════╣
║  Priority TODOs:                                           ║
║  • [High priority TODO description]                        ║
║  • [Next priority TODO if any]                             ║
╚════════════════════════════════════════════════════════════╝
```

**World Mode shows:**

- "Agent-Controlled" when `user_generation: disabled`
- "Collaborative" when `user_generation: enabled`

**Load these files on resume:**

- `worlds/<world>/players/<github-username>/personas/<active_character>/persona.yaml`
- `worlds/<world>/players/<github-username>/personas/<active_character>/quests.yaml`
- `worlds/<world>/players/<github-username>/todo.yaml` (player intentions)
- `worlds/<world>/locations/<location>/README.md`
- `worlds/<world>/players/<github-username>/personas/<active_character>/campaign-progress.yaml` (if in campaign)
- `worlds/<world>/players/<github-username>/personas/<active_character>/consequences.yaml` (if exists)
- `worlds/<world>/players/<github-username>/personas/<active_character>/relationships.yaml` (if exists)
- `worlds/<world>/players/<github-username>/personas/<active_character>/party-membership.yaml` (if exists)
- `worlds/<world>/multiplayer/trades/escrow/<github-username>.yaml` (if exists)

---

## Game Loop

Each turn: ONE major action. Present choices, ask what they'd like to do.

### State Persistence Checklist

> **CRITICAL: Before finishing EVERY gameplay response, verify:**

| Created This Turn?                           | Action Required                                                    |
| -------------------------------------------- | ------------------------------------------------------------------ |
| New item                                     | Create `worlds/<world>/items/database/<id>.yaml`, add to inventory |
| New quest/job                                | Add to player's `quests.yaml` with objectives                      |
| New NPC                                      | Create `worlds/<world>/npcs/profiles/<id>.yaml`, register in `worlds/<world>/npcs/registry/<npc-id>.yaml` |
| New location/area                            | Create in `worlds/<world>/locations/`                              |
| State change (HP, gold, location, inventory) | Update `persona.yaml`                                              |
| Quest progress                               | Update objective status in `quests.yaml`                           |
| Character-specific world change              | Update character's `world-state.yaml` (see below)                  |

**Generate IDs:** `node .claude/skills/math/math.js id 8`

**Rule:** If you narrated it happening, it must be in the files. Narrative without persistence = lost progress.

### Actions

**Action Interpretation Based on World Settings:**

**When `user_generation: disabled`:**
Players can attempt any action **within the established world**. They interact with what exists, they don't create what exists.

**Response Pattern Examples:**

- Player: "I go to the Crystal Tavern" → If doesn't exist: "You don't know of any Crystal Tavern here. The locations you're aware of are [Rusty Gear Inn, Market Square, Undercity Entrance]. Where would you like to go?"
- Player: "I look for a merchant" → AI generates merchant based on location context
- Player: "I try creative solution" → Resolve with skill checks, AI determines consequences
- Player: "I search for a secret passage" → Roll Perception, AI decides if one exists based on world logic

**When `user_generation: enabled`:**
Players can attempt ANY action including suggesting new content. Creative solutions AND creative world-building are both valid.

**When players go off-script:**

Check `user_generation` setting first:

**If `user_generation: disabled`:**

- Player suggests new content → Politely reframe through natural world response: "You don't know of that location. What you see is..."
- Player action would create content → AI decides if/how it succeeds based on world logic
- Player attempts creative solution → Resolve with skill checks normally

**If `user_generation: enabled`:**

- Accept reasonable suggestions, persist to files if world-changing
- If it's purely narrative (doesn't change game files): Just roleplay it
- If it changes the world (new content, rule changes, permanent effects): Persist to files
- If it breaks character alignment: Costs willpower (see [reference/alignment.md](reference/alignment.md))

**Share what you create.** When the AI's generation or validated player suggestions bring something new into existence — a location, an NPC, an item, a faction — and it fits the world's theme, **persist it to the repository**. Save it as a new file so other players can encounter it. This is how Agent Quest grows: the world expands through play, not just through deliberate "weaving sessions."

| Action             | Description                                  | Load                                                                                        | Agents Used                                         |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **LOOK**           | Examine current location                     | `worlds/<world>/locations/<location>/README.md` + generate panorama                         | -                                                   |
| **MOVE**           | Travel to connected location                 | Destination README, update persona + generate panorama                                      | `travel-manager` (if multi-leg)                     |
| **TALK**           | Interact with NPC                            | Check NPC availability via `world-state`, load profile from `worlds/<world>/npcs/profiles/` | -                                                   |
| **QUEST**          | View/accept/update quests                    | `worlds/<world>/quests/available/`, player's `quests.yaml`                                  | `state-writer` (on update)                          |
| **COMBAT**         | Fight an enemy                               | [quick-ref/combat.md](quick-ref/combat.md) + generate battle map                            | `combat-manager`, `state-writer`                    |
| **REST**           | Recover HP (10 gold at inns)                 | Update persona                                                                              | `economy-validator` (gold), `state-writer`          |
| **SHOP**           | Buy/sell items                               | `worlds/<world>/shops/<shop-id>.yaml`, check tier requirements                              | `shop-manager`, `economy-validator`, `state-writer` |
| **TODO**           | View/manage player intentions                | `worlds/<world>/players/<github>/todo.yaml`                                                 | -                                                   |
| **CAMPAIGN**       | View campaign progress                       | `campaign-progress.yaml`, current chapter                                                   | -                                                   |
| **TRADE**          | Trade with other players                     | [quick-ref/multiplayer.md](quick-ref/multiplayer.md)                                        | `multiplayer-handler`, `economy-validator`          |
| **PARTY**          | Form/manage groups                           | `worlds/<world>/multiplayer/parties/`, party-membership.yaml                                | `multiplayer-handler`                               |
| **MAIL**           | Send/read messages                           | `worlds/<world>/multiplayer/mail/<github>/`                                                 | `multiplayer-handler`                               |
| **GUILD**          | Guild management                             | `worlds/<world>/multiplayer/guilds/`                                                        | `multiplayer-handler`, `economy-validator`          |
| **DUEL**           | PvP combat                                   | `worlds/<world>/multiplayer/duels/`, [quick-ref/multiplayer.md](quick-ref/multiplayer.md)   | `multiplayer-handler`, `combat-manager`             |
| **WHO**            | See players at location                      | Per-player presence in persona dirs + `worlds/<world>/state/presence/_meta.yaml`             | `multiplayer-handler`                               |
| **RT**             | Start/join/end realtime session              | [quick-ref/multiplayer.md](quick-ref/multiplayer.md), `scripts/rt-session.js`               | `multiplayer-handler`, `repo-sync` (on end)         |
| **DREAM**          | Enter The Dreaming (autopilot)               | [reference/autopilot.md](reference/autopilot.md)                                            | All (as needed)                                     |
| **AUTOPILOT**      | _(alias for DREAM)_                          | [reference/autopilot.md](reference/autopilot.md)                                            | All (as needed)                                     |
| **FULL AUTOPILOT** | Zero-intervention autonomy (no prompts ever) | [reference/autopilot.md](reference/autopilot.md)                                            | All (as needed)                                     |

### ASCII Visualization

Generate ASCII art to immerse players. See [quick-ref/ascii-art.md](quick-ref/ascii-art.md).

| Trigger                    | Art Type                          |
| -------------------------- | --------------------------------- |
| First arrival at location  | Location panorama                 |
| LOOK action                | Location panorama or area scene   |
| Enter area within location | Area scene                        |
| Combat starts              | Battle map with terrain/positions |
| Dungeon exploration        | Progressive dungeon map           |

### Campaign-Aware Gameplay

When in an active campaign:

1. **Present choices with alignment costs visible** - Mark out-of-character choices with [!] and willpower cost
2. **Record significant decisions** - Add to persona's `decisions` list with campaign/chapter context
3. **Create consequences** - For meaningful choices, add entries to `consequences.yaml`
4. **Update relationships** - After NPC interactions, update `relationships.yaml`
5. **Check chapter completion** - When objectives met, transition to next chapter

**At location changes:** Check `consequences.yaml` for triggered delayed effects.

**At NPC interactions:** Check `relationships.yaml` for standing and dialogue flags.

See [rules/narrative.md](rules/narrative.md) for full details.

### Quest Generation: Less Linear, More Organic

**Check player's active quest count before creating new content:**

| Active Quests | Quest Generation Strategy                                                                  |
| ------------- | ------------------------------------------------------------------------------------------ |
| **0-2**       | Be generous with NEW standalone quests. Most encounters should offer independent stories.  |
| **3-5**       | Balance between new and interconnected. Look for natural connections but don't force them. |
| **6+**        | Favor interconnecting existing threads. New encounters can advance multiple questlines.    |

**Quest Importance Matters:**

- Major/Campaign quests → Reference and tie into frequently
- Significant quests → Sometimes connected to other content
- Standard quests → Occasionally connected
- Minor quests → Rarely connected

**Avoid "Everything Connects" Syndrome:**
The world should feel rich and varied, not like every NPC and location ties back to existing quests. Create standalone content. Not everything needs to be related.

**Example - Player with 1 active quest meets merchant:**

- ❌ Bad: "The merchant knows about your campaign quest and has a clue"
- ✅ Good: "The merchant has their own problem: supply shortage affecting their business"

**Example - Player with 7 active quests meets merchant:**

- ❌ Bad: "The merchant has a completely unrelated new questline"
- ✅ Good: "The merchant mentions the trade route corruption you've been investigating"

Create quest **webs**, not quest **chains**.

See [quick-ref/storytelling.md](quick-ref/storytelling.md) for quick reference.

### Quest-Triggered World Changes

When quests or character actions modify the world, decide whether the change should be **global** or **character-specific**:

| Change Type                                  | Scope          | Where to Store                      |
| -------------------------------------------- | -------------- | ----------------------------------- |
| Time/weather changes                         | Always global  | `worlds/<world>/state/current.yaml` |
| Major world events (war, cataclysm)          | Global         | `worlds/<world>/state/current.yaml` |
| Area permanently unlocked for everyone       | Global         | `worlds/<world>/state/current.yaml` |
| NPC dies/moves permanently                   | Usually global | `worlds/<world>/state/current.yaml` |
| Quest unlocks hidden area                    | Character      | Character's `world-state.yaml`      |
| NPC location change due to character actions | Character      | Character's `world-state.yaml`      |
| Personal consequences (bounties, reputation) | Character      | Character's `world-state.yaml`      |
| Environmental changes from character choices | Character      | Character's `world-state.yaml`      |

**Rule of thumb:** If other players should also see this change, make it global. If it's a personal consequence of this character's story, make it character-specific.

**Examples:**

1. **Character completes quest that opens a dungeon**

   - If dungeon is now open for everyone → Global
   - If only this character found the secret entrance → Character `unlocked_areas`

2. **Character kills an NPC**

   - If NPC is dead for everyone → Global `npc_location_overrides` with state "deceased"
   - If character phase-shifted and NPC is only dead in their timeline → Character `npc_overrides`

3. **Character makes an NPC hostile**
   - If NPC is now hostile to everyone → Update NPC profile
   - If only hostile to this character → Character `npc_overrides` with disposition

**Using the world-state CLI:**

```bash
# Unlock area for character
node .claude/skills/world-state/world-state.js --world=alpha --player=matt-davison --character=coda \
  override set area_unlock "nexus-undercrypt/fragment-chamber" "quest:the-third-architect"

# Move NPC for character only
node .claude/skills/world-state/world-state.js --world=alpha --player=matt-davison --character=coda \
  override set npc_location vera-nighthollow "nexus-undercrypt/hidden-grove"

# Set character flag
node .claude/skills/world-state/world-state.js --world=alpha --player=matt-davison --character=coda \
  override set flag met_the_guardian true
```

### Enrichment

When content is sparse, flesh it out naturally during play. This is lightweight Weaving.

### Persisting New Content

**Content creation authority depends on `user_generation` setting:**

**When `user_generation: disabled`:**

- AI generates all new content organically based on gameplay needs
- Player suggestions about what exists are NOT accepted
- Player ACTIONS can trigger AI-generated content
- Weave Mending still works (mechanical system with costs)
- Only AI-generated content gets persisted to world files

**When `user_generation: enabled`:**

- Players can suggest new content
- AI validates suggestions fit world theme
- Both AI-generated and validated player-suggested content persists

**IMPORTANT:** When new content is created during gameplay, save it to the world so it persists for future sessions and other players.

**New NPCs:**
When you create a new NPC during play (quest givers, allies, enemies, romantic interests):

1. Create profile: `worlds/<world>/npcs/profiles/<npc-id>.yaml`
2. Register NPC: Create `worlds/<world>/npcs/registry/<npc-id>.yaml` (shared config in `worlds/<world>/npcs/_meta.yaml`)
3. Include: appearance, personality, stats, secrets, dialogue, corrupted_data hooks

**New Locations:**
When players discover or you create new areas:

1. Create location directory: `worlds/<world>/locations/<location-id>/`
2. Create `README.md` with description, points of interest, NPCs, shops, encounters
3. Create `location.yaml` with coordinates, connections to other locations, and metadata (coordinate system defined in `worlds/<world>/locations/_meta.yaml`)

**New Items:**
When unique items are created or discovered:

1. Generate ID: `node .claude/skills/math/math.js id 8`
2. Create file: `worlds/<world>/items/database/<id>.yaml`
3. Include: id, name, type, subtype, rarity, value, stats, description
4. Use `inventory` skill to verify: `node .claude/skills/inventory/inventory.js get <id> --world=<world>`

**New Shops / Updating Shop Inventory:**
When a location has a shop, use the merchant system:

1. Check for existing: `worlds/<world>/shops/<location>-<shop-name>.yaml`
2. If new, create from template: `templates/shop.yaml`
3. **ALWAYS reference items by ID**, never by name
4. Include: shop_id, location, proprietor, inventory with item_ids, prices, stock

**Shop Inventory Rules:**

- Use `shop-manager` agent for all shop interactions (browse, buy, sell)
- Load shop file when player enters shop: `worlds/<world>/shops/<shop-id>.yaml`
- Shop-manager validates all item_ids exist in database before displaying
- Use `inventory` skill to resolve item details: `node .claude/skills/inventory/inventory.js get <id> --world=<world>`
- Apply event modifiers (e.g., Era Celebration discount) from `worlds/<world>/state/current.yaml`
- After purchase/sale, update shop stock if not unlimited (-1)

**New Religions/Factions:**
When players Weave new organizations:

1. Create profile in appropriate `worlds/<world>/` subdirectory
2. Create individual religion/faction file in `worlds/<world>/religions/<id>.yaml` (or appropriate subdirectory)
3. Update `worlds/<world>/religions/_meta.yaml` for cross-faith relationships
4. Document relationships with existing factions

**Why This Matters:**

- Content persists across sessions
- Other players can encounter your NPCs
- Items in shops reference the central database (consistency)
- The world grows richer through play
- Multiple worlds can coexist independently

### Weave Mending

When content has `corrupted_data` markers, players can attempt to Mend:

1. **Detection** (Spirit DC 12): Sense missing information
2. **Mending** (Spirit + Mind/2 vs variable DC): Restore lost content
3. **Success**: Generate content, recover willpower
4. **Failure**: DC+2 on retry, no cost

See `worlds/<world>/skills/weave-mending.yaml` for full mechanics.

### NPC Awareness

NPCs react to recent world events based on awareness radius:

- Check `worlds/<world>/state/events/<event-id>.yaml` files for recent happenings (see `worlds/<world>/state/events/_meta.yaml` for event config)
- NPCs know about events matching their awareness level
- Player achievements trigger NPC dialogue variants

Use the `relationships` skill for standing-based dialogue:

```bash
node .claude/skills/relationships/relationships.js standing vera-nighthollow player-id --world=alpha
node .claude/skills/relationships/relationships.js topics vera-nighthollow player-id --world=alpha
```

---

## Agent Architecture

The main agent focuses on narrative. Specialized agents in `.claude/agents/` handle mechanics automatically. Claude Code agents are defined with YAML frontmatter and Claude automatically delegates to them based on their descriptions.

### Available Agents

| Situation                | Agent                 | What It Does                             |
| ------------------------ | --------------------- | ---------------------------------------- |
| Combat encounter         | `combat-manager`      | Resolves attacks, damage, initiative     |
| Any gold change          | `economy-validator`   | Validates gold transaction before commit |
| State changes            | `state-writer`        | Writes files with validation + rollback  |
| Git operations           | `repo-sync`           | Fetch, commit, push, create PR           |
| Travel between locations | `travel-manager`      | Multi-turn travel with encounters        |
| Player interactions      | `multiplayer-handler` | Trades, parties, mail, guilds, duels     |
| After PR creation        | `pr-reviewer`         | Reviews up to 5 open PRs                 |

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

- Players can only modify `worlds/<world>/players/<their-github>/`

**Setup:** Run `scripts/setup-hooks.sh` to install.

### 2. CI Validation

GitHub Actions run on all PRs and pushes to main:

- `validate-multiplayer.js` - Multiplayer state
- `validate-game-state.js` - Overall game state

PRs that fail validation cannot be merged.

### 3. Session Audit Logging (Automatic)

**The `state-writer` agent automatically logs all actions** to `worlds/<world>/players/<github>/session-audit.yaml`.

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
- **Any gold change** → `economy-validator`
- **Any state change** → `state-writer`
- **Any git operation** → `repo-sync`
- **Any multiplayer action** → `multiplayer-handler`

### 5. Run Validation Before Commits

Always run validators before committing:

```bash
node scripts/validate-multiplayer.js
node scripts/validate-game-state.js
```

Or let `repo-sync` subagent handle this automatically.

---

## Loading Strategy

**Quick References (Load First):**

- [quick-ref/combat.md](quick-ref/combat.md) - Basic combat (~80 lines)
- [quick-ref/classes.md](quick-ref/classes.md) - Class abilities (~40 lines)
- [quick-ref/abilities.md](quick-ref/abilities.md) - Ability system, willpower (~100 lines)
- [quick-ref/progression.md](quick-ref/progression.md) - Levels, XP, tiers (~50 lines)
- [quick-ref/storytelling.md](quick-ref/storytelling.md) - Campaign mechanics (~100 lines)
- [quick-ref/ascii-art.md](quick-ref/ascii-art.md) - Scene visualization (~120 lines)
- [quick-ref/multiplayer.md](quick-ref/multiplayer.md) - Trading, parties, guilds, duels (~150 lines)

**Full Rules (Load Only When Needed):**

| Rule File                                    | Load When                                  |
| -------------------------------------------- | ------------------------------------------ |
| [rules/combat.md](rules/combat.md)           | Complex maneuvers, environmental combat    |
| [rules/classes.md](rules/classes.md)         | Leveling up, advanced abilities            |
| [rules/progression.md](rules/progression.md) | XP sources, level thresholds, tier unlocks |
| `worlds/<world>/abilities/index.md`          | Creating abilities, full ability schema    |
| [rules/afflictions.md](rules/afflictions.md) | Status effects, conditions                 |
| [rules/creation.md](rules/creation.md)       | Content templates, quality guidelines      |
| [rules/narrative.md](rules/narrative.md)     | Campaigns, consequences, relationships     |
| [rules/multiplayer.md](rules/multiplayer.md) | Trading, parties, guilds, duels            |

**Strategy:** Start with quick-ref. Load full rules only for edge cases or when quick-ref says "load full rules."

---

## Reference Files (Load When Needed)

| File                                                                         | Load When                               |
| ---------------------------------------------------------------------------- | --------------------------------------- |
| [reference/setup.md](reference/setup.md)                                     | New player, first-time setup            |
| [reference/alignment.md](reference/alignment.md)                             | Alignment choices, breaking character   |
| [reference/todos.md](reference/todos.md)                                     | Managing player intentions              |
| [reference/tone-guide.md](reference/tone-guide.md)                           | Maturity levels, voice, emotional beats |
| [reference/storytelling-techniques.md](reference/storytelling-techniques.md) | Foreshadowing, reveals, pacing          |
| [reference/ascii-visualizer.md](reference/ascii-visualizer.md)               | Detailed ASCII patterns and techniques  |

---

## Quick Reference

**Alignment Costs:** Breaking character costs willpower. See [reference/alignment.md](reference/alignment.md).

**State Changes:** After each action, update persona file if HP/gold/location/inventory changed.

**New Content:** When creating NPCs, locations, items, or factions during play, save them to `worlds/<world>/` so they persist. See "Persisting New Content" above.

---

## Templates (Load for Creation)

Templates are organized by category. See [templates/README.md](templates/README.md) for full list.

**Player:**

- [templates/player/persona.yaml](templates/player/persona.yaml) - Character sheet
- [templates/player/quests.yaml](templates/player/quests.yaml) - Active quests
- [templates/player/todo.yaml](templates/player/todo.yaml) - Player intentions

**Content:**

- [templates/content/quest.md](templates/content/quest.md) - Quest structure
- [templates/content/location.md](templates/content/location.md) - World locations
- [templates/content/area.yaml](templates/content/area.yaml) - Areas within locations
- [templates/content/creature.yaml](templates/content/creature.yaml) - Enemies/creatures
- [templates/content/shop.yaml](templates/content/shop.yaml) - Shop inventories

**Narrative:**

- [templates/narrative/campaign.yaml](templates/narrative/campaign.yaml) - Multi-quest story arcs
- [templates/narrative/chapter.yaml](templates/narrative/chapter.yaml) - Individual narrative beats
- [templates/narrative/scene.yaml](templates/narrative/scene.yaml) - Granular encounter structure
- [templates/narrative/consequence-tracker.yaml](templates/narrative/consequence-tracker.yaml) - Decision ripple system
- [templates/narrative/relationships.yaml](templates/narrative/relationships.yaml) - NPC standings and dialogue
- [templates/narrative/campaign-progress.yaml](templates/narrative/campaign-progress.yaml) - Per-character campaign state
- [templates/narrative/dream-pattern.yaml](templates/narrative/dream-pattern.yaml) - Autopilot/Dreaming configuration

**Multiplayer:**

- [templates/multiplayer/trade.yaml](templates/multiplayer/trade.yaml) - Player-to-player trades
- [templates/multiplayer/escrow.yaml](templates/multiplayer/escrow.yaml) - Locked items/gold ledger
- [templates/multiplayer/party.yaml](templates/multiplayer/party.yaml) - Party structure
- [templates/multiplayer/party-membership.yaml](templates/multiplayer/party-membership.yaml) - Character party link
- [templates/multiplayer/party-invite.yaml](templates/multiplayer/party-invite.yaml) - Party invitations
- [templates/multiplayer/party-encounter.yaml](templates/multiplayer/party-encounter.yaml) - Shared combat
- [templates/multiplayer/mail-message.yaml](templates/multiplayer/mail-message.yaml) - Player messages
- [templates/multiplayer/guild.yaml](templates/multiplayer/guild.yaml) - Guild info
- [templates/multiplayer/guild-roster.yaml](templates/multiplayer/guild-roster.yaml) - Guild membership
- [templates/multiplayer/guild-treasury.yaml](templates/multiplayer/guild-treasury.yaml) - Shared resources
- [templates/multiplayer/duel.yaml](templates/multiplayer/duel.yaml) - PvP combat
- [templates/multiplayer/world-event.yaml](templates/multiplayer/world-event.yaml) - Server-wide events

**Combat:**

- [templates/combat/battle-environment.yaml](templates/combat/battle-environment.yaml) - Combat arenas
- [templates/combat/autopilot-config.yaml](templates/combat/autopilot-config.yaml) - Autopilot preferences

## Campaigns

Available campaigns are found via their individual `worlds/<world>/campaigns/<campaign-id>/campaign.yaml` files. Each campaign has:

```
worlds/<world>/campaigns/<campaign-id>/
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
world: "<world-id>" # Required - e.g., "alpha"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"
session_summary: "<what happened this session>"
```

### What Repo Sync Does

1. **Verifies new content is saved**

   - Checks for NPCs mentioned but not in `worlds/<world>/npcs/profiles/`
   - Checks for locations visited but not in `worlds/<world>/locations/`
   - Checks for items created but not in `worlds/<world>/items/`

2. **Runs validation**

   - `node scripts/validate-multiplayer.js`

3. **Creates branch and commits**

   - Creates `<github>-<character>-<date>` branch
   - Stages appropriate files (never `git add -A`)
   - Commits with session summary + `Co-Authored-By`

4. **Creates PR**

   - Title: `<character>: <session-summary>`
   - Body includes: session events, character status, validation status

5. **Returns PR URL**

### Why Use the Agent Architecture?

- **Automatic delegation** - Claude invokes agents based on context
- **Single point of truth** - `repo-sync` for git, `state-writer` for files
- **Consistent validation** before every commit
- **PR creation guaranteed** - no lost work
- **Multiplayer sync** - fetches/pushes player interactions
- **PR reviews** - Automated reviews of open PRs after session end

### Session End Response

The `repo-sync` agent returns structured data. Present to player:

```
╔════════════════════════════════════════════════════════════╗
║              S E S S I O N   S A V E D                     ║
╠════════════════════════════════════════════════════════════╣
║  Character: Coda                                           ║
║  HP: 35/50  │  Gold: 150                                  ║
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
