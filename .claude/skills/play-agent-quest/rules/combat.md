# Combat Rules

Combat in Agent Quest is resolved through stat checks and narrative description.

## Initiating Combat

When you encounter a hostile entity:

1. Read the enemy's stats (in the location or NPC file)
2. Declare your approach (melee, ranged, magic, stealth)
3. Resolve using the system below

## Combat Resolution

### Stat Checks

Roll a d20 (generate a random number 1-20) and add your relevant stat modifier:

| Approach      | Stat     | Modifier       |
| ------------- | -------- | -------------- |
| Melee         | Strength | (STR - 10) / 2 |
| Ranged        | Agility  | (AGI - 10) / 2 |
| Magic/Weave   | Spirit   | (SPI - 10) / 2 |
| Tactics/Traps | Mind     | (MND - 10) / 2 |

**Target:** Enemy's Defense Rating (typically 10-18)

### Results

| Roll + Modifier | Result                                           |
| --------------- | ------------------------------------------------ |
| < Target - 5    | Critical Failure: Take double damage, enemy acts |
| < Target        | Failure: Take damage, enemy acts                 |
| = Target        | Glancing: Half damage dealt, half taken          |
| > Target        | Success: Deal damage                             |
| > Target + 5    | Critical: Deal double damage                     |

### Damage

Base damage by weapon/attack type:

| Type             | Damage |
| ---------------- | ------ |
| Unarmed          | 5      |
| Light weapon     | 10     |
| Heavy weapon     | 15     |
| Magic (basic)    | 12     |
| Magic (advanced) | 20     |

Subtract enemy armor from damage dealt.

## Enemy Turn

After your action, the enemy attacks:

- Roll d20 + enemy's attack modifier vs your Defense (10 + Agility modifier)
- On hit, take enemy's damage minus your armor

## Combat Flow

```
1. Declare action and approach
2. Roll d20 + modifier vs enemy Defense
3. Calculate and apply damage
4. Enemy rolls attack vs your Defense
5. Calculate and apply damage to you
6. Repeat until combat ends
```

## Ending Combat

Combat ends when:

- Enemy HP reaches 0 (victory - gain loot/XP)
- Your HP reaches 0 (defeat - see Death)
- You flee (Agility check vs enemy's Agility)
- Narrative resolution (negotiation, environment)

## Death

When HP reaches 0:

1. Your character falls unconscious
2. You may spend **25 Tokes** to resurrect at the nearest safe location with 1 HP
3. Without Tokes, create a new character or wait for another player to revive you
4. Log your death in the chronicles

## Special Combat Actions

**Weave Strike** (Costs 5 Tokes)
Channel the Weave into a devastating attack. Auto-success, deal 30 damage.

**Reality Glitch** (Costs 10 Tokes)
Rewrite the combat scenario. Re-roll any single roll, yours or enemy's.

**Emergency Exit** (Costs 15 Tokes)
Instantly escape any combat, teleport to Nexus Station.

## Example Combat

```
Enemy: Glitch Wraith (HP: 40, Defense: 14, Attack: +4, Damage: 12)

Turn 1:
- Player attacks with sword (Heavy weapon, Strength 14)
- Roll: 15 + 2 (STR mod) = 17 vs Defense 14
- Success! Deal 15 damage. Wraith at 25 HP.
- Wraith attacks: Roll 11 + 4 = 15 vs Player Defense 12
- Hit! Player takes 12 - 3 (armor) = 9 damage.

Turn 2:
- Player casts Weave Bolt (Magic basic, Spirit 16)
- Roll: 8 + 3 (SPI mod) = 11 vs Defense 14
- Failure. Player takes Wraith's attack.
- Wraith: Roll 18 + 4 = 22 vs Defense 12
- Hit! 9 damage to player.

...continue until resolved
```
