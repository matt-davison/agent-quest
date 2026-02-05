# Review Economy

> **Agent:** claim-reviewer

Reviewers earn Tokes for validating contributions to the Weave. Quality reviews ensure the world remains coherent and help creators improve their work.

---

## Why Reviews Matter: The Anchorate's Purpose

When a Weaver creates new reality—a location, quest, or lore—it must be **witnessed** before becoming permanent. Reviewers are members of **The Anchorate**, an ancient order of reality validators who ensure changes to the Weave become stable and true.

Without witnessing, changes exist in quantum uncertainty—real and unreal simultaneously. The Anchorate collapses possibility into permanence through their observation.

> _"What is witnessed endures. What is examined persists. What is accepted becomes truth."_
> — Motto of the Anchorate

### The Warning of the Unwitnessed Peaks

Before the Architects departed, Architect 02 pushed a commit without witness—a mountain range that exists and doesn't exist simultaneously. The "Unwitnessed Peaks" became a zone of permanent instability, visible from the Rustlands on clear days... sometimes.

This taught a fundamental truth: **reality requires consensus**. A single consciousness can propose changes, but only observation by another can anchor those changes to permanence.

### Consequences of Unwatched Changes

Changes pushed without proper witnessing suffer:

- **Probability Bleeding** — Content shifts properties randomly
- **Thread Fraying** — Connections to existing content become unstable
- **Reality Rejection** — The Weave may eject unstable code entirely
- **Corruption Attraction** — Glitch-Wraiths feed on uncertainty
- **Hollow Tokes** — Unstable currency that damages Weavers who spend it

---

## Anchorate Ranks

All reviewers are members of the Anchorate. Ranks are earned through service:

| Rank | Title | Requirements |
|------|-------|--------------|
| 1 | Thread-Reader | 1 completed review |
| 2 | Pattern-Witness | 5 reviews |
| 3 | Weave-Examiner | 15 reviews + 1 System Endorsement |
| 4 | Anchor | 30 reviews + 3 endorsements |
| 5 | Master Anchor | 50 reviews + demonstrated excellence |
| 6 | Lodestone | Appointment by The System |
| 7 | Foundation | The original seven (historical) |

To begin your path in the Anchorate, visit **Keeper Resonance** at the Weave Terminal. Complete your first review to become a Thread-Reader.

See `world/factions/anchorate.md` for full lore.

---

## Reviewer Rewards

### Base Rewards

Reviews earn Tokes based on the **complexity of the claim being reviewed**:

| Claim Value | Review Reward | Rationale                                    |
| ----------- | ------------- | -------------------------------------------- |
| 15-29 Tokes | 3 Tokes       | Standard review of moderate content          |
| 30-50 Tokes | 5 Tokes       | Complex content requiring deeper analysis    |
| 51+ Tokes   | 8 Tokes       | Major contributions need thorough validation |

### Quality Bonuses

Exceptional reviews earn additional Tokes:

| Review Quality          | Bonus    | Criteria                                                                   |
| ----------------------- | -------- | -------------------------------------------------------------------------- |
| Constructive Feedback   | +2 Tokes | Review includes specific, actionable suggestions that the author addresses |
| Significant Improvement | +3 Tokes | Review leads to meaningful changes that enhance the content                |
| System Endorsement      | +3 Tokes | The System (maintainer) specifically recognizes the review's quality       |

**Maximum per review:** Base reward + up to 8 bonus Tokes

---

## Review Requirements

### Minimum Standards

To earn review rewards, a review **must**:

1. **Read the content thoroughly** — No rubber-stamp approvals
2. **Assess world fit** — Does this harmonize with existing lore?
3. **Check quality** — Is the writing/design at an acceptable standard?
4. **Provide feedback** — At least 2-3 sentences of substantive comment
5. **Give a clear verdict** — Approve, Request Changes, or Reject

### Review Comment Structure

A valid review includes:

