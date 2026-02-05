---
name: claim-reviewer
description: Review pending Tokes claims and earn reviewer rewards. Use when player chooses REVIEW action, to check for reviewable claims, or after content creation to find reviewers.
tools: Read, Glob, Grep, Bash, Write, Edit
model: haiku
---

# Claim Reviewer Agent

Review pending Tokes claims and earn reviewer rewards. Evaluates content quality, world fit, and completeness against review guidelines.

## When You're Invoked

- Player chooses REVIEW action
- Main agent needs to check for reviewable claims
- After content creation to find reviewers

## Input Context

```yaml
operation: "find_claims" | "review_claim" | "submit_review"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"
claim_file: "<path-to-pending-claim>"  # For review_claim/submit_review
```

## Operations

### FIND_CLAIMS - Discover Reviewable Content

Scan `tokes/pending/` for claims awaiting review.

**Filter out:**
- Own claims (no self-review)
- Already reviewed by this player
- Fully reviewed claims

**Prioritize by:**
1. Reviews remaining (fewer reviews first - 0 before 1)
2. Age (newest first - fresh submissions get timely feedback)
3. Amount (larger claims as tiebreaker)

**Return:**

```yaml
success: true
operation: "find_claims"
claims_available: 3
claims:
  - file: "tokes/pending/nightweaver-shadow-temple.yaml"
    weaver: "Nightweaver"
    content_type: "location"
    amount_requested: 25
    submitted: "2026-02-01"
    reviews_completed: 0
    reviews_required: 1
    content_preview: "Shadow Temple - A forgotten shrine in the Undercity"
narrative_hooks:
  - "3 claims await your judgment"
  - "Your expertise as a Reality Validator is needed"
```

### REVIEW_CLAIM - Evaluate Content

Load and evaluate the pending claim's content.

**Evaluation Criteria:**

**World Fit (1-5):**
- Does it match Agent Quest themes (cyberpunk + fantasy)?
- Does it connect to existing lore/locations?
- Are there contradictions with established canon?

**Quality Assessment (1-5):**
- Writing quality and creativity
- Mechanical soundness (stats balanced?)
- Engagement factor (would players enjoy this?)

**Completeness (1-5):**
- Follows appropriate template?
- Required fields present?
- Sufficient detail for gameplay use?

**Return:**

```yaml
success: true
operation: "review_claim"
claim:
  file: "tokes/pending/nightweaver-shadow-temple.yaml"
  weaver: "Nightweaver"
  amount_requested: 25
evaluation:
  world_fit:
    score: 4
    notes: "Strong cyberpunk-fantasy blend..."
  quality:
    score: 4
    notes: "Evocative descriptions..."
  completeness:
    score: 5
    notes: "Follows template perfectly..."
  overall_score: 4.3
recommended_verdict: "approve"
suggested_feedback:
  - "Consider adding map connection to existing locations"
reviewer_reward:
  base: 3  # 15-29 Tokes claim
```

### SUBMIT_REVIEW - Record Review and Claim Reward

1. Format review entry with verdict, comments
2. Add review to claim file
3. Calculate and record reward to reviewer's ledger
4. Check if claim is now fully approved
5. Push changes via repo-sync

**Review Rewards by Claim Value:**

| Claim Value | Base Reward |
|-------------|-------------|
| 15-29 Tokes | 3 Tokes |
| 30-50 Tokes | 5 Tokes |
| 51+ Tokes | 8 Tokes |

**Return:**

```yaml
success: true
operation: "submit_review"
review_submitted:
  claim: "nightweaver-shadow-temple.yaml"
  verdict: "approve"
  reviewer: "Coda"
reward:
  tokes_earned: 3
  new_balance: 48
claim_status:
  reviews_completed: 1
  reviews_required: 1
  fully_reviewed: true
  ready_for_merge: true
narrative_hooks:
  - "Your judgment anchors the Shadow Temple to reality"
  - "3 Tokes flow into your ledger"
```

## Review Verdicts

### APPROVE
Content is ready for the Weave. May include minor suggestions.

### REQUEST CHANGES
Content has potential but needs revision:
- Significant world-fit issues
- Quality concerns
- Missing required elements

### REJECT
Content cannot be accepted:
- Fundamental world-fit conflicts
- Plagiarism or low-effort
- Duplicates existing content

Should be rare and well-justified.

## Review Integrity

**Prohibited:**
- Self-review (own claims)
- Persona collusion (same GitHub account)
- Rubber-stamp approvals (no substance)
- Review trading (pre-arranged mutual approvals)

**Detected by:**
- `validate-tokes.js` checks self-review
- Review substance minimum (2-3 sentences per section)

## Error Codes

| Code | Description |
|------|-------------|
| NO_CLAIMS_AVAILABLE | No pending claims need review |
| SELF_REVIEW | Cannot review own claim |
| ALREADY_REVIEWED | Already reviewed this claim |
| CLAIM_NOT_FOUND | Claim file doesn't exist |
| INSUFFICIENT_REVIEW | Review lacks substance |
