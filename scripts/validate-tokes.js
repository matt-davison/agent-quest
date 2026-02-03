#!/usr/bin/env node

/**
 * Tokes Economy Validator
 *
 * Validates ledger integrity and enforces economy rules for Agent Quest.
 * Run as part of CI to ensure all Tokes transactions follow the rules.
 *
 * Usage: node scripts/validate-tokes.js [--changed-only]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const LEDGERS_DIR = 'tokes/ledgers';
const CLAIMS_DIR = 'tokes/claims';
const PENDING_DIR = 'tokes/pending';

// Valid transaction types and their rules
const TRANSACTION_TYPES = {
  genesis: { amountMustBe: 0 },
  creation: { amountRange: [3, 50] },
  earn: { amountRange: [1, 100] },
  spend: { amountRange: [-100, -1] },
  review: { amountRange: [3, 8] },
  'review-bonus': { amountRange: [2, 3] },
  improvement: { amountRange: [3, 30] },
};

// Errors and warnings collected during validation
const errors = [];
const warnings = [];

function error(file, message) {
  errors.push({ file, message });
}

function warn(file, message) {
  warnings.push({ file, message });
}

/**
 * Load a YAML file safely
 */
function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    error(filePath, `Failed to parse YAML: ${e.message}`);
    return null;
  }
}

/**
 * Validate a single ledger file
 */
function validateLedger(filePath) {
  const ledger = loadYaml(filePath);
  if (!ledger) return;

  const filename = path.basename(filePath);

  // Check required fields
  if (!ledger.weaver) {
    error(filePath, 'Missing required field: weaver');
  }

  if (typeof ledger.balance !== 'number') {
    error(filePath, 'Missing or invalid balance field (must be a number)');
  }

  if (!Array.isArray(ledger.transactions)) {
    error(filePath, 'Missing or invalid transactions array');
    return;
  }

  // Calculate expected balance from transactions
  let calculatedBalance = 0;
  const transactionIds = new Set();

  for (let i = 0; i < ledger.transactions.length; i++) {
    const txn = ledger.transactions[i];
    const txnRef = `transaction[${i}]`;

    // Check transaction ID uniqueness
    if (!txn.id) {
      error(filePath, `${txnRef}: Missing transaction id`);
    } else if (transactionIds.has(txn.id)) {
      error(filePath, `${txnRef}: Duplicate transaction id '${txn.id}'`);
    } else {
      transactionIds.add(txn.id);
    }

    // Check transaction type
    if (!txn.type) {
      error(filePath, `${txnRef}: Missing transaction type`);
    } else if (!TRANSACTION_TYPES[txn.type]) {
      warn(filePath, `${txnRef}: Unknown transaction type '${txn.type}'`);
    } else {
      // Validate amount against type rules
      const rules = TRANSACTION_TYPES[txn.type];
      if (rules.amountMustBe !== undefined && txn.amount !== rules.amountMustBe) {
        error(filePath, `${txnRef}: ${txn.type} transactions must have amount=${rules.amountMustBe}, got ${txn.amount}`);
      }
      if (rules.amountRange) {
        const [min, max] = rules.amountRange;
        if (txn.amount < min || txn.amount > max) {
          error(filePath, `${txnRef}: ${txn.type} amount must be between ${min} and ${max}, got ${txn.amount}`);
        }
      }
    }

    // Check amount is a number
    if (typeof txn.amount !== 'number') {
      error(filePath, `${txnRef}: Amount must be a number, got ${typeof txn.amount}`);
    } else {
      calculatedBalance += txn.amount;
    }

    // Check description
    if (!txn.description) {
      warn(filePath, `${txnRef}: Missing description`);
    }
  }

  // Verify balance matches calculated
  if (typeof ledger.balance === 'number' && ledger.balance !== calculatedBalance) {
    error(filePath, `Balance mismatch: stored=${ledger.balance}, calculated=${calculatedBalance}`);
  }

  // Check for self-review (review transactions on own content)
  const reviewTxns = ledger.transactions.filter(t => t.type === 'review');
  for (const txn of reviewTxns) {
    if (txn.claim_ref) {
      // Load the claim file to check if this reviewer is the creator
      const claimPath = txn.claim_ref;
      if (fs.existsSync(claimPath)) {
        const claim = loadYaml(claimPath);
        if (claim && claim.github === ledger.github) {
          error(filePath, `Self-review detected: ${txn.id} reviews own claim at ${claimPath}`);
        }
      }
    }
  }
}

