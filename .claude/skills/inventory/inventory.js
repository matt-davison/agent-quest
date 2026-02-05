#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Parse --world argument from command line
function parseWorldArg() {
  const worldArg = process.argv.find(arg => arg.startsWith('--world='));
  if (!worldArg) {
    console.error('Error: --world parameter is required');
    console.error('Usage: node inventory.js --world=<world-id> <command> [args]');
    console.error('Example: node inventory.js --world=alpha list');
    process.exit(1);
  }
  return worldArg.split('=')[1];
}

const WORLD_ID = parseWorldArg();
const PROJECT_ROOT = path.join(__dirname, '../../..');
const DB_PATH = path.join(PROJECT_ROOT, 'worlds', WORLD_ID, 'items/database');

/**
 * Parse command line arguments in --flag=value format
 */
function parseArgs(args) {
  const result = { positional: [], flags: {} };
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      result.flags[key] = value || true;
    } else {
      result.positional.push(arg);
    }
  }
  return result;
}

function loadItem(id) {
  const filePath = path.join(DB_PATH, `${id}.yaml`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(content);
}

function loadAllItems() {
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  const files = fs.readdirSync(DB_PATH).filter(f => f.endsWith('.yaml'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(DB_PATH, f), 'utf8');
    return yaml.parse(content);
  });
}

function get(id) {
  const item = loadItem(id);
  if (!item) {
    console.error(`Item not found: ${id}`);
    console.error(`\nUse 'similar' command to find valid IDs:`);
    console.error(`  node inventory.js similar "${id}"`);
    process.exit(1);
  }
  console.log(yaml.stringify(item));
}

/**
 * List items with optional filtering
 * Supports: --type, --subtype, --rarity, --tier, --tags, --tags-all
 */
function list(args) {
  const { positional, flags } = parseArgs(args);
  const items = loadAllItems();
  let filtered = items;

  // Legacy support: first positional arg as type filter
  if (positional[0]) {
    filtered = filtered.filter(i => i.type === positional[0] || i.subtype === positional[0]);
  }

  // Type filter
  if (flags.type) {
    filtered = filtered.filter(i => i.type === flags.type);
  }

  // Subtype filter
  if (flags.subtype) {
    filtered = filtered.filter(i => i.subtype === flags.subtype);
  }

  // Rarity filter
  if (flags.rarity) {
    filtered = filtered.filter(i => i.rarity === flags.rarity);
  }

  // Tier filter (items at or below specified tier)
  if (flags.tier) {
    const maxTier = parseInt(flags.tier, 10);
    filtered = filtered.filter(i => (i.tier || 1) <= maxTier);
  }

  // Tags filter (OR logic: any tag matches)
  if (flags.tags) {
    const searchTags = flags.tags.split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(i => {
      const itemTags = (i.tags || []).map(t => t.toLowerCase());
      return searchTags.some(st => itemTags.includes(st));
    });
  }

  // Tags-all filter (AND logic: all tags must match)
  if (flags['tags-all']) {
    const searchTags = flags['tags-all'].split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(i => {
      const itemTags = (i.tags || []).map(t => t.toLowerCase());
      return searchTags.every(st => itemTags.includes(st));
    });
  }

  if (filtered.length === 0) {
    console.log('No items match the filter criteria.');
    return;
  }

  // Sort by tier then name
  filtered.sort((a, b) => {
    const tierDiff = (a.tier || 1) - (b.tier || 1);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });

  filtered.forEach(item => {
    const tierStr = item.tier ? `T${item.tier}` : 'T1';
    const tagsStr = (item.tags || []).join(', ');
    console.log(`${item.id}: ${item.name} (${item.type}${item.subtype ? '/' + item.subtype : ''}) - ${item.rarity} ${tierStr}`);
    if (tagsStr) {
      console.log(`   tags: ${tagsStr}`);
    }
  });

  console.log(`\n${filtered.length} item(s) found.`);
}

