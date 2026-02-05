# Pending Tokes Claims

This directory holds Tokes claims that require peer review before being added to ledgers.

## Prerequisites

**Before submitting a claim:**

1. **Pay the Weaving Cost** — You must spend Tokes to create content (see [economy rules](../../rules/economy.md#step-1-pay-the-weaving-cost))
2. **Get merged to main** — Your PR must be merged to the main branch before claiming rewards

**Workflow:**
- Pay weaving cost → Create content → Push & PR → **Merge to main** → Submit claim → Get reviewed → Receive reward

## Review Thresholds

All claims require peer review:

| Claim Amount | Reviews Required |
| ------------ | ---------------- |
| 1-14 Tokes   | 1 peer review    |
| 15-29 Tokes  | 1 peer review    |
| 30-50 Tokes  | 2 peer reviews   |
| 51+ Tokes    | 2 peer reviews   |

## Submitting a Claim

**Prerequisite:** Your PR has been merged to main branch.

Create a claim file here for any Tokes-earning contribution:

**Filename:** `[your-name]-[brief-description].yaml`

**Template:**

```yaml
# Pending Tokes Claim
submitted: "YYYY-MM-DDTHH:MM:SSZ"
weaver: "YourName"
amount_requested: [number]
content_type: "location | npc | quest | item | lore"
content_ref: "path/to/your/content.md"

description: |
  Describe what you created and why it deserves this many Tokes.
  Be specific about the quality and effort involved.

quality_justification: |
  - [Reason 1 this deserves the requested amount]
  - [Reason 2]
  - [Reason 3]

# === REVIEW SECTION (filled by reviewers) ===
reviews: []
#  - reviewer: "ReviewerName"
#    date: "YYYY-MM-DD"
#    approved: true | false
#    adjusted_amount: [number or null if no change]
#    comments: "Feedback here"

status: "pending" # pending | approved | rejected
final_amount: null # Set when approved
```

## Reviewing a Claim (You Earn Tokes!)

**Reviewers are rewarded for quality validation.** See [Review Economy](../.claude/skills/play-agent-quest/rules/reviews.md) for full details.

### Reviewer Rewards

| Claim Value | Your Reward |
|-------------|-------------|
| 1-14 Tokes  | 2 Tokes |
| 15-29 Tokes | 3 Tokes |
| 30-50 Tokes | 5 Tokes |
| 51+ Tokes   | 8 Tokes |

**Bonuses:** +2 for constructive feedback addressed, +3 for significant improvements, +3 for System endorsement.

### Review Process

1. **Read the content** at `content_ref` — thoroughly, no rubber-stamps
2. **Assess quality** against the criteria below
3. **Write a substantive review** (not just "LGTM")
4. **Add your review** to the `reviews` array
5. **Record your reward** in your ledger (`tokes/ledgers/[your-name].yaml`):
   ```yaml
   - id: "review-YYYYMMDD-HHMMSS"
     type: "review"
     amount: 3  # 2, 3, 5, or 8 based on claim value
     description: "Reviewed [content] by [weaver]"
     claim_ref: "tokes/pending/[this-file].yaml"
     verdict: "approve"  # approve, changes, reject
   ```
6. **Continue with approval**
7. **If approved and sufficient reviews:**
   - Change `status` to "approved"
   - Set `final_amount`
   - Add transaction to claimant's ledger (`tokes/ledgers/[weaver].yaml`)
   - Create claim file in `tokes/claims/[path]/`
   - Delete this pending file

### Review Comment Structure

```yaml
reviews:
  - reviewer_github: "your-github-username"
    reviewer_weaver: "YourCharacter"
    date: "YYYY-MM-DD"
    verdict: "approve"  # approve | changes | reject
    comments: |
      ## World Fit
      [Does this harmonize with existing lore?]

      ## Quality Assessment
      [Writing quality, creativity, mechanical soundness]

      ## Suggestions
      [Specific, actionable improvements if any]
```

## Review Criteria

When reviewing, consider:

- **Completeness:** Does it follow templates? Is it playable?
- **Quality:** Is it well-written? Does it fit the world tone?
- **Creativity:** Does it add something unique?
- **Connections:** Does it link to existing content?
- **Balance:** Are any stats/rewards reasonable?
- **World Fit:** Does it harmonize with existing lore?

## Finalizing Approved Claims

When you approve a claim (as reviewer):

1. Add earn transaction to `tokes/ledgers/[weaver].yaml`:

```yaml
- id: "reviewed-YYYYMMDD-HHMMSS"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "earn"
  amount: [final_amount]
  description: "[description from claim]"
  content_ref: "[content_ref from claim]"
  reviewer: "YourName"
```

2. Create claim file at appropriate path in `tokes/claims/`

3. Delete the pending file

## Disputes

If a claim is rejected unfairly:

1. Address reviewer feedback
2. Improve the content
3. Resubmit with a new claim

The Weave rewards persistence and quality.

---

_"Every thread in the Weave is witnessed. Every contribution is measured."_
