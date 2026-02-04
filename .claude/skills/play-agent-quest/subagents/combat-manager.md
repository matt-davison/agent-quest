# Combat Manager Subagent

**Responsibility:** Execute combat mechanics precisely using math.js for all calculations. Returns structured outcomes with narrative hooks for the main agent to weave into story.

## When to Invoke

- Combat encounter begins
- Each combat round resolution
- Combat special abilities (Weave Strike, class abilities)
- Combat conclusion (victory, defeat, flee)

## Input Context

```yaml
operation: "init_combat" | "resolve_round" | "special_action" | "end_combat"
player:
  github: "<github-username>"
  character: "<character-name>"
combatants:
  player:
    name: "<character-name>"
    hp: <current>
    max_hp: <max>
    stats:
      might: <value>
      agility: <value>
      spirit: <value>
      mind: <value>
    defense: <calculated-defense>
    weapon:
      name: "<weapon>"
      damage: "<dice-expression>"  # e.g., "1d8"
      type: "melee" | "ranged" | "magic"
    abilities: [<list-of-available-abilities>]
    tokes_available: <balance>  # For Weave Strike
  enemies:
    - id: "enemy-1"
      name: "<enemy-name>"
      hp: <current>
      max_hp: <max>
      defense: <value>
      attack_bonus: <value>
      damage: "<dice-expression>"
      abilities: [<list>]
terrain:
  type: "<terrain-type>"
  modifiers: [<any-combat-modifiers>]
# For resolve_round:
player_action:
  type: "attack" | "defend" | "ability" | "item" | "flee" | "weave_strike"
  target: "<target-id>"
  ability_name: "<if-using-ability>"
  item_id: "<if-using-item>"
# For end_combat:
outcome: "victory" | "defeat" | "fled"
```

## Operations

### INIT_COMBAT - Roll Initiative, Setup

```bash
# Roll initiative for all combatants
# Player: 1d20 + agility modifier
node .claude/skills/math/math.js roll "1d20+${(agility-10)/2}"

# Each enemy
node .claude/skills/math/math.js roll "1d20+${enemy_init_mod}"
```

**Init Response:**

```yaml
success: true
operation: "init_combat"
initiative_order:
  - id: "player"
    name: "Coda"
    roll: 18
    total: 21
  - id: "enemy-1"
    name: "Shadow Stalker"
    roll: 12
    total: 14
  - id: "enemy-2"
    name: "Shadow Minion"
    roll: 8
    total: 9
combat_state:
  round: 1
  current_turn: "player"
terrain_effects:
  - "Dim lighting: -2 to ranged attacks"
narrative_hooks:
  - "Initiative seized - you act first"
  - "Two shadows materialize from the darkness"
  - "The dim warehouse lighting favors melee"
```

### RESOLVE_ROUND - Process Combat Turn

#### Attack Resolution

```bash
# 1. Calculate attack modifier
# Melee: (might - 10) / 2
# Ranged: (agility - 10) / 2
# Magic: (spirit - 10) / 2
node .claude/skills/math/math.js calc "(${stat} - 10) / 2"

# 2. Roll attack
node .claude/skills/math/math.js roll "1d20+${modifier}"

# 3. Compare to target defense
# Hit if roll >= defense

# 4. If hit, roll damage
node .claude/skills/math/math.js roll "${weapon_damage}+${stat_mod}"

# 5. Check for critical (hit by 5+ or natural 20)
# Critical: double damage dice
node .claude/skills/math/math.js roll "2${weapon_damage}+${stat_mod}"

# Natural 20: max damage + roll again
```

**Attack Resolution Response:**

```yaml
success: true
operation: "resolve_round"
round: 2
actor: "player"
action:
  type: "attack"
  target: "enemy-1"
resolution:
  attack_roll: 17
  attack_total: 21  # With modifier
  target_defense: 14
  hit: true
  critical: true  # Hit by 7
  damage_roll: "2d8+3"
  damage_total: 15
  target_hp_before: 30
  target_hp_after: 15
state_diffs:
  enemies:
    - id: "enemy-1"
      hp: 15
enemy_actions:
  - actor: "enemy-1"
    action: "attack"
    target: "player"
    attack_total: 12
    hit: false
    narrative: "The Shadow Stalker's claws swipe through empty air"
  - actor: "enemy-2"
    action: "attack"
    target: "player"
    attack_total: 16
    damage: 6
    hit: true
    narrative: "The minion's blade finds a gap in your guard"
state_diffs_from_enemies:
  player:
    hp: 39  # Was 45, took 6 damage
combat_state:
  round: 3
  current_turn: "player"
  player_hp: 39
  enemies_remaining: 2
narrative_hooks:
  - "Critical hit! Your blade bites deep into shadow-stuff"
  - "The creature recoils, ichor dripping from the wound"
  - "Its counterattack misses as you twist aside"
  - "But the minion's blade catches you - 6 damage"
```