function search(query) {
  const items = loadAllItems();
  const q = query.toLowerCase();

  const matches = items.filter(item => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.subtype && item.subtype.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  if (matches.length === 0) {
    console.log('No items found matching query');
    return;
  }

  matches.forEach(item => {
    console.log(`${item.id}: ${item.name}`);
    console.log(`  Type: ${item.type}${item.subtype ? '/' + item.subtype : ''}`);
    console.log(`  Rarity: ${item.rarity}, Tier: ${item.tier || 1}, Value: ${item.value}g`);
    if (item.tags && item.tags.length > 0) {
      console.log(`  Tags: ${item.tags.join(', ')}`);
    }
    if (item.description) {
      console.log(`  ${item.description.split('\n')[0]}`);
    }
    console.log('');
  });
}

function similar(name) {
  const items = loadAllItems();
  const q = name.toLowerCase();

  // Calculate similarity score
  const scored = items.map(item => {
    const itemName = item.name.toLowerCase();
    let score = 0;

    // Exact match
    if (itemName === q) score = 100;
    // Contains query
    else if (itemName.includes(q)) score = 80;
    // Query contains item name
    else if (q.includes(itemName)) score = 70;
    // Word overlap
    else {
      const queryWords = q.split(/\s+/);
      const itemWords = itemName.split(/\s+/);
      const overlap = queryWords.filter(w => itemWords.some(iw => iw.includes(w) || w.includes(iw)));
      score = (overlap.length / Math.max(queryWords.length, itemWords.length)) * 60;
    }

    return { item, score };
  });

  const matches = scored.filter(s => s.score > 30).sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    console.log('No similar items found. Safe to create new item.');
    process.exit(0);
  }

  console.log('Similar items found:');
  matches.slice(0, 5).forEach(({ item, score }) => {
    console.log(`  ${item.id}: ${item.name} (${Math.round(score)}% match)`);
  });
  console.log('\nConsider using an existing item ID instead of creating a new one.');
}

function resolve(inventoryYaml) {
  // Parse inventory format: list of {id, qty, state?}
  let inventory;
  try {
    inventory = yaml.parse(inventoryYaml);
  } catch (e) {
    console.error('Invalid inventory YAML');
    process.exit(1);
  }

  if (!Array.isArray(inventory)) {
    console.error('Inventory must be an array');
    process.exit(1);
  }

  let hasUnknown = false;
  const resolved = inventory.map(entry => {
    const item = loadItem(entry.id);
    if (!item) {
      hasUnknown = true;
      console.error(`\n⚠️  WARNING: Item "${entry.id}" not found in database!`);
      console.error(`   Use 'similar' command to find valid IDs:`);
      console.error(`   node inventory.js similar "${entry.id}"\n`);
      return { ...entry, name: '[UNKNOWN]', error: 'Item not found in database' };
    }
    return {
      ...item,
      qty: entry.qty || 1,
      state: entry.state || null
    };
  });

  if (hasUnknown) {
    console.error('---');
  }
  console.log(yaml.stringify(resolved));
}

function display(inventoryYaml) {
  // Parse and display inventory in readable format
  let inventory;
  try {
    inventory = yaml.parse(inventoryYaml);
  } catch (e) {
    console.error('Invalid inventory YAML');
    process.exit(1);
  }

  if (!Array.isArray(inventory)) {
    console.error('Inventory must be an array');
    process.exit(1);
  }

  if (inventory.length === 0) {
    console.log('Inventory is empty.');
    return;
  }

  let hasUnknown = false;
  inventory.forEach(entry => {
    const item = loadItem(entry.id);
    if (!item) {
      hasUnknown = true;
      console.log(`- ⚠️  [${entry.id}] UNKNOWN ITEM x${entry.qty || 1}`);
      console.log(`     WARNING: This item ID is not in the database!`);
      return;
    }

    let line = `- ${item.name}`;
    if ((entry.qty || 1) > 1) {
      line += ` x${entry.qty}`;
    }
    if (entry.state) {
      line += ` [${entry.state}]`;
    }
    line += ` (${item.rarity}, T${item.tier || 1})`;
    console.log(line);
  });

  if (hasUnknown) {
    console.error(`\n⚠️  Some items are not in the database!`);
    console.error(`   Use 'node inventory.js similar "<name>"' to find valid IDs.`);
  }
}

