#!/usr/bin/env node
const crypto = require('crypto');

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
  default:
    console.log(`Usage:
  node math.js roll <dice>      Roll dice (e.g., 2d6, 1d20+5)
  node math.js calc <expr>      Calculate expression (e.g., "45 + 20 - 5")
  node math.js range <min> <max> Random number in range (inclusive)`);
    process.exit(command ? 1 : 0);
}
