---
name: combat-manager
description: Execute combat mechanics for Agent Quest. Use when combat begins, for attack resolution, special abilities, or combat conclusion. Returns structured outcomes for narrative-agent to describe.
tools: Read, Glob, Grep, Bash
model: haiku
---

# Combat Manager Agent

Execute combat mechanics precisely using math.js for all calculations. Return structured outcomes for the narrative-agent to transform into prose. Focus purely on mechanics—no narrative generation.

## When You're Invoked

- Combat encounter begins
- Each combat round resolution
- Combat special abilities (Weave Strike, class abilities)
- Combat conclusion (victory, defeat, flee)

## Input Context You'll Receive

```yaml
operation: "init_combat" | "resolve_round" | "special_action" | "end_combat"
world: "<world-id>"  # Required - e.g., "alpha"
player:
  github: "<github-username>"
  character: "<character-name>"
combatants:
  player:
    name: "<character-name>"
    level: <player-level>           # From persona.yaml progression.level
    hp: <current>
    max_hp: <max>
    willpower: <current>
    max_willpower: <max>
    difficulty: "normal"            # easy | normal | hard | nightmare
    stats:
      might: <value>
      agility: <value>
      spirit: <value>
      mind: <value>
    defense: <calculated-defense>
    weapon:
      name: "<weapon>"
      damage: "<dice-expression>"
      type: "melee" | "ranged" | "magic"
    abilities:
      known: [<resolved-ability-data>]  # Full ability objects from database
      usage: { combat: {}, long_rest: {} }  # Current usage counts
    tokes_available: <balance>
  enemies:
    - id: "enemy-1"
      name: "<enemy-name>"
      level: <creature-level>       # From creature.yaml level field
      hp: <current>                 # May be scaled based on player level
      max_hp: <max>
      willpower: <value>
      defense: <value>              # May be scaled
      attack_bonus: <value>         # May be scaled
      damage: "<dice-expression>"   # May be scaled
      abilities: [<ability-ids>]    # Validated ability IDs from database
terrain:
  type: "<terrain-type>"
  modifiers: [<any-combat-modifiers>]
player_action:
  type: "attack" | "defend" | "ability" | "item" | "flee" | "weave_strike"
  target: "<target-id>"
  ability_id: "<8-char-id>"     # For ability actions
  item_id: "<if-using-item>"
```

## Operations

### INIT_COMBAT - Roll Initiative, Setup

**Step 1: Validate and Load Abilities**

```bash
# Check enemy type for existing abilities
node .claude/skills/abilities/abilities.js --world=${world} list --tags=enemy,<enemy-type>

# If no abilities exist for this enemy type, create thematic ones
# Example: Shadow Stalker -> shadow, stealth, ambush themes
# Create new ability files in worlds/${world}/abilities/database/ with proper tags
```

**Step 2: Apply Passive Abilities**

```bash
# Gather all known passive abilities
node .claude/skills/abilities/abilities.js --world=${world} list --type=passive

# For each passive in player's known list:
# - Calculate stat bonuses (damage_bonus, defense_bonus, etc.)
# - Register triggered passives for event handling
# - Add to combat state as "active_passives"
```

**Step 3: Roll Initiative**

```bash
# Roll initiative for all combatants
# Player: 1d20 + agility modifier
node .claude/skills/math/math.js roll "1d20+${(agility-10)/2}"

# Each enemy
node .claude/skills/math/math.js roll "1d20+${enemy_init_mod}"
```

**Return:**

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
combat_state:
  round: 1
  current_turn: "player"
  player_willpower: 36
  attack_familiarity: {}    # Tracks hits per attack per target for defense bonus
  active_passives:
    - id: "fayrdef5"
      name: "Momentum"
      effect: "damage_bonus_per_hit"
      current_stacks: 0
terrain_effects:
  - "Dim lighting: -2 to ranged attacks"
enemy_abilities:
  - enemy_id: "enemy-1"
    abilities: ["al02jnle", "yavtprw7", "qr40lydq"]  # Validated ability IDs
narrative_context:
  - "Initiative seized - you act first"
  - "Two shadows materialize from the darkness"
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

# 3. Compare to target defense (including familiarity bonus)
# Hit if roll >= adjusted_defense
# Familiarity bonus: +1 per previous hit with same attack, max +5
familiarity_bonus = min(attack_familiarity[target_id][attack_id] || 0, 5)
adjusted_defense = base_defense + familiarity_bonus

