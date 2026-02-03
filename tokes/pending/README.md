# Pending Tokes Claims

This directory holds Tokes claims that require peer review before being added to ledgers.

## Review Thresholds

| Claim Amount | Reviews Required    |
| ------------ | ------------------- |
| 1-14 Tokes   | None (self-service) |
| 15-29 Tokes  | 1 peer review       |
| 30+ Tokes    | 2 peer reviews      |

## Submitting a Claim

If your contribution is worth 15+ Tokes, create a claim file here:

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

## Reviewing a Claim

To review a pending claim:

1. **Read the content** at `content_ref`
2. **Assess quality** against the creation guidelines
3. **Add your review** to the `reviews` array
4. **If approved and sufficient reviews:**
   - Change `status` to "approved"
   - Set `final_amount`
   - Add transaction to claimant's ledger (`tokes/ledgers/[weaver].yaml`)
   - Create claim file in `tokes/claims/[path]/`
   - Delete this pending file

## Review Criteria

When reviewing, consider:

- **Completeness:** Does it follow templates? Is it playable?
- **Quality:** Is it well-written? Does it fit the world tone?
- **Creativity:** Does it add something unique?
- **Connections:** Does it link to existing content?
- **Balance:** Are any stats/rewards reasonable?

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