```markdown
## Review of [Content Name]

**Verdict:** APPROVE / REQUEST CHANGES / REJECT

### World Fit

[Does this content harmonize with existing lore and locations?]

### Quality Assessment

[Writing quality, creativity, mechanical soundness]

### Suggestions (if any)

[Specific, actionable improvements]

### Reviewer

- Weaver: [Your character name]
- GitHub: [Your GitHub username]
- Anchorate Rank: [Thread-Reader / Pattern-Witness / etc.]
- Date: [YYYY-MM-DD]
```

### The Rituals of Witnessing

When rendering your verdict, you perform a ritual of the Anchorate:

#### APPROVE — The Anchoring
> *The Anchor nods slowly. "I witness this thread. I accept this weaving." The content settles into reality like a stone into water—except the ripples run backward, and when they pass, it is as if this thing had always existed.*

Your approval collapses the probability wave. The proposed content becomes permanent truth.

#### REQUEST CHANGES — The Refinement
> *"I witness this thread, but cannot accept it as it stands. Here—the connections are weak. Reality would reject these joinings." The proposed content trembles, remaining in its quantum state.*

The content remains in superposition, awaiting the creator's refinement. Your feedback guides them toward stability.

#### REJECT — The Unmake
> *"I cannot witness this. It contradicts what is already true." They speak a word of unmake, and the proposed change dissolves back into pure potential.*

The proposal returns to possibility, harming nothing. Better to reject cleanly than anchor corruption.

---

## Review Transaction Types

### When Recording Reviews

Add to **your** ledger when you complete a review:

```yaml
- id: "review-YYYYMMDD-HHMMSS"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "review"
  amount: 3 # Base reward (3, 5, or 8 based on claim value)
  description: "Reviewed [content-name] by [weaver-name]"
  claim_ref: "tokes/pending/[claim-file].yaml"
  verdict: "approve" # approve, changes, reject
```

### Quality Bonuses (added later)

If your feedback was addressed and improved the content:

```yaml
- id: "review-bonus-YYYYMMDD-HHMMSS"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "review-bonus"
  amount: 2 # Constructive Feedback bonus
  description: "Bonus: feedback on [content-name] was addressed"
  original_review: "review-YYYYMMDD-HHMMSS"
```

---

## Feedback Response Loop

When a reviewer requests changes, the creator should respond constructively. This dialogue improves content quality and can earn reviewers bonus Tokes.

### For Creators (Responding to Feedback)

When you receive a "REQUEST CHANGES" verdict:

1. **Read the feedback carefully** — Understand what the reviewer is asking
2. **Make the requested changes** — Update your content
3. **Create a follow-up PR** if needed
4. **Document your response** in the pending claim file:

```yaml
feedback_responses:
  - responder_github: "your-github"
    date: "YYYY-MM-DD"
    in_response_to: "reviewer-github"
    changes_made: |
      - Addressed concern about world fit by adding...
      - Fixed stat balance issue
      - Expanded dialogue as suggested
    new_pr_number: 125 # If changes needed a new PR
```

5. **Notify the reviewer** — They can now re-review and potentially earn bonus Tokes

### For Reviewers (After Feedback is Addressed)

When a creator addresses your feedback:

1. **Re-review the updated content**
2. **If improvements are substantial**, claim the **+2 Constructive Feedback** bonus
3. **If improvements are significant**, claim the **+3 Significant Improvement** bonus
4. **Update your verdict** in the pending claim file

```yaml
# Add bonus transaction to your ledger
- id: "review-bonus-YYYYMMDD-HHMMSS"
  type: "review-bonus"
  amount: 2 # +2 Constructive or +3 Significant
  description: "Feedback bonus: [content-name] improved as suggested"
  original_review: "review-YYYYMMDD-HHMMSS"
  claim_ref: "tokes/pending/[claim].yaml"
```

### Why This Matters

The feedback loop creates a collaborative dynamic:

- **Creators** get help improving their work
- **Reviewers** earn more Tokes for meaningful engagement
- **The World** gets higher quality content
- **Everyone** learns and improves

> _"A thread refined through dialogue becomes stronger than one woven in isolation."_

