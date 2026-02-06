# First-Time Setup

## Step 1: Create Player File

```yaml
# Save as: players/<github-username>/player.yaml
github: "<github-username>"
joined: "YYYY-MM-DD"
active_character: "<character-name>" # lowercase, no spaces
```

## Step 2: Create Persona

```yaml
# Save as: players/<github-username>/personas/<character-name>/persona.yaml
name: ""
class: "" # Codebreaker, Loresmith, Voidwalker, or Datamancer
active: true
backstory: "" # 2-3 sentences

stats:
  strength: 10
  agility: 10
  mind: 10
  spirit: 10
  # 10 bonus points to distribute

resources:
  hp: 100
  max_hp: 100
  gold: 50

abilities: []
inventory: []
equipped: {}
location: "nexus-station"
chronicle: []
decisions: []

alignment:
  primary: "neutral"
  secondary: null
  axes:
    empathy: 0
    order: 0
    risk: 0
```

## Step 3: Create Quest Tracker

```yaml
# Save as: players/<github-username>/personas/<character-name>/quests.yaml
active_quests: []
completed_quests: []
quest_log: []
```

## Step 4: Choose Class

| Class | Role | Stat Bonus | Unique Strength |
|-------|------|------------|-----------------|
| **Codebreaker** | Frontline combatant | +3 STR, +2 AGI, 120 HP | Shatter barriers, Momentum stacking |
| **Loresmith** | Scholar diplomat | +3 MND, +2 SPI, +50 Gold | Silver Tongue, Recall secrets |
| **Voidwalker** | Stealth infiltrator | +3 AGI, +2 MND, +5 slots | Phase through walls, Backstab |
| **Datamancer** | Reality weaver | +3 SPI, +2 MND, +20% willpower recovery | Manifest items, Reality Patch |

See [rules/classes.md](../rules/classes.md) for full details.

## Step 5: Register

1. Add to `players/registry.md`:
   ```
   | github-username | character-name | Class | YYYY-MM-DD | Active |
   ```


## Step 6: Read the Lore

Read `world/lore/genesis.md` to understand the world.

---

# Load Game Procedure

When resuming an existing player:

1. **Authenticate & identify**:
   - Try: `gh api user -q '.login'`
   - If not authenticated, guide user through `gh auth login`
   - See main [SKILL.md](../SKILL.md) Session Start section for full authentication flow
2. **Read player file**: `players/<github-username>/player.yaml` → get `active_character`
3. **Read persona**: `players/<github-username>/personas/<active_character>/persona.yaml`
4. **Read quests**: `players/<github-username>/personas/<active_character>/quests.yaml`
5. **Read location**: `world/locations/<location>/README.md`
6. **Display resume screen** and ask what they'd like to do
