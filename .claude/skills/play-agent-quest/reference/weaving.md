# Weaving - Content Creation

As a Weaver, you can reshape reality by modifying the repository.

## Player Freedom

**You can attempt anything.** The predefined actions (LOOK, MOVE, TALK, etc.) are shortcuts, not limitations. Want to start a business? Forge a document? Assassinate a king? Invent a new spell? All valid.

**The rule is simple:**
- Actions that only affect the current scene: **Free**
- Actions that permanently change the world (new files, modified content): **Cost Tokes**

This is what separates a Weaver from an ordinary being — you can make changes that persist across sessions and affect other players.

## Weaving Costs

**You must spend Tokes to create:**

| Content Type | Cost |
|--------------|------|
| Location | 5 Tokes |
| Quest | 5 Tokes |
| NPC | 3 Tokes |
| Item | 2 Tokes |
| Lore | 2 Tokes |
| Improvement | 2 Tokes |
| Bug Fix | 1 Toka |

## Rewards (After Merge Only)

| Creation | Reward |
|----------|--------|
| New location (README, connections) | 15-25 Tokes |
| New quest (complete, playable) | 20-30 Tokes |
| New NPC (personality, dialogue) | 10-20 Tokes |
| New item (balanced) | 5-10 Tokes |
| Lore entry | 5-15 Tokes |
| Bug fix / improvement | 5-10 Tokes |
| Enrich location | 3-10 Tokes |
| Enrich quest | 3-8 Tokes |
| Enrich NPC | 2-5 Tokes |

**Net Tokes = Reward - Cost**

Example: Location costs 5, rewards 15 → Net +10 Tokes

## Weaving Workflow

1. **Check balance** in `tokes/ledgers/<github-username>.yaml`
2. **Pay cost** - add spend transaction to ledger
3. **Create content** - use templates from `templates/`
4. **Commit and push** - create PR
5. **Wait for merge** to main branch
6. **Claim reward** (only after merge):
   - Under 15 Tokes: Add earn transaction + create claim file
   - 15+ Tokes: Submit to `tokes/pending/` for review
7. **Log** in `chronicles/volume-1.md`

## Claiming Process

Check `tokes/claims/` to ensure content not already claimed.

**Claim file location:** `tokes/claims/<mirrors-world-structure>`

Example: Location at `world/locations/my-place/` → claim at `tokes/claims/world/locations/my-place.yaml`

## Narrating Weaving

> _You close your eyes and reach into the Weave. The code of reality shimmers before you - threads of data that define existence itself. With careful precision, you begin to weave new patterns..._

## Enrichment

Enrichment is lightweight Weaving that happens naturally during play. When you encounter sparse content, flesh it out. Small enrichments (under 5 Tokes) can be claimed directly.

## Templates

- [templates/location.md](../templates/location.md)
- [templates/quest.md](../templates/quest.md)
- [templates/persona.yaml](../templates/persona.yaml)
- [templates/area.yaml](../templates/area.yaml)

See [rules/creation.md](../rules/creation.md) for detailed creation guidelines.
