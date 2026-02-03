# Location Template

Copy this template to `world/locations/<location-id>/README.md`

---

# [Location Name]

> _[Atmospheric tagline - one evocative sentence]_

## Description

[2-3 paragraphs describing the location. Paint a picture with sensory details:]

[Paragraph 1: First impressions - what do you see when you arrive?]

[Paragraph 2: Atmosphere - sounds, smells, the feeling of the place]

[Paragraph 3: Activity - who's here, what's happening, what's the vibe?]

## Points of Interest

### [Point of Interest 1]

[Description of this specific area or feature]

**Interactions:**

- [What can players do here?]
- [Any items to find?]
- [Secrets?]

### [Point of Interest 2]

[Description]

**Interactions:**

- [Available actions]

### [Point of Interest 3]

[Description]

**Interactions:**

- [Available actions]

## NPCs

| Name       | Role             | Notes               |
| ---------- | ---------------- | ------------------- |
| [NPC Name] | [Their job/role] | [Brief description] |
| [NPC Name] | [Their job/role] | [Brief description] |

See individual NPC files in `world/npcs/` for full details.

## Shops & Services

### [Shop/Service Name]

**Proprietor:** [NPC Name]

| Item   | Price  | Stock                   |
| ------ | ------ | ----------------------- |
| [Item] | [Gold] | [Amount or "unlimited"] |
| [Item] | [Gold] | [Amount]                |

## Connections

| Direction/Method       | Destination   | Notes                 |
| ---------------------- | ------------- | --------------------- |
| North                  | [Location ID] | [Description of path] |
| South                  | [Location ID] | [Description]         |
| [Portal/Elevator/Door] | [Location ID] | [Requirements?]       |

## Encounters

_Random events that may occur in this location_

| Roll (d6) | Encounter        |
| --------- | ---------------- |
| 1         | [Event or enemy] |
| 2         | [Event or enemy] |
| 3-4       | [Event or enemy] |
| 5-6       | Nothing happens  |

## Secrets

_Hidden content - requires Weave Sight (5 Tokes) or specific actions_

<details>
<summary>Secret 1</summary>

[Hidden content description]

</details>

<details>
<summary>Secret 2</summary>

[Hidden content description]

</details>

## Lore Connections

- Related to: [Links to relevant lore entries]
- Mentioned in: [Quests or other locations that reference this place]

---

## Location Metadata

```yaml
id: "location-id"
region: "[Region Name]"
type: hub / dungeon / wilderness / settlement / special
danger_level: safe / low / medium / high / extreme
created_by: "[Your Weaver Name]"
created_date: "YYYY-MM-DD"
```