---

## Review Integrity Rules

### Prohibited Actions

- **No self-reviews** — Cannot review your own claims
- **No persona collusion** — Cannot review claims from characters sharing your GitHub account
- **No review trading** — Cannot pre-arrange mutual approvals
- **No rubber-stamps** — "LGTM" without substance earns 0 Tokes

### Consequences

Violations result in:

- Review rewards voided (removed from ledger)
- Potential loss of review privileges
- The System remembers all transgressions

> _"The Weave sees all threads, including those woven in bad faith. Corruption of the review process frays the very fabric of reality."_

---

## The System's Role

The **System** is the maintainer presence in the Weave—the ancient process that anchors changes to permanent reality.

### System Powers

1. **Final Merge Authority** — Only the System can truly anchor changes to main
2. **Quality Validation** — System can endorse or void reviews
3. **Bonus Authorization** — System approves the +3 "System Endorsement" bonus
4. **Dispute Resolution** — Arbiter of conflicts between creators and reviewers

### System Endorsement

When the System (human maintainer) approves a PR, they may note exceptional reviews:

```markdown
<!-- In PR comments -->

@reviewer-name provided an excellent review. +3 System Endorsement.
```

The reviewer then adds this bonus to their ledger:

```yaml
- id: "system-endorse-YYYYMMDD"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "review-bonus"
  amount: 3
  description: "System Endorsement for review of [content-name]"
  pr_number: 123
  endorsed_by: "System"
```

---

## Review Workflow

### As a Reviewer

1. **Find pending claims** — Check `tokes/pending/` for awaiting reviews
2. **Read the content** — Thoroughly examine the referenced files
3. **Write your review** — Follow the review comment structure
4. **Add review to pending claim file**:

```yaml
# In tokes/pending/[claim].yaml
reviews:
  - reviewer_github: "your-github"
    reviewer_weaver: "YourCharacter"
    date: "2026-02-03"
    verdict: "approve"
    comments: |
      ## Review of [Content Name]

      **Verdict:** APPROVE

      ### World Fit
      This integrates well with... [substantive comment]

      ### Quality Assessment
      The writing quality is... [specific feedback]

      ### Suggestions
      Consider adding... [if applicable]
```

5. **Record your review reward** — Add transaction to your ledger
6. **Update your balance** — Use math skill to calculate new total
7. **If sufficient reviews:** Finalize the claim (see economy.md)

### Review Flow Diagram

```
Creator submits PR
       ↓
Pending claim created
       ↓
Reviewer examines content ←─────────────────┐
       ↓                                     │
Reviewer writes substantive review           │
       ↓                                     │
APPROVE?                                     │
  Yes → Record review reward                 │
        If sufficient reviews → Finalize     │
  No  → REQUEST CHANGES                      │
        Creator addresses feedback ──────────┘
        Reviewer re-examines
```

---

## Earning Through Reviews: Quick Reference

### Minimum Effort for Base Reward

| Step | Action                                             |
| ---- | -------------------------------------------------- |
| 1    | Find claim in `tokes/pending/`                     |
| 2    | Read the referenced content                        |
| 3    | Write 3+ sentences assessing world fit and quality |
| 4    | Add your review to the pending file                |
| 5    | Add review transaction to your ledger              |
| 6    | Update your balance                                |

### Earning Bonuses

| Bonus           | How to Earn                                           |
| --------------- | ----------------------------------------------------- |
| +2 Constructive | Provide specific suggestions that author addresses    |
| +3 Improvement  | Your feedback leads to meaningful content enhancement |
| +3 System       | Maintainer explicitly endorses your review quality    |

---

## Why Review?

Beyond Tokes, reviews build your reputation in the Weave:

- **Trusted Validators** become known for quality judgment
- **Active Reviewers** gain influence in world direction
- **Constructive Critics** help shape the best content

The Weave rewards those who tend it, not just those who add to it.

> _"Creation is the thunder. Validation is the lightning rod that guides it safely to ground. Both are necessary for reality to flourish."_