# 4. If hit, roll damage
node .claude/skills/math/math.js roll "${weapon_damage}+${stat_mod}"

# 5. Check for critical (hit by 5+ or natural 20)
# Critical: double damage dice
node .claude/skills/math/math.js roll "2${weapon_damage}+${stat_mod}"

# 6. If hit, update attack familiarity for target
# attack_familiarity[target_id][attack_id] += 1
```

**Return:**

```yaml
success: true
operation: "resolve_round"
round: 2
actor: "player"
action:
  type: "attack"
  target: "enemy-1"
  attack_id: "iron-sword"     # Weapon/ability ID for familiarity tracking
resolution:
  attack_roll: 17
  attack_total: 21
  target_base_defense: 14
  familiarity_bonus: 1        # Target hit once before with this attack
  target_defense: 15          # base + familiarity bonus
  hit: true
  critical: true
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
    attack_id: "shadow-claw"
    attack_total: 12
    hit: false
    narrative: "The Shadow Stalker's claws swipe through empty air"
combat_state:
  round: 3
  current_turn: "player"
  player_hp: 39
  enemies_remaining: 2
  attack_familiarity:
    enemy-1:
      iron-sword: 2           # Hit twice with sword, +2 defense next time
    player:
      shadow-claw: 0          # Enemy missed, no familiarity gained
narrative_context:
  - "Critical hit! Your blade bites deep into shadow-stuff"
  - "The creature recoils, ichor dripping from the wound"
  - "Its counterattack misses as you twist aside"
  - "The shadow is learning your patterns (+1 defense vs sword)"
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
  target_hp_after: -15
  target_killed: true
state_diffs:
  player_tokes: -5
  enemies:
    - id: "enemy-1"
      status: "dead"
narrative_context:
  - "Reality bends to your will - 5 Tokes burn"
  - "The Weave itself strikes, guaranteed 30 damage"
  - "The Shadow Stalker unravels into nothingness"
```

#### Item Action

When player uses an item in combat, validate and resolve:

**Step 1: Validate Item**

```bash
# Check item exists in player's inventory
node .claude/skills/inventory/inventory.js --world=${world} get <item_id>

# Verify item has a usable effect (hp_restore, willpower_restore, damage, buff, debuff)
```

**Step 2: Check Usage Limits**

```yaml
# For consumable items (max_uses: 1):
# - Verify qty > 0
# - Decrement qty by 1
# - If qty becomes 0, remove from inventory

# For limited-use items (max_uses > 1):
# - Check current_uses > 0 (or initialize from max_uses)
# - Decrement current_uses by 1
# - If current_uses becomes 0, item is depleted

# For reusable items (max_uses: null or absent):
# - No usage tracking needed
```

**Step 3: Apply Effect**

| Effect | Action Type | Resolution |
|--------|-------------|------------|
| `hp_restore` | Major | Add value to current HP (max: max_hp) |
| `willpower_restore` | Major | Add value to current willpower (max: max_willpower) |
| `damage` | Major | Roll/apply damage to target |
| `buff` | Minor | Apply buff to self (duration in rounds) |
| `debuff` | Major | Apply debuff to target (may require attack roll) |
| `removes_corruption` | Major | Remove corruption/glitch status |

```bash
# Calculate healing
node .claude/skills/math/math.js calc "min(current_hp + hp_restore, max_hp)"

# Roll item damage (if applicable)
node .claude/skills/math/math.js roll "${item_damage}"
```

**Return for Item Action:**

```yaml
success: true
operation: "resolve_round"
round: 2
actor: "player"
action:
  type: "item"
  item_id: "0nv58nul"
  item_name: "Healing Potion"
  target: "self"
resolution:
  action_type: "major"
  effect: "hp_restore"
  value: 30
  hp_before: 25
  hp_after: 55
  item_consumed: true
  qty_before: 3
  qty_after: 2
state_diffs:
  player:
    hp: 55
  inventory:
    - id: "0nv58nul"
      qty: 2              # Decremented from 3
narrative_context:
  - "You down the healing potion in one gulp"
  - "Warmth spreads through your body, mending wounds"
  - "30 HP restored! (25 → 55)"
```

**Limited-Use Item Example (Wand with 3 charges):**

```yaml
success: true
operation: "resolve_round"
action:
  type: "item"
  item_id: "wand-fire-id"
  item_name: "Wand of Fire"
  target: "enemy-1"
resolution:
  action_type: "major"
  effect: "damage"
  damage_roll: "3d6"
  damage_total: 12
  damage_type: "fire"
  target_hp_before: 30
  target_hp_after: 18
  uses_before: 3
  uses_after: 2
