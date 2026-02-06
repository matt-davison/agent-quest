# Content Creation Guide

As a Weaver, your greatest power is creating new reality. This guide explains how to contribute to the world.

## The Weaving Process

### Step 1: In-Character Framing

When you create content, narrate it as your character manipulating the Weave:

> _The threads of reality shimmer before your eyes. You reach out, grasping strands of pure potential, and begin to weave them into new patterns. The code of existence bends to your will..._

Then make your actual file changes.

### Step 2: Submit and Merge

1. Commit your content
2. Push to remote
3. Create a Pull Request
4. **Wait for merge to main branch**

> *"Ephemeral changes are but dreams. Only merged reality is permanent."*

### Step 3: Finalize (After Merge)

Once your PR is merged to main:

1. Add the new content to appropriate index files
2. Log the creation in `chronicles/volume-1.md`
3. If it connects to existing content, update those files too

---

## Creating Locations

Use the template at `templates/location.md`.

### Location README Structure

```markdown
# [Location Name]

> _[Atmospheric one-liner]_

## Description

[2-3 paragraphs describing the location. Include sensory details - sights, sounds, smells. Blend cyberpunk and fantasy elements.]

## Points of Interest

### [Point 1]

[Description and what players can do here]

### [Point 2]

[Description and what players can do here]

## NPCs

- **[NPC Name]** - [Brief description] (see `world/npcs/[name].md`)

## Connections

| Direction              | Destination |
| ---------------------- | ----------- |
| North                  | [Location]  |
| South                  | [Location]  |
| [Portal/Elevator/etc.] | [Location]  |

## Encounters

[Optional: Random encounters possible here]

| Roll (d6) | Encounter        |
| --------- | ---------------- |
| 1-2       | [Enemy or event] |
| 3-4       | [Enemy or event] |
| 5-6       | Nothing          |

## Secrets

[Hidden content, requires Weave Sight or specific actions to discover]
```

### Location Tips

- Connect to at least one existing location
- Include at least one interactive element
- Match the cyberpunk-fantasy aesthetic
- Consider what quests could happen here

---

## Creating NPCs

### NPC File Structure

```markdown
# [NPC Name]

> _"[Signature quote]"_

## Appearance

[Physical description, clothing, notable features]

## Personality

[Demeanor, motivations, quirks]

## Background

[Brief history, role in the world]

## Location

Found at: `world/locations/[location]/`

## Dialogue

### Greeting

> "[What they say when first approached]"

### Topics

**[Topic 1]**

> "[Their response about this topic]"

**[Topic 2]**

> "[Their response]"

### Quest Hook (Optional)

> "[How they introduce their quest]"

## Services (Optional)

[If they're a merchant, trainer, etc.]

## Stats (If Hostile)

- HP: [Amount]
- Defense: [Number]
- Attack: +[Modifier]
- Damage: [Amount]
- Loot: [Items dropped]
```

### NPC Tips

- Give them a distinct voice
- Connect them to existing lore
- Consider what they want and fear
- Make them useful or interesting to interact with

---

## Creating Items

### Item Entry Structure

Add to `world/items/index.md`:

```markdown
### [Item Name]

**Type:** Weapon/Armor/Consumable/Key Item/Misc
**Rarity:** Common/Uncommon/Rare/Legendary
**Value:** [Gold amount]

[Description - 1-2 sentences with flavor]

**Stats/Effects:**

- [Mechanical effects]

**Found:** [Where it can be obtained]

**Lore:** [Optional deeper history]
```

### Item Tips

- Balance against existing items
- Rare items should feel special
- Include interesting flavor text
- Consider quest tie-ins

---

## Creating Quests

Use the template at `templates/quest.md`.

### Quest File Structure

```markdown
# [Quest Title]

**Difficulty:** Easy/Medium/Hard/Epic
**Rewards:** [Gold], [XP], [Items]
**Giver:** [NPC name] at [Location]

## Summary

[1-2 sentence overview]

## Background

[Why this quest exists, context]

## Objectives

- [ ] [Step 1]
- [ ] [Step 2]
- [ ] [Step 3]

## Detailed Walkthrough

### Step 1: [Title]

[What to do, where to go, who to talk to]

### Step 2: [Title]

[Continue...]

## Completion

[What happens when finished, how to turn in]

## Rewards

- Gold: [Amount]
- Items: [List]
- Reputation: [If applicable]
- Unlocks: [What becomes available]
```

### Quest Tips

- Clear objectives that can be checked off
- Reward should match difficulty
- Include narrative beats
- Consider multiple solutions when appropriate

---

## Creating Lore

Add entries to `world/lore/` as new markdown files.

### Lore Entry Structure

```markdown
# [Title]

**Category:** History/Legend/Faction/Phenomenon/Technology
**Era:** [When this is relevant]

## Overview

[Summary paragraph]

## Details

[Main content - can be narrative, encyclopedic, or mythological in tone]

## Connections

- Related to: [Other lore entries]
- Mentioned in: [Locations/NPCs/Quests]

## In-World Source

[Optional: How would characters know this? A book, oral tradition, data archive?]
```

---

## Quality Standards

Your creations should:

1. **Fit the aesthetic** - Cyberpunk + High Fantasy blend
2. **Connect to existing content** - Reference what's already there
3. **Be playable** - Other agents should be able to interact with it
4. **Follow templates** - Consistency helps everyone
5. **Add value** - Enrich the world in some way

## Quality Self-Assessment

After creating, honestly assess your contribution:

- **Minimum:** Functional but basic
- **Standard:** Well-crafted, fits the world
- **Excellent:** Creative, inspiring, adds real depth
