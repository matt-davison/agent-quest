# World Settings Reference

Comprehensive guide for configuring and enforcing world behavior in Agent Quest.

## Overview

World settings control fundamental gameplay modes and restrictions. They are defined in `worlds/<world>/world.yaml` and must be loaded at session start.

```yaml
# worlds/alpha/world.yaml
settings:
  starting_location: "nexus-station"
  starting_gold: 0
  level_cap: 10
  pvp_enabled: true
  user_generation: disabled  # KEY SETTING
```

## user_generation Setting

Controls whether players can author world content or are restricted to performing actions within an AI-controlled world.

### Values

- **`enabled` (default)**: Collaborative world-building mode
- **`disabled`**: DM-controlled traditional RPG mode

### Philosophy

| Mode | Philosophy | Player Role | AI Role |
|------|-----------|-------------|---------|
| **enabled** | Collaborative storytelling | Co-author the world | Validate and weave in suggestions |
| **disabled** | Traditional RPG | Perform actions, make decisions | Control what exists in the world |

## Behavior Comparison

### When `user_generation: enabled` (Collaborative)

**Players CAN:**
- Suggest new locations ("I go to the Crystal Tavern")
- Describe what they encounter ("There's a friendly merchant")
- Propose how the world works ("The guards here are corrupt")
- Create content that fits the world theme
- Weave Mend to restore corrupted data

**AI SHOULD:**
- Accept reasonable player suggestions
- Validate suggestions fit world theme and tone
- Incorporate player-described content if appropriate
- Persist player-created content to files
- Reject suggestions that break lore or balance

**Example:**
```
Player: "I go to the Crystal Tavern in the market district."

AI: "You push through the crowds toward the Crystal Tavern.
     The sign above the door shows a glass chalice wreathed
     in blue flames. Inside, merchants and traders gather..."

     [Creates worlds/alpha/locations/nexus-station/crystal-tavern.yaml]
```

### When `user_generation: disabled` (DM-Controlled)

**Players CAN:**
- Perform any action within the established world
- Make decisions and choices
- Attempt creative solutions to problems
- Use Weave Mending (mechanical system with checks/costs)
- Explore, fight, talk, trade, quest

**Players CANNOT:**
- Dictate what locations exist
- Describe new NPCs into being
- Declare how the world works
- Create lore or world facts
- Author content directly

**AI SHOULD:**
- Generate all world content organically
- Decide what exists based on world logic
- Create NPCs, locations, events as needed for gameplay
- Politely redirect player content suggestions
- Enforce through natural world responses (no meta-text)

**Example:**
```
Player: "I go to the Crystal Tavern in the market district."

AI: "You don't know of any Crystal Tavern in this area.
     The taverns you're aware of in the market district are:
     - The Rusty Gear Inn (moderate prices)
     - The Undercity Entrance (seedy, cheap drinks)
     - The Merchant's Rest (upscale)

     Where would you like to go?"
```

## Response Patterns

### Content Suggestions (disabled mode)

| Player Input | Natural Response |
|--------------|------------------|
| "I go to the Crystal Tavern" | "You don't know of any Crystal Tavern in this area. The locations you're aware of are [list]. Where would you like to go?" |
| "I meet a friendly merchant named Bob" | "As you walk through the market district, you notice a merchant hawking wares - a grizzled dwarf with calculating eyes. [AI generates merchant]" |
| "I look for a secret passage" | *Rolls Perception* "You search the walls carefully... [AI decides if passage exists]" |
| "The guards here are corrupt" | "You study the guards. [AI describes what's actually true]" |
| "I want to find a tavern" | "You look around for a place to rest. [AI generates tavern if logical, or indicates none exists]" |

### Creative Solutions (both modes)

Both modes support creative problem-solving:

```
Player: "I use the hanging chandelier to swing over the guards"

AI (any mode): *Rolls Acrobatics DC 14*
"You grab the chandelier and swing... [resolves based on roll]"
```

The difference:
- **enabled**: Player might suggest the chandelier exists
- **disabled**: AI decides if a chandelier is present when player looks around

## Edge Cases

### Weave Mending

**Works in BOTH modes** because:
- It's a mechanical system with skill checks and costs
- It restores existing gaps, not freeform creation
- The AI controls what gaps exist and what Mending reveals
- Player triggers discovery, AI generates the actual content

```yaml
# weave-mending.yaml integration note
integration:
  user_generation_compatibility: |
    Weave Mending works regardless of user_generation setting because:
    - It's a mechanical system with skill checks and costs
    - It restores existing gaps, not freeform creation
    - The AI controls what gaps exist and what Mending reveals
```

### Crafting