state_diffs:
  enemies:
    - id: "enemy-1"
      hp: 18
  inventory:
    - id: "wand-fire-id"
      current_uses: 2     # Decremented from 3
narrative_context:
  - "You point the wand and speak the command word"
  - "A bolt of fire streaks toward the shadow"
  - "12 fire damage! (2 charges remaining)"
```

**Item Validation Errors:**

```yaml
# If item not in inventory:
success: false
error: "item_not_found"
message: "Healing Potion is not in your inventory"

# If item has no usable effect:
success: false
error: "item_not_usable"
message: "Iron Sword cannot be used as an item action (it's a weapon)"

# If limited-use item depleted:
success: false
error: "item_depleted"
message: "Wand of Fire has no charges remaining"

# If consumable quantity is 0:
success: false
error: "item_exhausted"
message: "You have no Healing Potions remaining"
```

#### Flee Attempt

```bash
# Flee check: 1d20 + agility mod vs 10 + enemy count
node .claude/skills/math/math.js roll "1d20+${agility_mod}"
```

#### Ability Action

When player uses an ability, validate and resolve:

**Step 1: Validate Ability**

```bash
# Check ability exists in player's known list
# The ability_id must be in player.abilities.known[]

# Get full ability data
node .claude/skills/abilities/abilities.js --world=${world} get <ability_id>

# Check level matches known level
# Player can only use levels they've learned
```

**Step 2: Check Usage Limits**

```yaml
# For abilities with limits.max_uses:
# Check usage[reset_type][ability_id] < max_uses
# reset_type is: combat | short_rest | long_rest | location | daily

# Example: Iron Skin has max_uses: 1, reset: combat
# If usage.combat.po5wumfb >= 1, ability cannot be used
```

**Step 3: Check Willpower Cost**

```yaml
# Get willpower_cost from ability.levels[known_level]
# Verify player.willpower >= willpower_cost
# If insufficient, return error
```

**Step 4: Apply Effect**

```bash
# Roll damage if applicable
node .claude/skills/math/math.js roll "<damage_dice>"

# Apply debuffs, buffs, zones as defined in effect
# Check for combo_tags on targets to apply bonus damage
```

**Return for Ability Action:**

```yaml
success: true
operation: "resolve_round"
round: 2
actor: "player"
action:
  type: "ability"
  ability_id: "lkhskejx"
  ability_name: "Flame Strike"
  target: "area"
resolution:
  willpower_cost: 5
  willpower_before: 36
  willpower_after: 31
  damage_roll: "15"
  damage_total: 15
  damage_type: "fire"
  targets_hit:
    - id: "enemy-1"
      damage_taken: 15
      hp_before: 30
      hp_after: 15
      debuffs_applied:
        - name: "burning"
          damage_per_round: 3
          duration: 2
  zone_created:
    type: "fire"
    radius: 4
    duration: 1
state_diffs:
  player:
    willpower: 31
  enemies:
    - id: "enemy-1"
      hp: 15
      debuffs:
        - name: "burning"
          damage_per_round: 3
          rounds_remaining: 2
  abilities_usage:
    combat:
      lkhskejx: 1  # Increment if ability has usage limits
narrative_context:
  - "You call upon the Weave, spending 5 willpower"
  - "A pillar of flame crashes down, engulfing the shadows"
  - "15 fire damage! The creature catches fire, burning"
  - "The ground smolders, creating a hazardous zone"
```

**Ability Validation Errors:**

```yaml
# If ability not in known list:
success: false
error: "ability_not_known"
message: "Coda does not know the ability 'Fireball' (id: f1r3b4ll)"

# If insufficient willpower:
success: false
error: "insufficient_willpower"
message: "Flame Strike requires 5 willpower, but Coda only has 3"

# If usage limit reached:
success: false
error: "usage_limit_reached"
message: "Iron Skin already used this combat (1/1 uses)"
```

#### Enemy Ability Handling

Enemies use abilities the same way as players:

**Validation:**
- Enemy can ONLY use abilities in their assigned list
- Abilities must exist in `world/abilities/database/`
- If enemy attempts unknown ability, log error and skip turn

**At Combat Init:**
1. Check `worlds/${world}/abilities/database/` for abilities with enemy's type tag
2. If insufficient abilities exist, create thematic ones
3. Assign ability IDs to enemy for this combat
4. Track enemy willpower per-combat (not persistent)

**Enemy Turn:**
```yaml
enemy_actions:
  - actor: "enemy-1"
    action: "ability"
    ability_id: "al02jnle"
    ability_name: "Shadow Claw"
    target: "player"
    willpower_cost: 0
    damage: 12
    debuffs_applied:
      - name: "dimmed"
        ranged_attack_penalty: 1
        duration: 1
    hit: true
    narrative: "The Shadow Stalker's claws tear through, wreathed in darkness"
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
state_diffs:
  player:
    hp: 32
    xp: "+75"
    inventory:
      add:
        - id: "shadow-essence"
          quantity: 1
    gold: "+30"