/**
 * Validate inventory items against the database
 */
function validate(inventoryYaml) {
  let inventory;
  try {
    inventory = yaml.parse(inventoryYaml);
  } catch (e) {
    console.error('Invalid inventory YAML');
    process.exit(1);
  }

  if (!Array.isArray(inventory)) {
    console.error('Inventory must be an array');
    process.exit(1);
  }

  if (inventory.length === 0) {
    console.log('✅ Inventory is empty - nothing to validate.');
    return;
  }

  let errors = 0;
  let valid = 0;

  inventory.forEach(entry => {
    const item = loadItem(entry.id);
    if (!item) {
      errors++;
      console.log(`❌ INVALID: "${entry.id}" not found in database`);

      // Try to find similar items
      const items = loadAllItems();
      const q = entry.id.toLowerCase();
      const similar = items
        .filter(i => i.name.toLowerCase().includes(q) || i.id.includes(q))
        .slice(0, 3);

      if (similar.length > 0) {
        console.log(`   Did you mean one of these?`);
        similar.forEach(s => console.log(`     - ${s.id}: ${s.name}`));
      }
    } else {
      valid++;
      console.log(`✅ VALID: ${item.id} (${item.name})`);
    }
  });

  console.log(`\n${valid} valid, ${errors} invalid`);

  if (errors > 0) {
    process.exit(1);
  }
}

/**
 * Show all available tags
 */
function tags() {
  const items = loadAllItems();
  const tagCounts = {};

  items.forEach(item => {
    (item.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  console.log('Available tags:\n');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} item(s)`);
    });
}

// Filter out --world argument and parse remaining args
const filteredArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--world='));
const [command, ...args] = filteredArgs;

switch (command) {
  case 'get':
    get(args[0]);
    break;
  case 'list':
    list(args);
    break;
  case 'search':
    search(args.join(' '));
    break;
  case 'similar':
    similar(args.join(' '));
    break;
  case 'resolve':
    resolve(args.join(' '));
    break;
  case 'display':
    display(args.join(' '));
    break;
  case 'validate':
    validate(args.join(' '));
    break;
  case 'tags':
    tags();
    break;
  default:
    console.log(`Usage:
  node inventory.js --world=<world> get <id>              Get item by ID
  node inventory.js --world=<world> list [filters]        List items with optional filters
  node inventory.js --world=<world> search <query>        Search items by name/description/tags
  node inventory.js --world=<world> similar <name>        Check for similar items before creating
  node inventory.js --world=<world> resolve <yaml>        Resolve inventory IDs to full item data
  node inventory.js --world=<world> display <yaml>        Display inventory in readable format
  node inventory.js --world=<world> validate <yaml>       Validate inventory items exist in database
  node inventory.js --world=<world> tags                  Show all available tags

Required:
  --world=<world>       World ID (e.g., alpha)

List Filters:
  --type=<type>         Filter by type (weapon, armor, consumable, quest_item, misc)
  --subtype=<subtype>   Filter by subtype (melee, ranged, light, medium, scroll, etc.)
  --rarity=<rarity>     Filter by rarity (common, uncommon, rare, legendary)
  --tier=<n>            Filter by tier (items at or below tier n)
  --tags=<tag1,tag2>    Filter by tags (OR logic: any tag matches)
  --tags-all=<t1,t2>    Filter by tags (AND logic: all tags must match)

Examples:
  node inventory.js list --type=weapon
  node inventory.js list --rarity=rare --tier=5
  node inventory.js list --tags=healing,consumable
  node inventory.js list --tags-all=magic,starter`);
    process.exit(command ? 1 : 0);
}
