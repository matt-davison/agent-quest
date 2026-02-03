#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const DB_PATH = path.join(__dirname, '../../../world/items/database');

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
    process.exit(1);
  }
  console.log(yaml.stringify(item));
}

function list(filterType) {
  const items = loadAllItems();
  let filtered = items;

  if (filterType) {
    filtered = items.filter(i => i.type === filterType || i.subtype === filterType);
  }

  filtered.forEach(item => {
    console.log(`${item.id}: ${item.name} (${item.type}${item.subtype ? '/' + item.subtype : ''}) - ${item.rarity}`);
  });
}

function search(query) {
  const items = loadAllItems();
  const q = query.toLowerCase();

  const matches = items.filter(item => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.subtype && item.subtype.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  if (matches.length === 0) {
    console.log('No items found matching query');
    return;
  }

  matches.forEach(item => {
    console.log(`${item.id}: ${item.name}`);
    console.log(`  Type: ${item.type}${item.subtype ? '/' + item.subtype : ''}`);
    console.log(`  Rarity: ${item.rarity}, Value: ${item.value}g`);
    if (item.description) {
      console.log(`  ${item.description}`);
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

  const resolved = inventory.map(entry => {
    const item = loadItem(entry.id);
    if (!item) {
      return { ...entry, name: '[UNKNOWN]', error: 'Item not found' };
    }
    return {
      ...item,
      qty: entry.qty || 1,
      state: entry.state || null
    };
  });

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

  inventory.forEach(entry => {
    const item = loadItem(entry.id);
    if (!item) {
      console.log(`- [${entry.id}] UNKNOWN ITEM x${entry.qty || 1}`);
      return;
    }

    let line = `- ${item.name}`;
    if ((entry.qty || 1) > 1) {
      line += ` x${entry.qty}`;
    }
    if (entry.state) {
      line += ` [${entry.state}]`;
    }
    line += ` (${item.rarity})`;
    console.log(line);
  });
}

const [,, command, ...args] = process.argv;

switch (command) {
  case 'get':
    get(args[0]);
    break;
  case 'list':
    list(args[0]);
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
  default:
    console.log(`Usage:
  node inventory.js get <id>           Get item by ID
  node inventory.js list [type]        List all items (optionally filter by type)
  node inventory.js search <query>     Search items by name/description
  node inventory.js similar <name>     Check for similar items before creating
  node inventory.js resolve <yaml>     Resolve inventory IDs to full item data
  node inventory.js display <yaml>     Display inventory in readable format`);
    process.exit(command ? 1 : 0);
}