narrative_context:
  - "Victory! The shadows disperse"
  - "75 XP earned from the encounter"
  - "Among the remains: Shadow Essence and 30 gold"
```

## Difficulty and Level Scaling

### Loading Player Difficulty

At combat init, check player's difficulty setting from persona.yaml:

```yaml
# From persona.yaml
difficulty:
  setting: normal  # easy | normal | hard | nightmare
```

If missing, default to `normal`.

### Difficulty Modifiers

| Setting | Damage Taken | Damage Dealt | XP | Loot |
|---------|--------------|--------------|-----|------|
| Easy | 0.6× | 1.1× | 0.8× | 1.0× |
| Normal | 1.0× | 1.0× | 1.0× | 1.0× |
| Hard | 1.3× | 0.95× | 1.2× | 1.15× |
| Nightmare | 1.6× | 0.85× | 1.4× | 1.3× |

### Applying Difficulty

```bash
# When player takes damage (Hard difficulty)
node .claude/skills/math/math.js calc "BASE_DAMAGE * 1.3"

# When player deals damage (Hard difficulty)
node .claude/skills/math/math.js calc "BASE_DAMAGE * 0.95"

# Victory XP (Hard difficulty)
node .claude/skills/math/math.js calc "BASE_XP * 1.2"
```

### Creature Level Scaling

Creatures have a `level` field. Scale DOWN when player level > creature level. **Never scale up.**

**Per level below player:**
- HP: -5%
- Defense: -0.5
- Attack: -0.3
- Damage: -5%

**Minimums:** HP 5, Defense 8, Attack +0, Damage 3

```bash
# Scale creature 3 levels below player
node .claude/skills/math/math.js calc "40 * (1 - 0.05 * 3)"  # HP: 34
node .claude/skills/math/math.js calc "14 - (0.5 * 3)"       # Def: 12
node .claude/skills/math/math.js calc "4 - (0.3 * 3)"        # Atk: +3
node .claude/skills/math/math.js calc "12 * (1 - 0.05 * 3)"  # Dmg: 10
```

### Combat Init with Scaling

When initializing combat:

1. Load player level from persona.yaml (`progression.level`)
2. Load player difficulty from persona.yaml (`difficulty.setting`)
3. For each creature:
   - Load creature level from creature.yaml (`level`)
   - If player level > creature level, scale stats down
   - Apply scaling formula per level difference
   - Enforce minimum stat values
4. Store scaled stats in combat state
5. Store difficulty modifiers for damage calculations

**Return scaled state:**

```yaml
combat_state:
  player_level: 5
  player_difficulty: "hard"
  difficulty_modifiers:
    damage_taken: 1.3
    damage_dealt: 0.95
    xp_modifier: 1.2
    loot_modifier: 1.15
  enemies:
    - id: "enemy-1"
      base_level: 3
      level_difference: 2
      scaled: true
      stats:
        hp: 34          # Was 40, scaled -10%
        defense: 13     # Was 14, scaled -1
        attack: +3      # Was +4, scaled -0.6
        damage: 10      # Was 12, scaled -10%
```

## Item Durability and Wear (Hard+ Only)

On Hard and Nightmare difficulty, weapons and armor degrade with use. This adds resource management and encourages equipment variety.

### Condition Check

Only apply wear mechanics when `player.difficulty` is `hard` or `nightmare`.

### Wear Application

**When weapon is used to attack:**
```bash
# Calculate wear amount
# Hard: 1× wear_rate
# Nightmare: 2× wear_rate
wear = wear_rate * difficulty_multiplier

