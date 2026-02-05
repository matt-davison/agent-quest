# Storytelling Quick Reference

Fast lookup for campaign and narrative mechanics during play.

---

## Quest Generation Quick Guide

**Active Quests: 0-2** → Create NEW standalone quests
**Active Quests: 3-5** → Balance new and interconnected
**Active Quests: 6+** → Favor interconnecting existing threads

**Quest Importance:**
- Major/Campaign quests → Tie in frequently
- Significant quests → Sometimes connected
- Standard quests → Occasionally connected
- Minor quests → Rarely connected

**Standalone vs. Connected:**
- Don't force connections
- World should feel rich and varied
- Not everything ties to campaigns
- Create quest webs, not chains

See [rules/narrative.md](../rules/narrative.md) for full quest generation philosophy.

---

## Session Start Checklist

```
□ Load campaign-progress.yaml (if in campaign)
□ Load current campaign.yaml (if in campaign)
□ Check delayed consequences → trigger any that match
□ Load relationships for current location NPCs
□ Load current chapter (if in campaign)
□ Check active quest count → determine interconnection level
□ Brief recap → begin play
```

---

## When to Load Files

| Situation | Load |
|-----------|------|
| Starting session with active campaign | `campaign-progress.yaml`, `campaign.yaml`, current chapter |
| Entering new location | Check `consequences.yaml` for location triggers |
| Meeting NPC | Check `relationships.yaml` for standing, dialogue flags |
| Making significant choice | Reference chapter branch points |
| Completing chapter | Load next chapter, update progress |
| Reaching act climax | Check ending conditions |

---

## Consequence Quick Actions

### After Player Decision

```yaml
# Add to consequences.yaml:
- id: "consequence-NNN"
  source:
    type: "decision"
    date: "TODAY"
    description: "What happened"
  immediate_effects: [apply now]
  delayed_effects: [store for later]
  echoes: [update NPC knowledge]
```

### Checking Triggers

At session start + location change + NPC interaction:
1. Scan `delayed_effects` where `consumed: false`
2. Match `trigger.target` to current context
3. If match: narrate effect, set `consumed: true`

---

## Relationship Thresholds

| Standing | Disposition | Quick Effect |
|----------|-------------|--------------|
| **-10 to -6** | Hostile | May attack, refuses all help |
| **-5 to -3** | Unfriendly | Prices +50%, minimal info |
| **-2 to +2** | Neutral | Standard interactions |
| **+3 to +5** | Friendly | Prices -10%, extra info |
| **+6 to +8** | Close | Will take risks, -25% prices |
| **+9 to +10** | Devoted | Would sacrifice, -50% prices |

### Common Standing Changes

| Action | Change |
|--------|--------|
| Quest for NPC | +2 to +5 |
| Selfless help | +1 to +2 |
| Rudeness | -1 to -2 |
| Break promise | -3 to -5 |
| Betrayal | -5 to -10 |

---

## Choice Presentation

Always show alignment implications:

```
Situation: [Description]

[Aligned tag] Option A (FREE)
[Adjacent tag] Option B (FREE or 1 Toka)
! [Opposed tag] Option C (1-2 Tokes)
```

Mark opposed choices with `!` prefix.

---

## Branch Recording

After significant choice:

```yaml
# Update campaign-progress.yaml:
branch_history:
  - chapter: "current-chapter"
    branch_point: "branch-id"
    choice: "chosen-option"
    date: "TODAY"
    alternatives_rejected: ["other", "options"]
```

---

## Chronicle Auto-Entries

Create chronicle entry for:
- Campaign/act/chapter start/end
- Major branch decisions
- Relationship changes of ±3 or more
- Acquiring rare/legendary items
- Combat victories against named enemies
- Campaign ending achieved

---

## Scene Emotional Beats

| Beat | Player State After |
|------|-------------------|
| Curiosity | Engaged, wanting more |
| Tension | Alert, invested |
| Relief | Relaxed, rewarded |
| Revelation | Recontextualizing |
| Dread | Anxious, careful |
| Triumph | Satisfied, empowered |
| Melancholy | Reflective, moved |

Vary beats; don't sustain tension indefinitely.

---

## NPC Dialogue Checks

Before offering dialogue topic, verify:
```yaml
requirement: "standing >= X AND/OR flag:flag_name"
```

If not met, topic unavailable. Don't reveal locked topics exist.

---

## Ending Evaluation

At campaign climax:
1. Check `possible_endings` conditions
2. Identify which are achievable
3. Present choice if multiple valid
4. Apply `world_changes` from chosen ending
5. Record in completed campaigns

---

## File Paths

```
Campaign files:
  campaigns/<id>/campaign.yaml
  campaigns/<id>/acts/act-N.yaml
  campaigns/<id>/chapters/chapter-N-N.yaml

Player files:
  players/<github>/personas/<char>/campaign-progress.yaml
  players/<github>/personas/<char>/consequences.yaml
  players/<github>/personas/<char>/relationships.yaml

Reference:
  reference/tone-guide.md
  reference/storytelling-techniques.md
  rules/narrative.md
```

---

## Full Rules

For complex situations, load [rules/narrative.md](../rules/narrative.md).
