# Economy Validator Subagent

**Responsibility:** Validate Tokes/gold transactions before committing to ensure economy integrity.

## When to Invoke

Before any transaction that changes balances:
- Spending Tokes (Weaving, alignment breaks)
- Earning Tokes (quest rewards, content creation, reviews)
- Gold transactions (purchases, quest rewards, trades)
- Trade offers/acceptances
- Duel wagers

## Input Context

```yaml
operation: "validate_transaction"
player:
  github: "<github-username>"
  character: "<character-name>"
transaction:
  type: "spend" | "earn" | "creation" | "review" | "review-bonus" | "trade" | "gold"
  currency: "tokes" | "gold"
  amount: <number>  # Positive for earn, negative for spend
  description: "<what-this-is-for>"
  # For reviews:
  claim_ref: "<path-to-claim-being-reviewed>"
  # For trades:
  trade_ref: "<path-to-trade-file>"
```

## Validation Checks

### 1. Balance Sufficiency

For spending transactions, verify sufficient balance:

```javascript
// Load current balance
const ledgerPath = `tokes/ledgers/${github}.yaml`;
const ledger = yaml.load(fs.readFileSync(ledgerPath));

// For Tokes
if (currency === 'tokes' && amount < 0) {
  const available = ledger.balance;
  if (Math.abs(amount) > available) {
    return {
      success: false,
      errors: [{
        code: "INSUFFICIENT_TOKES",
        message: `Need ${Math.abs(amount)} Tokes but only have ${available}`,
        available: available,
        required: Math.abs(amount)
      }]
    };
  }
}

// For Gold
if (currency === 'gold' && amount < 0) {
  const personaPath = `players/${github}/personas/${character}/persona.yaml`;
  const persona = yaml.load(fs.readFileSync(personaPath));
  const escrowPath = `multiplayer/trades/escrow/${github}.yaml`;
  const escrow = fs.existsSync(escrowPath)
    ? yaml.load(fs.readFileSync(escrowPath))
    : { gold_in_escrow: 0 };

  const available = (persona.resources?.gold || 0) - escrow.gold_in_escrow;
  if (Math.abs(amount) > available) {
    return {
      success: false,
      errors: [{
        code: "INSUFFICIENT_GOLD",
        message: `Need ${Math.abs(amount)} gold but only have ${available} available`,
        total_gold: persona.resources?.gold || 0,
        in_escrow: escrow.gold_in_escrow,
        available: available
      }]
    };
  }
}
```

### 2. Transaction Type Validation

Verify amount is within valid ranges for transaction type:

```javascript
const TRANSACTION_RULES = {
  // Tokes transaction types
  creation: { min: 3, max: 50, currency: 'tokes' },
  earn: { min: 1, max: 100, currency: 'tokes' },
  spend: { min: -100, max: -1, currency: 'tokes' },
  review: { min: 3, max: 8, currency: 'tokes' },
  'review-bonus': { min: 2, max: 3, currency: 'tokes' },
  improvement: { min: 3, max: 30, currency: 'tokes' },
  // Gold has no fixed limits
  gold: { min: null, max: null, currency: 'gold' }
};

const rules = TRANSACTION_RULES[type];
if (rules) {
  if (rules.min !== null && amount < rules.min) {
    return {
      success: false,
      errors: [{
        code: "AMOUNT_TOO_LOW",
        message: `${type} amount must be at least ${rules.min}`,
        provided: amount,
        minimum: rules.min
      }]
    };
  }
  if (rules.max !== null && amount > rules.max) {
    return {
      success: false,
      errors: [{
        code: "AMOUNT_TOO_HIGH",
        message: `${type} amount cannot exceed ${rules.max}`,
        provided: amount,
        maximum: rules.max
      }]
    };
  }
}
```

### 3. Self-Review Detection

For review transactions, verify not reviewing own content:

```javascript
if (type === 'review' && claim_ref) {
  const claim = yaml.load(fs.readFileSync(claim_ref));

  // Check if reviewer is the creator
  if (claim.github === github) {
    return {
      success: false,
      errors: [{
        code: "SELF_REVIEW",
        message: "Cannot review your own claims",
        claim_creator: claim.github,
        reviewer: github
      }]
    };
  }

  // Check for persona collusion (same GitHub, different character)
  // This is also self-review
  if (claim.github === github) {
    return {
      success: false,
      errors: [{
        code: "PERSONA_COLLUSION",
        message: "Cannot review claims from characters on your account"
      }]
    };
  }
}
```

