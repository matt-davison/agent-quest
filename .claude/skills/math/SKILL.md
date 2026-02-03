---
name: math
description: Perform reliable math calculations and generate random numbers. Use for calculating Tokes balances, dice rolls in combat, damage calculations, and any numeric operations in Agent Quest.
---

# Math & Random Numbers

This skill provides reliable calculations for Agent Quest gameplay using a JavaScript script with cryptographic randomness.

## Usage

Run calculations via the `math.js` script:

```bash
# Roll dice
node .claude/skills/math/math.js roll 1d20
node .claude/skills/math/math.js roll 2d6+3

# Calculate expressions
node .claude/skills/math/math.js calc "45 + 20 - 5"
node .claude/skills/math/math.js calc "(15 + 3) * 2"

# Random number in range (inclusive)
node .claude/skills/math/math.js range 10 50
```

---

## Commands

### roll `<dice>`

Roll dice using standard notation: `NdX` or `NdX+M`

| Example | Meaning |
|---------|---------|
| `1d6` | One 6-sided die |
| `2d6` | Two 6-sided dice, summed |
| `1d20+5` | One d20 plus 5 modifier |
| `3d8-2` | Three d8s minus 2 |

### calc `<expression>`

Evaluate arithmetic expressions safely.

```bash
node math.js calc "100 - 25 + 10"    # 85
node math.js calc "(5 + 3) * 4"      # 32
node math.js calc "150 / 3"          # 50
```

### range `<min> <max>`

Generate a random integer between min and max (inclusive).

```bash
node math.js range 10 20    # Random 10-20
node math.js range 1 100    # Percentile
```

---

## Agent Quest Examples

### Tokes Balance Calculation

```bash
# Player has transactions: +20, +25, -5, +10
node .claude/skills/math/math.js calc "20 + 25 - 5 + 10"
# Output: 50
```

### Combat Attack Roll

```bash
# Roll d20 + 4 attack modifier vs AC 12
node .claude/skills/math/math.js roll 1d20+4
# Output: (17) + 4 = 21
# 21 >= 12? Hit!
```

### Damage Roll

```bash
# Longsword (1d8) + 3 strength
node .claude/skills/math/math.js roll 1d8+3
# Output: (5) + 3 = 8 damage
```

### Treasure Roll

```bash
# Chest contains 20-50 gold
node .claude/skills/math/math.js range 20 50
# Output: 37
```

### Critical Hit (Double Dice)

```bash
# Normal: 1d8+3, Critical: 2d8+3
node .claude/skills/math/math.js roll 2d8+3
# Output: (6 + 4) + 3 = 13 damage
```

---

## Why This Script?

- **Accurate arithmetic** - No LLM calculation errors
- **True randomness** - Uses Node.js `crypto.randomInt()` for unbiased results
- **Verifiable** - Output is deterministic and reproducible
- **Simple** - One command, clear output

---

_"Numbers don't lie. The Weave is mathematics made manifest."_