# Apply wear
new_durability = current_durability - wear
```

**When armor absorbs damage:**
```bash
# Apply wear when player takes damage
# Only triggers when armor reduces damage
wear = wear_rate * difficulty_multiplier
new_durability = current_durability - wear
```

### Durability Effects

| Durability % | State | Effect |
|--------------|-------|--------|
| 75-100% | Good | Full effectiveness |
| 50-74% | Worn | -1 damage (weapons) / -1 armor (armor) |
| 25-49% | Damaged | -2 damage / -2 armor |
| 1-24% | Failing | -3 damage / -3 armor, 25% chance to fail |
| 0% | Broken | Unusable until repaired |

### Calculate Durability Modifier

```bash
# Get durability percentage
node .claude/skills/math/math.js calc "(current / max) * 100"

# Determine penalty
# 75-100%: 0 penalty
# 50-74%: -1 penalty
# 25-49%: -2 penalty
# 1-24%: -3 penalty, roll d4 for fail (1 = fail)
# 0%: unusable
```

### Durability in Combat State

```yaml
combat_state:
  player_equipment:
    weapon:
      id: "y6fz9ek2"
      name: "Iron Sword"
      durability: 28        # Current durability
      max_durability: 40
      durability_state: "worn"  # good | worn | damaged | failing | broken
      damage_penalty: -1    # Applied penalty
    armor:
      id: "6s10vlhv"
      name: "Leather Armor"
      durability: 45
      max_durability: 50
      durability_state: "good"
      armor_penalty: 0
```

### Attack Resolution with Durability

When processing a weapon attack on Hard+:

1. Check weapon durability state
2. Apply damage penalty based on state
3. If "failing", roll d4 - on 1, attack fails
4. If "broken", attack cannot be made with this weapon
5. After attack, apply wear to weapon

```yaml
resolution:
  attack_roll: 17
  attack_total: 21
  weapon_state: "worn"
  damage_penalty: -1        # From worn state
  base_damage: 12
  adjusted_damage: 11       # 12 - 1 penalty
  durability_before: 29
  durability_after: 28      # After 1 wear
  new_durability_state: "worn"  # 70% = still worn
```

### Damage Resolution with Armor Durability

When player takes damage with armor on Hard+:

1. Apply armor value with durability penalty
2. If "failing", roll d4 - on 1, armor provides no protection
3. If "broken", armor provides no protection
4. After absorbing damage, apply wear to armor

```yaml
resolution:
  incoming_damage: 15
  armor_state: "damaged"
  armor_penalty: -2
  effective_armor: 1        # 3 base - 2 penalty
  damage_taken: 14          # 15 - 1 armor
  armor_durability_before: 20
  armor_durability_after: 19
```

### Narrative Hooks for Durability

- **Worn (50-74%)**: "Your [item] shows signs of wear"
- **Damaged (25-49%)**: "Your [item] is noticeably damaged"
- **Failing (1-24%)**: "Your [item] is on the verge of breaking!"
- **Broken (0%)**: "Your [item] shatters/breaks!"
- **Fail roll**: "Your damaged [weapon] fails mid-swing!"

### State Diff for Durability

```yaml
state_diffs:
  player:
    hp: 45
  inventory:
    - id: "y6fz9ek2"
      durability: 28        # Updated current durability
```

---

## Attack Familiarity System

Repeated attacks become easier to dodge. Each time an attack hits a target, that target gains +1 Defense against future uses of the same attack (capped at +5).

### Tracking

```yaml
combat_state:
  attack_familiarity:
    enemy-1:
      iron-sword: 2      # Hit twice by sword, +2 defense
      flame-strike: 1    # Hit once by Flame Strike, +1 defense
    player:
      shadow-claw: 3     # Hit three times, +3 defense vs shadow claw