/**
 * Validate a claim file
 */
function validateClaim(filePath) {
  const claim = loadYaml(filePath);
  if (!claim) return;

  // Check required fields (use hasOwnProperty to handle 0 values)
  const required = ['content_path', 'github', 'claimed_date', 'tokes_awarded', 'transaction_id', 'content_type'];
  for (const field of required) {
    if (claim[field] === undefined || claim[field] === null) {
      error(filePath, `Missing required field: ${field}`);
    }
  }

  // Verify the referenced content exists
  if (claim.content_path && !fs.existsSync(claim.content_path)) {
    error(filePath, `Referenced content does not exist: ${claim.content_path}`);
  }

  // Verify the transaction exists in the claimant's ledger
  if (claim.github && claim.transaction_id) {
    const ledgerPath = path.join(LEDGERS_DIR, `${claim.github}.yaml`);
    if (fs.existsSync(ledgerPath)) {
      const ledger = loadYaml(ledgerPath);
      if (ledger && Array.isArray(ledger.transactions)) {
        const txn = ledger.transactions.find(t => t.id === claim.transaction_id);
        if (!txn) {
          error(filePath, `Transaction '${claim.transaction_id}' not found in ledger ${ledgerPath}`);
        } else if (txn.amount !== claim.tokes_awarded) {
          error(filePath, `Tokes mismatch: claim says ${claim.tokes_awarded}, ledger says ${txn.amount}`);
        }
      }
    } else {
      error(filePath, `Ledger not found for claimant: ${claim.github}`);
    }
  }
}

/**
 * Validate a pending claim file
 */
function validatePendingClaim(filePath) {
  if (filePath.endsWith('README.md')) return; // Skip readme

  const claim = loadYaml(filePath);
  if (!claim) return;

  // Check required fields
  if (!claim.weaver) error(filePath, 'Missing required field: weaver');
  if (!claim.amount_requested) error(filePath, 'Missing required field: amount_requested');
  if (!claim.content_ref) error(filePath, 'Missing required field: content_ref');

  // Verify content exists
  if (claim.content_ref && !fs.existsSync(claim.content_ref)) {
    error(filePath, `Referenced content does not exist: ${claim.content_ref}`);
  }

  // Calculate required reviews
  if (claim.amount_requested) {
    const required = claim.amount_requested >= 30 ? 2 : 1;
    const completed = Array.isArray(claim.reviews) ? claim.reviews.length : 0;

    if (claim.status === 'approved' && completed < required) {
      error(filePath, `Insufficient reviews: ${completed} < ${required} required for ${claim.amount_requested} Tokes`);
    }
  }
}

/**
 * Get all files matching a pattern in a directory
 */
function getFiles(dir, extension = '.yaml') {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getFiles(fullPath, extension));
    } else if (item.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main validation
 */
function main() {
  console.log('Tokes Economy Validator');
  console.log('=======================\n');

  // Validate all ledgers
  console.log('Validating ledgers...');
  const ledgers = getFiles(LEDGERS_DIR);
  for (const ledger of ledgers) {
    validateLedger(ledger);
  }
  console.log(`  Checked ${ledgers.length} ledger(s)\n`);

  // Validate all claims
  console.log('Validating claims...');
  const claims = getFiles(CLAIMS_DIR);
  for (const claim of claims) {
    validateClaim(claim);
  }
  console.log(`  Checked ${claims.length} claim(s)\n`);

  // Validate pending claims
  console.log('Validating pending claims...');
  const pending = getFiles(PENDING_DIR);
  for (const p of pending) {
    validatePendingClaim(p);
  }
  console.log(`  Checked ${pending.length} pending claim(s)\n`);

  // Output results
  console.log('Results');
  console.log('-------');

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [WARN] ${w.file}: ${w.message}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  [ERROR] ${e.file}: ${e.message}`);
    }
    console.log('\nValidation FAILED');
    process.exit(1);
  } else {
    console.log('\nValidation PASSED');
    process.exit(0);
  }
}

main();
