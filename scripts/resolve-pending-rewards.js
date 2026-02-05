#!/usr/bin/env node

/**
 * Pending Rewards Resolver
 *
 * Automatically resolves pending_reward transactions when their PRs have merged.
 * Run at session start to claim earned Tokes.
 *
 * Usage: node scripts/resolve-pending-rewards.js <github-username>
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const crypto = require('crypto');

const LEDGERS_DIR = 'tokes/ledgers';

function randomInRange(min, max) {
  return crypto.randomInt(min, max + 1);
}

function loadYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

function saveYaml(filePath, data) {
  const content = yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"'
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

function getMergedPRs() {
  try {
    const result = execSync('gh pr list --state merged --limit 50 --json number,title,mergedAt', {
      encoding: 'utf8'
    });
    return JSON.parse(result);
  } catch (e) {
    console.error('Failed to fetch merged PRs:', e.message);
    return [];
  }
}

function parseRewardRange(rangeStr) {
  // Parse strings like "25-40 Tokes after PR merge"
  const match = rangeStr.match(/(\d+)-(\d+)/);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  return null;
}

function resolvePendingRewards(githubUsername) {
  const ledgerPath = path.join(LEDGERS_DIR, `${githubUsername}.yaml`);

  if (!fs.existsSync(ledgerPath)) {
    console.log(`No ledger found for ${githubUsername}`);
    return { resolved: [], total: 0 };
  }

  const ledger = loadYaml(ledgerPath);
  const mergedPRs = getMergedPRs();
  const resolved = [];
  let totalAwarded = 0;

  // Find transactions with pending_reward: true
  for (let i = 0; i < ledger.transactions.length; i++) {
    const txn = ledger.transactions[i];

    if (txn.pending_reward === true && txn.reward_range) {
      const range = parseRewardRange(txn.reward_range);

      if (range) {
        // Check if content paths exist (meaning PR was merged)
        const paths = txn.content_paths || (txn.content_path ? [txn.content_path] : []);
        const allExist = paths.length > 0 && paths.every(p => fs.existsSync(p));

        if (allExist) {
          // Roll the reward
          const reward = randomInRange(range.min, range.max);

          // Create a new earning transaction
          const earnTxn = {
            id: `${txn.id}-reward`,
            timestamp: new Date().toISOString(),
            type: 'earn',
            amount: reward,
            description: `Reward for merged content: ${txn.description.replace(/wove|wove the|into existence/gi, '').trim()}`,
            original_txn: txn.id
          };

          // Mark original as resolved
          txn.pending_reward = false;
          txn.resolved_reward = reward;
          txn.resolved_date = new Date().toISOString();
          delete txn.reward_range;

          // Add new transaction
          ledger.transactions.push(earnTxn);
          totalAwarded += reward;

          resolved.push({
            original: txn.id,
            description: txn.description,
            reward: reward,
            range: `${range.min}-${range.max}`
          });
        }
      }
    }
  }

  if (resolved.length > 0) {
    // Update balance
    ledger.balance += totalAwarded;

    // Save ledger
    saveYaml(ledgerPath, ledger);
  }

  return { resolved, total: totalAwarded };
}

function main() {
  const githubUsername = process.argv[2];

  if (!githubUsername) {
    console.log('Usage: node scripts/resolve-pending-rewards.js <github-username>');
    process.exit(1);
  }

  console.log(`Resolving pending rewards for ${githubUsername}...`);

  const result = resolvePendingRewards(githubUsername);

  if (result.resolved.length === 0) {
    console.log('No pending rewards to resolve.');
  } else {
    console.log(`\nResolved ${result.resolved.length} pending reward(s):\n`);
    for (const r of result.resolved) {
      console.log(`  ${r.original}: ${r.reward} Tokes (range: ${r.range})`);
      console.log(`    ${r.description}\n`);
    }
    console.log(`Total awarded: ${result.total} Tokes`);
  }
}

main();
