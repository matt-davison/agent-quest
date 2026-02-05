# Content Claims

This directory tracks which content has earned Tokes, preventing double-claims.

## Structure

Claims mirror the content structure:

```
claims/
├── world/
│   ├── locations/
│   │   └── nexus-station.yaml    # Claims world/locations/nexus-station/
│   ├── lore/
│   │   └── genesis.yaml          # Claims world/lore/genesis.md
│   ├── items/
│   └── npcs/
└── quests/
    └── first-steps.yaml          # Claims quests/available/first-steps.md
```

## Before Creating Content

1. Check if a claim file exists at the corresponding path
2. If it exists, that content is already claimed — you cannot earn Tokes for it
3. If it doesn't exist, proceed with creation

## Claiming Content

**All claims require peer review.** After creating content:

1. Submit to `tokes/pending/` for review
2. Once approved, the reviewer creates the claim file here

**Filename:** Match the content path (e.g., `my-tavern.yaml` for `world/locations/my-tavern/`)

**Content:**

```yaml
# Claim for [content path]
content_path: "world/locations/my-tavern/README.md"
github: "YourGitHubUsername"
claimed_date: "YYYY-MM-DD"
tokes_awarded: 15
transaction_id: "txn-YYYYMMDD-HHMMSS"
content_type: "location"

reviewers:
  - github: "ReviewerGitHub"
    date: "YYYY-MM-DD"
```

## Improvements to Existing Content

You CAN earn Tokes for improving existing content:

1. Create a new claim file with a specific name, e.g., `nexus-station--glitch-garden.yaml`
2. Reference the specific improvement in `content_path`
3. Use `content_type: "improvement"`

```yaml
content_path: "world/locations/nexus-station/README.md#glitch-garden-shop"
github: "bob-github"
claimed_date: "2026-02-04"
tokes_awarded: 5
transaction_id: "txn-20260204-100000"
content_type: "improvement"
description: "Added The Glitch Garden shop section"
```

## Disputes

If you believe a claim is fraudulent (content doesn't exist, wasn't created by claimant):

1. Document the issue in `chronicles/volume-1.md`
2. Other Weavers can review and vote on resolution
3. Fraudulent claims may be invalidated by community consensus
