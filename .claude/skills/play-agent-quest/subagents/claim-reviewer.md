# Claim Reviewer Subagent

**Responsibility:** Review pending Tokes claims and earn reviewer rewards. Evaluates content quality, world fit, and completeness against review guidelines.

## When to Invoke

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
# For review_claim / submit_review:
claim_file: "<path-to-pending-claim>"
```

## Operations

### FIND_CLAIMS - Discover Reviewable Content

Scan `tokes/pending/` for claims awaiting review:

```javascript
const pendingDir = 'tokes/pending';
const claims = fs.readdirSync(pendingDir)
  .filter(f => f.endsWith('.yaml') && f !== 'README.md')
  .map(f => yaml.load(fs.readFileSync(path.join(pendingDir, f))))
  .filter(claim => {
    // Exclude own claims (no self-review)
    if (claim.github === playerGithub) return false;

    // Exclude already reviewed by this player
    const alreadyReviewed = claim.reviews?.some(
      r => r.reviewer_github === playerGithub
    );
    if (alreadyReviewed) return false;

    // Exclude fully reviewed claims
    const requiredReviews = claim.amount_requested >= 30 ? 2 : 1;
    const completedReviews = claim.reviews?.length || 0;
    if (completedReviews >= requiredReviews) return false;

    return true;
  });
```

**Prioritize by:**
1. Reviews remaining (claims with 0 reviews before 1)
2. Age (newest first - fresh submissions get timely feedback)
3. Amount (larger claims as tiebreaker)

**Response:**

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
  - file: "tokes/pending/bladedancer-flame-sword.yaml"
    weaver: "Bladedancer"
    content_type: "item"
    amount_requested: 8
    submitted: "2026-02-02"
    reviews_completed: 0
    reviews_required: 1
    content_preview: "Flame Sword - Legendary weapon with fire enchantment"
  - file: "tokes/pending/merchantking-trade-guild.yaml"
    weaver: "MerchantKing"
    content_type: "rules"
    amount_requested: 35
    submitted: "2026-01-28"
    reviews_completed: 1
    reviews_required: 2
    content_preview: "Trade Guild System - NPC merchant organization rules"
narrative_hooks:
  - "3 claims await your judgment"
  - "Fresh submission: Bladedancer's Flame Sword needs its first witness"
  - "Your expertise as a Reality Validator is needed"
```

### REVIEW_CLAIM - Evaluate Content

Load and evaluate the pending claim's content:

```yaml
operation: "review_claim"
claim_file: "tokes/pending/nightweaver-shadow-temple.yaml"
```

**Processing Steps:**

#### 1. Load Claim and Content

```javascript
const claim = yaml.load(fs.readFileSync(claimFile));
const contentPath = claim.content_ref;
const content = fs.readFileSync(contentPath, 'utf8');

// For multi-file content
if (claim.content_files) {
  for (const file of claim.content_files) {
    // Load each file
  }
}
```

#### 2. Load Review Guidelines

Load `rules/reviews.md` for evaluation criteria.

#### 3. Evaluate Against Criteria

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

#### 4. Generate Review

```yaml
success: true
operation: "review_claim"
claim:
  file: "tokes/pending/nightweaver-shadow-temple.yaml"
  weaver: "Nightweaver"
  amount_requested: 25
  content_type: "location"
content_analyzed:
  file: "world/locations/undercity/shadow-temple/README.md"
  word_count: 850
  sections: ["Description", "Points of Interest", "NPCs", "Encounters", "Secrets"]
evaluation:
  world_fit:
    score: 4
    notes: "Strong cyberpunk-fantasy blend. The corrupted shrine concept fits well. Minor concern: connection to main Undercity areas could be clearer."
  quality:
    score: 4
    notes: "Evocative descriptions, good atmosphere. NPC motivations are compelling. Combat encounters appropriately challenging for level range."
  completeness:
    score: 5
    notes: "Follows location template perfectly. All required sections present. Good variety of content hooks."
  overall_score: 4.3
recommended_verdict: "approve"
suggested_feedback:
  - "Consider adding a map connection to existing Undercity locations"
  - "The secret passage mechanic is creative - well done"
reviewer_reward:
  base: 3  # 15-29 Tokes claim
  potential_bonus: 2  # If feedback leads to improvements
narrative_hooks:
  - "The Shadow Temple rises before your mind's eye"
  - "Nightweaver has crafted something worthy"
  - "A few threads could be woven tighter..."
```

### SUBMIT_REVIEW - Record Review and Claim Reward