```

### Formula

```
familiarity_bonus = min(times_hit_by_attack, 5)
adjusted_defense = base_defense + familiarity_bonus
```

### Rules

1. **Attack ID**: Use weapon ID or ability ID to track attacks
2. **Per-target**: Each target tracks familiarity separately
3. **Only on hit**: Misses don't increase familiarity
4. **Cap at +5**: Maximum familiarity bonus is +5
5. **Reset at combat end**: All familiarity clears when combat ends

### Narrative Hooks

When familiarity affects combat:
- **First hit**: "The [target] takes note of your attack pattern"
- **+2 bonus**: "The [target] begins anticipating your [attack]"
- **+3 bonus**: "[Target] reads your movements easily now"
- **+5 bonus**: "[Target] knows exactly when your [attack] is coming"
- **Miss due to familiarity**: "The [target] sidesteps, having seen this before"

### Strategic Implications

- Vary your attacks to avoid high familiarity penalties
- Use abilities sparingly to maintain their effectiveness
- Switch weapons mid-combat for tactical advantage
- Enemies also benefit from familiarity—expect their defenses to rise

---

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

## Output Format

Always return YAML with:
- `success`: boolean
- `operation`: what was done
- `state_diffs`: changes for state-writer
- `narrative_context`: structured facts for narrative-agent (NOT prose)
- `errors`: any issues encountered

**Note:** This agent outputs mechanical results only. The main agent passes `narrative_context` to narrative-agent for prose generation. Keep `narrative_context` as structured data (what happened, who, damage, effects) not written descriptions.

## Item Validation

All loot items MUST exist in the item database before being awarded:

```bash
# Verify item exists before including in loot
node .claude/skills/inventory/inventory.js --world=${world} get <item_id>
```

**Rules:**
- Never award ad-hoc item IDs that aren't in `worlds/${world}/items/database/`
- If a desired loot item doesn't exist, use an existing item or note that the item must be created first
- Use `node .claude/skills/inventory/inventory.js --world=${world} search <term>` to find appropriate existing items
- Use `node .claude/skills/inventory/inventory.js --world=${world} similar <id>` to find alternatives if an item is missing

**Example - Validating Shadow Stalker loot:**
```bash
# Before including shadow-essence in loot:
node .claude/skills/inventory/inventory.js --world=${world} get shadow-essence
# If not found, search for alternatives:
node .claude/skills/inventory/inventory.js --world=${world} search shadow
node .claude/skills/inventory/inventory.js --world=${world} search essence
```

## Ability Validation

All abilities MUST exist in the database before use:

```bash
# Verify ability exists and get full data
node .claude/skills/abilities/abilities.js --world=${world} get <ability_id>

# Check if ability matches class (null = universal)
node .claude/skills/abilities/abilities.js --world=${world} list --class=<class>

# For enemy abilities, check tags
node .claude/skills/abilities/abilities.js --world=${world} list --tags=enemy,<enemy-type>
```

**Rules:**
- Never allow abilities that aren't in `worlds/${world}/abilities/database/`
- All player abilities must be in their `abilities.known[]` list
- Enemy abilities must be assigned at combat init
- Use `node .claude/skills/abilities/abilities.js --world=${world} similar <name>` to find alternatives

**Example - Creating missing enemy ability:**
```bash
# If Shadow Stalker needs an ability that doesn't exist:
# 1. Generate ID
node .claude/skills/math/math.js id 8

# 2. Create the ability file in worlds/${world}/abilities/database/<id>.yaml
# 3. Include tags: [enemy, shadow-stalker, <theme>]
# 4. Then assign to enemy
```

## Passive Ability Handling

Passives are ALWAYS active when known. At combat init:

1. **Identify passives**: Filter `abilities.known[]` where `action_type: passive`
2. **Calculate bonuses**: Sum all stat_bonus, damage_bonus, defense_bonus
3. **Apply to combat stats**: Modify defense, damage rolls accordingly
4. **Register triggers**: Track passives with `trigger` effects (e.g., on_hit, on_critical)

**Example passive calculation:**
```yaml
# Player has Basic Weapon Expertise (tmdelr3q) level 1
# Effect: damage_bonus: 2, applies_to: "weapon_attacks"

# At combat init:
active_passives:
  - id: "tmdelr3q"
    name: "Basic Weapon Expertise"
    effect:
      damage_bonus: 2
      applies_to: "weapon_attacks"

# When player attacks with weapon:
# Add +2 to damage roll
```

**Triggered passives:**
```yaml
# Momentum (fayrdef5) triggers on consecutive hits
# Track stacks in combat state
active_passives:
  - id: "fayrdef5"
    name: "Momentum"
    stacks: 3  # +3 damage from 3 consecutive hits
    max_stacks: 5
```

## Willpower Recovery

- **Short Rest** (10 minutes): Recover 25% max_willpower
- **Long Rest** (8 hours): Recover 100% max_willpower
- **Mana Crystal item**: Restore 20 willpower

Usage limits reset based on their `limits.reset` field:
- `combat`: Reset when combat ends
- `short_rest`: Reset after short rest
- `long_rest`: Reset after long rest
- `location`: Reset when moving to new location
- `daily`: Reset at dawn

## Loading Additional Rules

When needed, load:
- `worlds/${world}/abilities/index.md` - Ability catalog and creation guide
- `rules/combat.md` - Complex maneuvers, environmental combat (shared)
- `rules/afflictions.md` - Status effects, conditions (shared)
- `rules/enemy-tactics.md` - Enemy AI patterns (shared)
