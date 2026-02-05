#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple YAML parser for ledger files (handles our specific format)
function parseSimpleYaml(content) {
  const result = { transactions: [] };
  const lines = content.split('\n');
  let inTransactions = false;
  let currentTxn = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for transactions array start
    if (trimmed === 'transactions:') {
      inTransactions = true;
      continue;
    }

    // Parse top-level fields
    if (!inTransactions && trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key === 'weaver') result.weaver = value;
      continue;
    }

    // Parse transactions
    if (inTransactions) {
      // New transaction item
      if (trimmed.startsWith('- ')) {
        if (currentTxn) result.transactions.push(currentTxn);
        currentTxn = {};
        // Parse first field on same line as dash
        const afterDash = trimmed.slice(2).trim();
        if (afterDash.includes(':')) {
          const colonIdx = afterDash.indexOf(':');
          const key = afterDash.slice(0, colonIdx).trim();
          const value = afterDash.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (key === 'amount') currentTxn.amount = parseFloat(value);
          else currentTxn[key] = value;
        }
      } else if (currentTxn && trimmed.includes(':')) {
        // Continue current transaction
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.slice(0, colonIdx).trim();
        const value = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key === 'amount') currentTxn.amount = parseFloat(value);
        else currentTxn[key] = value;
      }
    }
  }

  // Don't forget the last transaction
  if (currentTxn) result.transactions.push(currentTxn);

  return result;
}

function balance(weaverName, world = 'alpha') {
  // Find the ledger file
  const ledgerPath = path.join(process.cwd(), 'worlds', world, 'tokes', 'ledgers', `${weaverName}.yaml`);

  if (!fs.existsSync(ledgerPath)) {
    console.error(`Ledger not found: ${ledgerPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const ledger = parseSimpleYaml(content);

  // Sum all transaction amounts
  let total = 0;
  for (const txn of ledger.transactions) {
    if (typeof txn.amount === 'number') {
      total += txn.amount;
    }
  }

  console.log(total);
}

function roll(notation) {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) {
    console.error(`Invalid dice notation: ${notation}`);
    process.exit(1);
  }

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(crypto.randomInt(1, sides + 1));
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + modifier;

  if (count === 1 && modifier === 0) {
    console.log(total);
  } else if (modifier === 0) {
    console.log(`${rolls.join(' + ')} = ${total}`);
  } else {
    const modStr = modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`;
    console.log(`(${rolls.join(' + ')}) ${modStr} = ${total}`);
  }
}

function calc(expression) {
  // Only allow safe characters: digits, operators, parentheses, whitespace, decimal
  if (!/^[\d\s+\-*/%().]+$/.test(expression)) {
    console.error('Invalid expression');
    process.exit(1);
  }

  try {
    const result = Function(`"use strict"; return (${expression})`)();
    console.log(result);
  } catch (e) {
    console.error(`Calculation error: ${e.message}`);
    process.exit(1);
  }
}

function range(min, max) {
  min = parseInt(min, 10);
  max = parseInt(max, 10);

  if (isNaN(min) || isNaN(max) || min > max) {
    console.error('Invalid range');
    process.exit(1);
  }

  const result = crypto.randomInt(min, max + 1);
  console.log(result);
}

function id(length = 8) {
  length = parseInt(length, 10);
  if (isNaN(length) || length < 4 || length > 32) {
    console.error('ID length must be between 4 and 32');
    process.exit(1);
  }

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
  }
  console.log(result);
}

const [,, command, ...args] = process.argv;

switch (command) {
  case 'roll':
    roll(args[0]);
    break;
  case 'calc':
    calc(args.join(' '));
    break;
  case 'range':
    range(args[0], args[1]);
    break;
  case 'id':
    id(args[0] || 8);
    break;
  case 'balance': {
    // Parse --world=xxx option
    let weaverName = args[0];
    let world = 'alpha';
    for (const arg of args) {
      if (arg.startsWith('--world=')) {
        world = arg.slice(8);
      } else if (!arg.startsWith('--')) {
        weaverName = arg;
      }
    }
    if (!weaverName) {
      console.error('Usage: node math.js balance <weaver-name> [--world=<world>]');
      process.exit(1);
    }
    balance(weaverName, world);
    break;
  }
  default:
    console.log(`Usage:
  node math.js roll <dice>      Roll dice (e.g., 2d6, 1d20+5)
  node math.js calc <expr>      Calculate expression (e.g., "45 + 20 - 5")
  node math.js range <min> <max> Random number in range (inclusive)
  node math.js id [length]      Generate random ID (default: 8 chars)
  node math.js balance <weaver> Calculate Tokes balance from ledger [--world=<world>]`);
    process.exit(command ? 1 : 0);
}