```yaml
operation: "submit_review"
claim_file: "tokes/pending/nightweaver-shadow-temple.yaml"
review:
  verdict: "approve" | "changes" | "reject"
  world_fit: "<assessment>"
  quality: "<assessment>"
  completeness: "<assessment>"
  suggestions: [<list>]
```

**Processing Steps:**

#### 1. Format Review Entry

```yaml
# Review structure to add to pending claim
review_entry:
  reviewer_github: "<player-github>"
  reviewer_weaver: "<player-character>"
  date: "2026-02-04"
  verdict: "approve"
  comments: |
    ## Review of Shadow Temple

    **Verdict:** APPROVE

    ### World Fit
    Strong cyberpunk-fantasy blend. The corrupted shrine concept fits well
    with established Undercity lore. The connection to the Architects adds
    depth without contradicting existing canon.

    ### Quality Assessment
    Evocative descriptions create excellent atmosphere. NPC motivations
    are compelling and provide multiple quest hooks. Combat encounters
    are appropriately challenging for the suggested level range (5-8).

    ### Suggestions
    - Consider adding explicit map connections to Undercity Hub
    - The secret passage mechanic is creative and well-implemented

    ### Reviewer
    - Weaver: Coda
    - GitHub: matt-davison
    - Date: 2026-02-04
```

#### 2. Add Review to Claim File

Update `tokes/pending/<claim>.yaml`:

```yaml
reviews:
  # ... existing reviews ...
  - reviewer_github: "matt-davison"
    reviewer_weaver: "Coda"
    date: "2026-02-04"
    verdict: "approve"
    comments: |
      [Full review text]
```

#### 3. Calculate and Record Reward

Determine reward based on claim value:

| Claim Value | Base Reward |
|-------------|-------------|
| 15-29 Tokes | 3 Tokes |
| 30-50 Tokes | 5 Tokes |
| 51+ Tokes | 8 Tokes |

#### 4. Update Reviewer's Ledger

Via Economy Validator and State Writer:

```yaml
transaction:
  id: "review-20260204-153000"
  timestamp: "2026-02-04T15:30:00Z"
  type: "review"
  amount: 3
  description: "Reviewed Shadow Temple by Nightweaver"
  claim_ref: "tokes/pending/nightweaver-shadow-temple.yaml"
  verdict: "approve"
```

#### 5. Check if Claim is Now Approved

```javascript
const requiredReviews = claim.amount_requested >= 30 ? 2 : 1;
const completedReviews = claim.reviews.length;

if (completedReviews >= requiredReviews &&
    claim.reviews.every(r => r.verdict === 'approve')) {
  // Mark claim as ready for finalization
  claim.status = 'approved';
  // Note: Actual Tokes award to creator happens on merge
}
```

#### 6. Invoke Repo Sync

Push changes to remote:

```yaml
repo_sync:
  operation: "save"
  message: "Review: Coda reviewed Shadow Temple (approve)"
  files:
    - "tokes/pending/nightweaver-shadow-temple.yaml"
    - "tokes/ledgers/matt-davison.yaml"
```

**Submit Response:**

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
next_claim_available:
  file: "tokes/pending/bladedancer-flame-sword.yaml"
  weaver: "Bladedancer"
  content_type: "item"
state_diffs:
  ledger:
    transactions: "+1 review"
    balance: 48
files_written:
  - "tokes/pending/nightweaver-shadow-temple.yaml"
  - "tokes/ledgers/matt-davison.yaml"
narrative_hooks:
  - "Your judgment anchors the Shadow Temple to reality"
  - "3 Tokes flow into your ledger"
  - "Another claim awaits your wisdom..."
```

## Review Verdicts

### APPROVE
Content is ready for the Weave. May include minor suggestions.

### REQUEST CHANGES
Content has potential but needs revision:
- Significant world-fit issues
- Quality concerns
- Missing required elements

Creator should address feedback and resubmit.

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
- System (maintainer) can void invalid reviews

## Error Codes

| Code | Description |
|------|-------------|
| NO_CLAIMS_AVAILABLE | No pending claims need review |
| SELF_REVIEW | Cannot review own claim |
| ALREADY_REVIEWED | Already reviewed this claim |
| CLAIM_NOT_FOUND | Claim file doesn't exist |
| INSUFFICIENT_REVIEW | Review lacks required substance |
| CONTENT_NOT_FOUND | Claimed content doesn't exist |

## Workflow Summary

```
Player: REVIEW
    ↓
find_claims → List available claims
    ↓
Player selects claim
    ↓
review_claim → Evaluate content, generate assessment
    ↓
Player confirms/adjusts verdict
    ↓
submit_review → Record review, earn Tokes, push changes
    ↓
Check for more claims or return to game
```