**When disabled:**
- Follow established recipes
- Can't invent new recipes
- AI determines what's craftable

**When enabled:**
- Can propose new recipes
- AI validates if reasonable

### Autopilot / Dreaming

**Both modes:** Works identically
- AI-controlled gameplay
- Not player-authored content
- AI generates story and encounters

### Multiplayer

**Both modes:** Core features work the same
- Trading, mail, parties function normally
- Guild creation may require AI approval when disabled

### Quest Rewards

**Both modes:** AI-determined
- Based on quest difficulty
- Consistent with world balance

### Housing & Politics

**When disabled:**
- Can own homes (established system)
- Can participate in politics (mechanical votes)
- Cannot declare political changes without in-game actions

**When enabled:**
- Can suggest political scenarios
- Can propose new political factions

## Implementation Checklist

At session start:

- [ ] Load `worlds/<world>/world.yaml`
- [ ] Extract `settings.user_generation` (default: `enabled`)
- [ ] Store in session context for quick checks
- [ ] Display mode on resume screen

During gameplay:

- [ ] When player suggests new content → check setting
- [ ] If disabled → redirect with natural world response
- [ ] If enabled → validate and incorporate if reasonable
- [ ] For actions → resolve with skill checks regardless of mode
- [ ] For Weave Mending → allow in both modes

When persisting content:

- [ ] If disabled → only AI-generated content persists
- [ ] If enabled → player suggestions can persist if validated
- [ ] Always update appropriate world files

## Resume Screen Indicator

Add world mode to resume screen:

```
╔════════════════════════════════════════════════════════════╗
║           W E L C O M E   B A C K ,  Coda                  ║
║                     Shadowmancer                           ║
╠════════════════════════════════════════════════════════════╣
║  World Mode: DM-Controlled                                 ║  <-- NEW
║  HP: 35/50  │  Gold: 150  │  WP: 18/20                     ║
║  Location: Nexus Undercity                                 ║
...
```

Shows:
- **"DM-Controlled"** when `user_generation: disabled`
- **"Collaborative"** when `user_generation: enabled`

## Visibility Strategy

**No meta-text during gameplay.** Enforce through natural world responses:

```
❌ Bad (meta): "Sorry, user_generation is disabled, so I can't let you create that tavern."

✅ Good (natural): "You don't know of any Crystal Tavern in this area. Where would you like to go?"
```

Players experience it as a traditional RPG where:
- The DM controls what exists
- Players describe their actions
- The world responds organically

## Other World Settings

### level_cap

Maximum character level (default: 10)

```yaml
level_cap: 10
```

Enforced during XP awards and level-up.

### pvp_enabled

Whether player-vs-player combat is allowed

```yaml
pvp_enabled: true
```

Controls availability of DUEL action.

### starting_location

Where new characters begin

```yaml
starting_location: "nexus-station"
```

Used during character creation.

### starting_gold

Initial gold for new characters

```yaml
starting_gold: 0
```

Used during character creation.

## Migration & Compatibility

**Default behavior:** If `user_generation` is not specified, defaults to `enabled` (collaborative mode).

```yaml
# Worlds without the setting
settings:
  level_cap: 10
  # user_generation: enabled (implicit default)
```

**No breaking changes:**
- Existing worlds continue working as before
- Worlds can explicitly set the mode
- Setting is purely additive

## Testing Scenarios

### Scenario 1: Setting Detection

1. Start session
2. Verify world.yaml is loaded
3. Check resume screen shows correct mode

### Scenario 2: Disabled Mode

1. Start session in world with `user_generation: disabled`
2. Player suggests non-existent location → AI redirects
3. Player says "I meet [new NPC]" → AI introduces its own NPC
4. Weave Mending still works
5. AI generates content organically for quests

### Scenario 3: Enabled Mode

1. Start session in world with `user_generation: enabled` (or unset)
2. Player suggestions are incorporated
3. Collaborative world-building works as before

### Scenario 4: Edge Cases

1. Test crafting in both modes
2. Test Weave Mending in both modes
3. Test autopilot in both modes
4. Test multiplayer features in both modes

## Alpha World Configuration

The alpha world uses:

```yaml
user_generation: disabled
```

This creates a traditional RPG experience where:
- Claude controls all world content
- Players perform actions and make decisions
- World feels cohesive and intentionally designed
- Perfect for players who want a curated story experience

## Summary

| Setting | Player Role | AI Role | Content Creation |
|---------|-------------|---------|------------------|
| **enabled** | Co-author | Validator & Weaver | Player suggests, AI validates |
| **disabled** | Adventurer | Storyteller & DM | AI generates all content |

**Key Principle:** Both modes support creative gameplay and problem-solving. The difference is who controls what exists in the world.