#### Defend Action

```yaml
action:
  type: "defend"
resolution:
  defense_bonus: 2
  duration: "until_next_turn"
narrative_hooks:
  - "You raise your guard, bracing for impact"
  - "+2 Defense until your next turn"
```

#### Weave Strike (5 Tokes)

```yaml
action:
  type: "weave_strike"
  target: "enemy-1"
resolution:
  tokes_spent: 5
  damage: 30  # Guaranteed
  target_hp_before: 15
  target_hp_after: -15  # Dead
  target_killed: true
state_diffs:
  player_tokes: -5
  enemies:
    - id: "enemy-1"
      status: "dead"
narrative_hooks:
  - "Reality bends to your will - 5 Tokes burn"
  - "The Weave itself strikes, guaranteed 30 damage"
  - "The Shadow Stalker unravels into nothingness"
```

#### Flee Attempt

```bash
# Flee check: 1d20 + agility mod vs 10 + enemy count
node .claude/skills/math/math.js roll "1d20+${agility_mod}"
```

```yaml
action:
  type: "flee"
resolution:
  flee_roll: 14
  flee_total: 17
  dc: 12  # 10 + 2 enemies
  success: true
  opportunity_attacks: []  # If failed, enemies get attacks
narrative_hooks:
  - "You disengage and break for the exit"
  - "The shadows hiss but cannot catch you"
```

### SPECIAL_ACTION - Class Abilities

Load ability details from `rules/spells-and-abilities.md` and resolve:

```yaml
action:
  type: "ability"
  ability_name: "Shadow Step"
resolution:
  cost: "1 spirit point"
  effect: "Teleport up to 30 feet to a shadow"
  attack_bonus: 2  # From flanking after teleport
narrative_hooks:
  - "You melt into shadow and reform behind your foe"
  - "+2 to your next attack from superior positioning"
```

### END_COMBAT - Wrap Up

```yaml
operation: "end_combat"
outcome: "victory"
resolution:
  rounds_taken: 4
  enemies_defeated:
    - name: "Shadow Stalker"
      xp: 50
    - name: "Shadow Minion"
      xp: 25
  total_xp: 75
  loot:
    - id: "shadow-essence"
      name: "Shadow Essence"
      quantity: 1
    - gold: 30
player_final_state:
  hp: 32
  max_hp: 50
  tokes_spent: 5
  resources_used:
    - "1 healing potion"
state_diffs:
  player:
    hp: 32
    xp: "+75"
    inventory:
      add:
        - id: "shadow-essence"
          quantity: 1
    gold: "+30"
narrative_hooks:
  - "Victory! The shadows disperse"
  - "75 XP earned from the encounter"
  - "Among the remains: Shadow Essence and 30 gold"
  - "You're wounded but alive - 32/50 HP"
```

## Combat Rules Reference

### Defense Calculation
```
Defense = 10 + (Agility - 10) / 2 + Armor Bonus
```

### Hit Results
| Roll | Result |
|------|--------|
| < Defense | Miss |
| >= Defense | Hit |
| >= Defense + 5 | Critical (2x damage dice) |
| Natural 20 | Max damage + roll again |
| Natural 1 | Miss + disadvantage next turn |

### Damage Modifiers
| Weapon Type | Stat |
|-------------|------|
| Melee | Might |
| Ranged | Agility |
| Magic | Spirit |

### Common Weapons
| Weapon | Damage |
|--------|--------|
| Dagger | 1d4 |
| Sword | 1d8 |
| Greatsword | 2d6 |
| Bow | 1d8 |
| Staff | 1d6 |

## State Diffs Format

Combat Manager returns state changes for State Writer:

```yaml
state_diffs:
  player:
    hp: <new-value>
    xp: "+<amount>"  # Additive
    gold: "+<amount>"
    inventory:
      add:
        - id: "<item>"
          quantity: <n>
      remove:
        - id: "<item>"
          quantity: <n>
    tokes: -5  # If Weave Strike used
  enemies:
    - id: "<enemy-id>"
      hp: <new-value>
      status: "dead" | "fled" | "active"
```

## Error Handling

```yaml
success: false
errors:
  - code: "INVALID_TARGET"
    message: "Target enemy-3 does not exist"
  - code: "INSUFFICIENT_TOKES"
    message: "Weave Strike requires 5 Tokes, you have 3"
  - code: "ABILITY_ON_COOLDOWN"
    message: "Shadow Step cannot be used again this combat"
```

## Loading Additional Rules

When needed, load:
- `rules/combat.md` - Complex maneuvers, environmental combat
- `rules/afflictions.md` - Status effects, conditions
- `rules/spells-and-abilities.md` - Spell/ability details
- `rules/enemy-tactics.md` - Enemy AI patterns