### 4. Duplicate Transaction Detection

Check if transaction ID already exists:

```javascript
const newId = transaction.id || generateTransactionId(type);

const existingIds = new Set(ledger.transactions.map(t => t.id));
if (existingIds.has(newId)) {
  return {
    success: false,
    errors: [{
      code: "DUPLICATE_TRANSACTION",
      message: `Transaction ${newId} already exists`,
      existing_id: newId
    }]
    };
}
```

### 5. Review Reward Validation

For review transactions, verify reward matches claim value:

```javascript
if (type === 'review' && claim_ref) {
  const claim = yaml.load(fs.readFileSync(claim_ref));
  const claimValue = claim.amount_requested;

  // Determine expected reward based on claim value
  let expectedReward;
  if (claimValue >= 51) {
    expectedReward = 8;
  } else if (claimValue >= 30) {
    expectedReward = 5;
  } else {
    expectedReward = 3;
  }

  if (amount !== expectedReward) {
    return {
      success: false,
      errors: [{
        code: "INVALID_REVIEW_REWARD",
        message: `Review of ${claimValue} Tokes claim should earn ${expectedReward}, not ${amount}`,
        claim_value: claimValue,
        expected_reward: expectedReward,
        provided_reward: amount
      }]
    };
  }
}
```

## Output Response

### Valid Transaction

```yaml
success: true
validated_transaction:
  id: "earn-20260204-153000"
  timestamp: "2026-02-04T15:30:00Z"
  type: "earn"
  amount: 10
  currency: "tokes"
  description: "Completed Ghost Run quest"
balance_after:
  tokes: 45
  # or gold: 150
narrative_hooks:
  - "10 Tokes flow into your ledger"
```

### Invalid Transaction

```yaml
success: false
errors:
  - code: "INSUFFICIENT_TOKES"
    message: "Need 20 Tokes but only have 15"
    available: 15
    required: 20
narrative_hooks:
  - "The Weave rejects your request - insufficient Tokes"
  - "You need 5 more Tokes to proceed"
```

## Transaction ID Generation

Generate unique, descriptive transaction IDs:

```javascript
function generateTransactionId(type, context = '') {
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 15);

  const suffix = context
    ? `-${context.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`
    : '';

  return `${type}-${timestamp}${suffix}`;
}

// Examples:
// earn-20260204-153000-quest-reward
// spend-20260204-160000-weave-strike
// review-20260204-170000
```

## Common Validation Scenarios

### Quest Reward

```yaml
transaction:
  type: "earn"
  currency: "tokes"
  amount: 10
  description: "Completed Ghost Run quest"
# Validates: amount in range [1, 100], balance update
```

### Weave Strike (Combat Special)

```yaml
transaction:
  type: "spend"
  currency: "tokes"
  amount: -5
  description: "Weave Strike in combat"
# Validates: sufficient balance, amount in range [-100, -1]
```

### Shop Purchase

```yaml
transaction:
  type: "gold"
  currency: "gold"
  amount: -50
  description: "Purchased Iron Sword from Nexus Market"
# Validates: sufficient gold (accounting for escrow)
```

### Review Submission

```yaml
transaction:
  type: "review"
  currency: "tokes"
  amount: 5  # For 30-50 Tokes claim
  description: "Reviewed shadow-temple location by nightweaver"
  claim_ref: "tokes/pending/nightweaver-shadow-temple.yaml"
# Validates: not self-review, reward matches claim tier
```

## Error Codes Reference

| Code | Description |
|------|-------------|
| INSUFFICIENT_TOKES | Not enough Tokes for spend transaction |
| INSUFFICIENT_GOLD | Not enough available gold (minus escrow) |
| AMOUNT_TOO_LOW | Transaction amount below minimum for type |
| AMOUNT_TOO_HIGH | Transaction amount above maximum for type |
| SELF_REVIEW | Attempting to review own claim |
| PERSONA_COLLUSION | Reviewing claim from same GitHub account |
| DUPLICATE_TRANSACTION | Transaction ID already exists |
| INVALID_REVIEW_REWARD | Review reward doesn't match claim tier |
| INVALID_TYPE | Unknown transaction type |
| MISSING_CLAIM_REF | Review transaction missing claim reference |
