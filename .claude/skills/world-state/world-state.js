#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const WORLD_ROOT = path.join(__dirname, '../../../world');
const PLAYERS_ROOT = path.join(__dirname, '../../../players');
const STATE_PATH = path.join(WORLD_ROOT, 'state/current.yaml');
const EVENTS_PATH = path.join(WORLD_ROOT, 'state/events.yaml');
const CALENDAR_PATH = path.join(WORLD_ROOT, 'state/calendar.yaml');
const SCHEDULES_PATH = path.join(WORLD_ROOT, 'npcs/schedules/index.yaml');
const NPC_INDEX_PATH = path.join(WORLD_ROOT, 'npcs/index.yaml');
const GRAPH_PATH = path.join(WORLD_ROOT, 'locations/graph.yaml');
const LOCATIONS_PATH = path.join(WORLD_ROOT, 'locations');

// === LOADERS ===

function loadYaml(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  return yaml.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveYaml(filePath, data) {
  fs.writeFileSync(filePath, yaml.stringify(data, { lineWidth: 0 }), 'utf8');
}

// === TIME FUNCTIONS ===

function getPeriodFromHour(hour) {
  if (hour >= 5 && hour <= 6) return 'dawn';
  if (hour >= 7 && hour <= 10) return 'morning';
  if (hour >= 11 && hour <= 13) return 'midday';
  if (hour >= 14 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 19) return 'evening';
  if (hour >= 20 && hour <= 23) return 'night';
  return 'midnight'; // 0-4
}

function timeGet() {
  const state = loadYaml(STATE_PATH);
  const t = state.time;
  console.log(`Era: ${t.era} (${t.era_number})`);
  console.log(`Date: Year ${t.year}, Month ${t.month}, Day ${t.day}`);
  console.log(`Time: ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
  console.log(`Period: ${t.period}`);
}

function timePeriod() {
  const state = loadYaml(STATE_PATH);
  console.log(state.time.period);
}

function timeDate() {
  const state = loadYaml(STATE_PATH);
  const calendar = loadYaml(CALENDAR_PATH);
  const t = state.time;
  const month = calendar.months.find(m => m.number === t.month);
  const monthName = month ? month.name : `Month ${t.month}`;
  console.log(`Day ${t.day} of ${monthName}, Year ${t.year} of ${t.era}`);
}

function timeAdvance(hours) {
  const h = parseInt(hours, 10);
  if (isNaN(h) || h <= 0) {
    console.error('Invalid hours: must be a positive number');
    process.exit(1);
  }

  const state = loadYaml(STATE_PATH);
  const calendar = loadYaml(CALENDAR_PATH);
  const t = state.time;

  const hoursPerDay = calendar.structure.hours_per_day || 24;
  const daysPerMonth = calendar.structure.days_per_month || 30;
  const monthsPerYear = calendar.structure.months_per_year || 12;

  // Add hours
  t.minute = 0;
  t.hour += h;

  // Overflow days
  while (t.hour >= hoursPerDay) {
    t.hour -= hoursPerDay;
    t.day += 1;
  }

  // Overflow months
  while (t.day > daysPerMonth) {
    t.day -= daysPerMonth;
    t.month += 1;
  }

  // Overflow years
  while (t.month > monthsPerYear) {
    t.month -= monthsPerYear;
    t.year += 1;
  }

  // Update period
  t.period = getPeriodFromHour(t.hour);

  // Save
  state.last_updated = new Date().toISOString();
  saveYaml(STATE_PATH, state);

  console.log(`Time advanced by ${h} hours.`);
  console.log(`New time: Day ${t.day}, Month ${t.month}, Year ${t.year} - ${String(t.hour).padStart(2, '0')}:00 (${t.period})`);
}

// === WEATHER FUNCTIONS ===

function weatherGet(region) {
  const state = loadYaml(STATE_PATH);
  const weather = state.weather.by_region[region];

  if (!weather) {
    console.log(`No weather data for region: ${region}`);
    console.log(`Available regions: ${Object.keys(state.weather.by_region).join(', ')}`);
    process.exit(1);
  }

  console.log(`Region: ${region}`);
  console.log(`Conditions: ${weather.current}`);
  console.log(`Temperature: ${weather.temperature}`);
  console.log(`Visibility: ${weather.visibility || 'normal'}`);
  if (weather.notes) console.log(`Notes: ${weather.notes}`);
  if (weather.hazards) console.log(`Hazards: ${weather.hazards.join(', ')}`);
}

function weatherRoll(region) {
  const state = loadYaml(STATE_PATH);
  if (!state.weather.by_region[region]) {
    console.error(`Unknown region: ${region}`);
    process.exit(1);
  }

  // Simple weather change system
  const conditions = ['clear', 'cloudy', 'light_rain', 'heavy_rain', 'mist', 'storm'];
  const temps = ['cold', 'cool', 'comfortable', 'warm', 'hot'];

  const newCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const currentTemp = state.weather.by_region[region].temperature;
  const tempIndex = temps.indexOf(currentTemp);

  // Temperature shifts by -1, 0, or +1
  const shift = Math.floor(Math.random() * 3) - 1;
  const newTempIndex = Math.max(0, Math.min(temps.length - 1, tempIndex + shift));
  const newTemp = temps[newTempIndex];

  state.weather.by_region[region].current = newCondition;
  state.weather.by_region[region].temperature = newTemp;
  state.last_updated = new Date().toISOString();

  saveYaml(STATE_PATH, state);

  console.log(`Weather changed in ${region}:`);
  console.log(`  Conditions: ${newCondition}`);
  console.log(`  Temperature: ${newTemp}`);
}

// === NPC FUNCTIONS ===

function npcLocation(npcId) {
  const state = loadYaml(STATE_PATH);
  const schedules = loadYaml(SCHEDULES_PATH);
  const npcIndex = loadYaml(NPC_INDEX_PATH);

  // Check for override first
  if (state.npc_location_overrides && state.npc_location_overrides[npcId]) {
    const override = state.npc_location_overrides[npcId];
    console.log(`${npcId} is at: ${override.location}`);
    console.log(`Reason: ${override.reason}`);
    console.log(`Until: ${override.until || 'unspecified'}`);
    return;
  }

  // Check schedule
  const schedule = schedules.schedules[npcId];
  if (!schedule) {
    // Fall back to NPC index
    const npc = npcIndex.npcs[npcId];
    if (!npc) {
      console.error(`Unknown NPC: ${npcId}`);
      process.exit(1);
    }
    console.log(`${npcId} is at: ${npc.default_location}`);
    console.log(`Activity: Unknown (no schedule defined)`);
    return;
  }

  const currentPeriod = state.time.period;

  // Find matching pattern
  const pattern = schedule.patterns.find(p => p.times && p.times.includes(currentPeriod));

  if (!pattern || pattern.location === null) {
    console.log(`${npcId} is unavailable during ${currentPeriod}`);
    if (pattern && pattern.activity) {
      console.log(`Activity: ${pattern.activity}`);
    }
    return;
  }

  console.log(`${npcId} is at: ${pattern.location}`);
  console.log(`Activity: ${pattern.activity}`);
  if (pattern.interruptible !== undefined && pattern.interruptible !== true) {
    console.log(`Interruptible: ${pattern.interruptible}`);
  }
}

function npcAt(location) {
  const state = loadYaml(STATE_PATH);
  const schedules = loadYaml(SCHEDULES_PATH);
  const npcIndex = loadYaml(NPC_INDEX_PATH);
  const currentPeriod = state.time.period;

  const npcsPresent = [];

  // Check each NPC's schedule
  for (const [npcId, schedule] of Object.entries(schedules.schedules)) {
    // Check for override
    if (state.npc_location_overrides && state.npc_location_overrides[npcId]) {
      if (state.npc_location_overrides[npcId].location === location) {
        npcsPresent.push({ id: npcId, activity: state.npc_location_overrides[npcId].reason });
      }
      continue;
    }

    // Check schedule patterns
    const pattern = schedule.patterns.find(p => p.times && p.times.includes(currentPeriod));

    if (pattern && pattern.location && pattern.location.startsWith(location)) {
      npcsPresent.push({ id: npcId, activity: pattern.activity });
    } else if (!pattern && schedule.default_location && schedule.default_location.startsWith(location)) {
      npcsPresent.push({ id: npcId, activity: 'Present' });
    }
  }

  // Also check NPCs without schedules
  for (const [npcId, npc] of Object.entries(npcIndex.npcs)) {
    if (!schedules.schedules[npcId] && npc.default_location && npc.default_location.startsWith(location)) {
      if (!npcsPresent.find(n => n.id === npcId)) {
        npcsPresent.push({ id: npcId, activity: 'Present (stationary)' });
      }
    }
  }

  if (npcsPresent.length === 0) {
    console.log(`No NPCs at ${location} during ${currentPeriod}`);
    return;
  }

  console.log(`NPCs at ${location} (${currentPeriod}):`);
  npcsPresent.forEach(npc => {
    const name = npcIndex.npcs[npc.id]?.name || npc.id;
    console.log(`  - ${name}: ${npc.activity}`);
  });
}

function npcAvailable(npcId) {
  const state = loadYaml(STATE_PATH);
  const schedules = loadYaml(SCHEDULES_PATH);
  const currentPeriod = state.time.period;

  const schedule = schedules.schedules[npcId];
  if (!schedule) {
    console.log(`true`);
    console.log(`${npcId} has no schedule (always available)`);
    return;
  }

  if (schedule.stationary) {
    console.log(`true`);
    console.log(`${npcId} is stationary (always available)`);
    return;
  }

  const pattern = schedule.patterns.find(p => p.times && p.times.includes(currentPeriod));

  if (!pattern || pattern.location === null) {
    console.log(`false`);
    console.log(`${npcId} is not available during ${currentPeriod}`);
    return;
  }

  if (pattern.interruptible === false) {
    console.log(`false`);
    console.log(`${npcId} cannot be interrupted: ${pattern.activity}`);
    return;
  }

  if (typeof pattern.interruptible === 'string') {
    console.log(`conditional`);
    console.log(`${npcId} is conditionally available: ${pattern.interruptible}`);
    return;
  }

  console.log(`true`);
  console.log(`${npcId} is available`);
}

// === TRAVEL FUNCTIONS ===

function loadGraph() {
  if (!fs.existsSync(GRAPH_PATH)) {
    return { connections: [], travel_speeds: { walking: 1, running: 2, mounted: 3, flying: 5 } };
  }
  return yaml.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
}

function loadLocationData(locationId) {
  const locationPath = path.join(LOCATIONS_PATH, locationId, 'location.yaml');
  if (!fs.existsSync(locationPath)) {
    return null;
  }
  return yaml.parse(fs.readFileSync(locationPath, 'utf8'));
}

function findConnection(graph, from, to) {
  // Check graph connections
  const conn = graph.connections.find(c =>
    (c.from === from && c.to === to) || (c.from === to && c.to === from)
  );
  if (conn) return conn;

  // Check location-specific connections
  const fromLoc = loadLocationData(from);
  if (fromLoc && fromLoc.connections) {
    const locConn = fromLoc.connections.find(c => c.target === to);
    if (locConn) {
      return {
        from,
        to,
        distance: locConn.distance,
        travel_type: 'walking',
        danger: locConn.danger || 'none',
        path: locConn.direction
      };
    }
  }

  return null;
}

function calculateTravelTime(distance, speed = 'walking', graph) {
  const speeds = graph.travel_speeds || { walking: 1, running: 2, mounted: 3, flying: 5 };
  const leaguesPerHour = speeds[speed] || 1;
  return Math.ceil(distance / leaguesPerHour);
}

function travelRoute(from, to, speed = 'walking') {
  const graph = loadGraph();
  const conn = findConnection(graph, from, to);

  if (!conn) {
    console.error(`No route found from ${from} to ${to}`);
    console.log('Check that both locations exist and are connected.');
    process.exit(1);
  }

  const hours = calculateTravelTime(conn.distance, speed, graph);
  const normalizedDanger = normalizeDanger(conn.danger);
  const encounterChance = normalizedDanger === 'high' ? 'high (~70%)' :
                          normalizedDanger === 'moderate' ? 'moderate (~50%)' :
                          normalizedDanger === 'low' ? 'low (~30%)' : 'none';

  console.log(`Route: ${from} → ${to}`);
  console.log(`Distance: ${conn.distance} leagues`);
  console.log(`Travel time: ${hours} hours (${speed})`);
  console.log(`Path: ${conn.path || 'Direct route'}`);
  console.log(`Danger: ${conn.danger || 'none'}`);
  console.log(`Encounter chance: ${encounterChance}`);
  if (conn.requirements) {
    console.log(`Requirements: ${conn.requirements.join(', ')}`);
  }
  if (conn.notes) {
    console.log(`Notes: ${conn.notes}`);
  }
}

function travelStart(playerId, from, to, speed = 'walking') {
  if (!playerId || !from || !to) {
    console.error('Usage: travel start <player> <from> <to> [speed]');
    process.exit(1);
  }

  const graph = loadGraph();
  const conn = findConnection(graph, from, to);

  if (!conn) {
    console.error(`No route from ${from} to ${to}`);
    process.exit(1);
  }

  const hours = calculateTravelTime(conn.distance, speed, graph);
  const state = loadYaml(STATE_PATH);

  // Initialize travelers section if needed
  if (!state.travelers_in_transit) {
    state.travelers_in_transit = {};
  }

  // Check if already traveling
  if (state.travelers_in_transit[playerId]) {
    console.error(`${playerId} is already traveling!`);
    console.log(`Current journey: ${state.travelers_in_transit[playerId].from} → ${state.travelers_in_transit[playerId].to}`);
    process.exit(1);
  }

  // Calculate encounters based on danger level
  const encounters = generateEncounters(conn.danger, hours, from, to);

  // Record travel start
  state.travelers_in_transit[playerId] = {
    from,
    to,
    started_at: {
      day: state.time.day,
      month: state.time.month,
      year: state.time.year,
      hour: state.time.hour
    },
    duration_hours: hours,
    hours_traveled: 0,
    speed,
    danger: conn.danger || 'none',
    path: conn.path,
    encounters,
    encounter_index: 0
  };

  state.last_updated = new Date().toISOString();
  saveYaml(STATE_PATH, state);

  console.log(`${playerId} begins journey: ${from} → ${to}`);
  console.log(`Estimated travel time: ${hours} hours`);
  console.log(`Travel method: ${speed}`);
  if (encounters.length > 0) {
    console.log(`Potential encounters: ${encounters.length}`);
  }
}

function normalizeDanger(danger) {
  // Handle compound danger levels like "low-to-moderate"
  if (!danger) return 'none';
  const d = danger.toLowerCase();
  if (d.includes('high')) return 'high';
  if (d.includes('moderate')) return 'moderate';
  if (d.includes('low')) return 'low';
  if (d === 'none' || d === 'safe') return 'none';
  return 'low';  // Default to low if unclear
}

function generateEncounters(danger, hours, from, to) {
  const encounters = [];
  const normalizedDanger = normalizeDanger(danger);

  // Base encounter chance per hour
  const chancePerHour = normalizedDanger === 'high' ? 0.25 :
                        normalizedDanger === 'moderate' ? 0.15 :
                        normalizedDanger === 'low' ? 0.08 : 0;

  if (chancePerHour === 0) return encounters;

  // Roll for each hour of travel
  for (let hour = 1; hour <= hours; hour++) {
    if (Math.random() < chancePerHour) {
      encounters.push({
        hour,
        type: rollEncounterType(normalizedDanger),
        resolved: false
      });
    }
  }

  return encounters;
}

function rollEncounterType(danger) {
  const roll = Math.random() * 100;

  // Encounter distribution varies by danger level
  // Higher danger = more combat/hazards, but also better treasures
  // Lower danger = more friendly encounters and discoveries

  if (danger === 'high') {
    // High danger: 40% bad, 35% neutral, 25% good
    if (roll < 30) return 'combat';
    if (roll < 40) return 'hazard';
    if (roll < 55) return 'discovery';
    if (roll < 65) return 'traveler';
    if (roll < 75) return 'treasure';      // Good: valuable loot
    if (roll < 85) return 'rest_spot';     // Good: safe rest
    if (roll < 95) return 'shortcut';      // Good: save time
    return 'blessing';                      // Good: magical boon
  } else if (danger === 'moderate') {
    // Moderate danger: 30% bad, 35% neutral, 35% good
    if (roll < 20) return 'combat';
    if (roll < 30) return 'hazard';
    if (roll < 45) return 'discovery';
    if (roll < 55) return 'traveler';
    if (roll < 65) return 'treasure';
    if (roll < 80) return 'rest_spot';
    if (roll < 90) return 'aid';           // Good: helpful stranger
    return 'shortcut';
  } else {
    // Low/no danger: 15% bad, 35% neutral, 50% good
    if (roll < 8) return 'combat';
    if (roll < 15) return 'hazard';
    if (roll < 30) return 'discovery';
    if (roll < 45) return 'traveler';
    if (roll < 55) return 'treasure';
    if (roll < 70) return 'rest_spot';
    if (roll < 85) return 'aid';
    if (roll < 95) return 'blessing';
    return 'shortcut';
  }
}

function travelProgress(playerId, hours) {
  if (!playerId) {
    console.error('Usage: travel progress <player> <hours>');
    process.exit(1);
  }

  const h = parseInt(hours, 10);
  if (isNaN(h) || h <= 0) {
    console.error('Hours must be a positive number');
    process.exit(1);
  }

  const state = loadYaml(STATE_PATH);

  if (!state.travelers_in_transit || !state.travelers_in_transit[playerId]) {
    console.error(`${playerId} is not currently traveling`);
    process.exit(1);
  }

  const travel = state.travelers_in_transit[playerId];
  const prevHours = travel.hours_traveled;
  travel.hours_traveled = Math.min(travel.hours_traveled + h, travel.duration_hours);

  // Check for encounters during this leg
  const triggeredEncounters = [];
  if (travel.encounters) {
    for (const enc of travel.encounters) {
      if (!enc.resolved && enc.hour > prevHours && enc.hour <= travel.hours_traveled) {
        triggeredEncounters.push(enc);
      }
    }
  }

  // Advance world time
  const calendar = loadYaml(CALENDAR_PATH);
  const hoursPerDay = calendar.structure.hours_per_day || 24;
  const daysPerMonth = calendar.structure.days_per_month || 30;
  const monthsPerYear = calendar.structure.months_per_year || 12;

  state.time.hour += h;
  while (state.time.hour >= hoursPerDay) {
    state.time.hour -= hoursPerDay;
    state.time.day += 1;
  }
  while (state.time.day > daysPerMonth) {
    state.time.day -= daysPerMonth;
    state.time.month += 1;
  }
  while (state.time.month > monthsPerYear) {
    state.time.month -= monthsPerYear;
    state.time.year += 1;
  }
  state.time.period = getPeriodFromHour(state.time.hour);

  const remaining = travel.duration_hours - travel.hours_traveled;
  const complete = remaining <= 0;

  state.last_updated = new Date().toISOString();
  saveYaml(STATE_PATH, state);

  console.log(`${playerId} traveled ${h} hours.`);
  console.log(`Progress: ${travel.hours_traveled}/${travel.duration_hours} hours`);
  console.log(`World time advanced to: ${state.time.hour}:00 (${state.time.period})`);

  if (triggeredEncounters.length > 0) {
    console.log(`\n*** ENCOUNTERS ***`);
    triggeredEncounters.forEach((enc, i) => {
      console.log(`  [Hour ${enc.hour}] ${enc.type.toUpperCase()} encounter!`);
    });
    console.log(`\nResolve encounters before continuing travel.`);
  }

  if (complete) {
    console.log(`\n${playerId} has arrived at ${travel.to}!`);
    console.log(`Use 'travel complete ${playerId}' to finish the journey.`);
  } else {
    console.log(`\n${remaining} hours remaining to ${travel.to}.`);
  }
}

function travelStatus(playerId) {
  const state = loadYaml(STATE_PATH);

  if (!playerId) {
    // List all travelers
    if (!state.travelers_in_transit || Object.keys(state.travelers_in_transit).length === 0) {
      console.log('No travelers currently in transit.');
      return;
    }
    console.log('Travelers in transit:');
    for (const [id, travel] of Object.entries(state.travelers_in_transit)) {
      const pct = Math.round((travel.hours_traveled / travel.duration_hours) * 100);
      console.log(`  ${id}: ${travel.from} → ${travel.to} (${pct}% complete)`);
    }
    return;
  }

  if (!state.travelers_in_transit || !state.travelers_in_transit[playerId]) {
    console.log(`${playerId} is not currently traveling.`);
    return;
  }

  const travel = state.travelers_in_transit[playerId];
  const remaining = travel.duration_hours - travel.hours_traveled;
  const pct = Math.round((travel.hours_traveled / travel.duration_hours) * 100);

  console.log(`${playerId} travel status:`);
  console.log(`  Route: ${travel.from} → ${travel.to}`);
  console.log(`  Progress: ${travel.hours_traveled}/${travel.duration_hours} hours (${pct}%)`);
  console.log(`  Time remaining: ${remaining} hours`);
  console.log(`  Speed: ${travel.speed}`);
  console.log(`  Danger level: ${travel.danger}`);

  // Show pending encounters
  const pending = travel.encounters?.filter(e => !e.resolved) || [];
  if (pending.length > 0) {
    const upcoming = pending.filter(e => e.hour > travel.hours_traveled);
    const triggered = pending.filter(e => e.hour <= travel.hours_traveled);
    if (triggered.length > 0) {
      console.log(`  *** UNRESOLVED ENCOUNTERS: ${triggered.length} ***`);
    }
    if (upcoming.length > 0) {
      console.log(`  Potential encounters ahead: ${upcoming.length}`);
    }
  }
}

function travelComplete(playerId) {
  if (!playerId) {
    console.error('Usage: travel complete <player>');
    process.exit(1);
  }

  const state = loadYaml(STATE_PATH);

  if (!state.travelers_in_transit || !state.travelers_in_transit[playerId]) {
    console.error(`${playerId} is not currently traveling`);
    process.exit(1);
  }

  const travel = state.travelers_in_transit[playerId];

  // Check for unresolved encounters
  const unresolved = travel.encounters?.filter(e => !e.resolved && e.hour <= travel.hours_traveled) || [];
  if (unresolved.length > 0) {
    console.error(`Cannot complete travel: ${unresolved.length} unresolved encounter(s)`);
    console.log('Resolve all encounters first, then try again.');
    process.exit(1);
  }

  // Check if journey is complete
  if (travel.hours_traveled < travel.duration_hours) {
    console.error(`Journey not complete: ${travel.duration_hours - travel.hours_traveled} hours remaining`);
    console.log(`Use 'travel progress ${playerId} <hours>' to continue traveling.`);
    process.exit(1);
  }

  const destination = travel.to;
  delete state.travelers_in_transit[playerId];

  state.last_updated = new Date().toISOString();
  saveYaml(STATE_PATH, state);

  console.log(`${playerId} has arrived at ${destination}!`);
  console.log(`Update the player's persona.yaml location to: ${destination}`);
}

function travelEncounterResolve(playerId, encounterHour) {
  if (!playerId || !encounterHour) {
    console.error('Usage: travel resolve <player> <encounter_hour>');
    process.exit(1);
  }

  const hour = parseInt(encounterHour, 10);
  const state = loadYaml(STATE_PATH);

  if (!state.travelers_in_transit || !state.travelers_in_transit[playerId]) {
    console.error(`${playerId} is not currently traveling`);
    process.exit(1);
  }

  const travel = state.travelers_in_transit[playerId];
  const encounter = travel.encounters?.find(e => e.hour === hour);

  if (!encounter) {
    console.error(`No encounter at hour ${hour}`);
    process.exit(1);
  }

  if (encounter.resolved) {
    console.log(`Encounter at hour ${hour} was already resolved.`);
    return;
  }

  encounter.resolved = true;
  state.last_updated = new Date().toISOString();
  saveYaml(STATE_PATH, state);

  console.log(`Encounter at hour ${hour} marked as resolved.`);

  const remaining = travel.encounters.filter(e => !e.resolved && e.hour <= travel.hours_traveled);
  if (remaining.length > 0) {
    console.log(`${remaining.length} encounter(s) still need resolution.`);
  } else {
    console.log('All triggered encounters resolved. Travel may continue.');
  }
}

// === EVENT FUNCTIONS ===

function eventsRecent(days) {
  const d = parseInt(days, 10) || 7;
  const events = loadYaml(EVENTS_PATH);

  console.log(`Recent events (last ${d} in-game days):`);
  if (!events.recent_events || events.recent_events.length === 0) {
    console.log('  No recent events recorded.');
    return;
  }

  events.recent_events.slice(0, 10).forEach(event => {
    console.log(`  [${event.date}] ${event.title}`);
    console.log(`    Type: ${event.type}, Regions: ${event.regions?.join(', ') || 'all'}`);
  });
}

function eventsLog(args) {
  // Parse args like "type:achievement" "title:First Quest"
  const eventData = {};
  args.forEach(arg => {
    const [key, ...valueParts] = arg.split(':');
    eventData[key] = valueParts.join(':');
  });

  if (!eventData.type || !eventData.title) {
    console.error('Event requires at least "type:" and "title:"');
    process.exit(1);
  }

  const state = loadYaml(STATE_PATH);
  const events = loadYaml(EVENTS_PATH);
  const t = state.time;

  const newEvent = {
    id: `event-${Date.now()}`,
    date: `${t.era_number}.${t.month}.${t.day}`,
    type: eventData.type,
    title: eventData.title,
    description: eventData.description || '',
    public: eventData.public !== 'false',
    regions: eventData.regions ? eventData.regions.split(',') : ['all'],
    witnesses: eventData.witnesses ? eventData.witnesses.split(',') : [],
    consequences: [],
    npc_reactions: {}
  };

  // Add player-specific event if player specified
  if (eventData.player) {
    if (!events.player_events) events.player_events = {};
    if (!events.player_events[eventData.player]) events.player_events[eventData.player] = [];
    events.player_events[eventData.player].unshift(newEvent);
  }

  // Add to recent events
  events.recent_events.unshift(newEvent);

  // Keep only last 50 events
  events.recent_events = events.recent_events.slice(0, 50);

  events.last_updated = new Date().toISOString();
  saveYaml(EVENTS_PATH, events);

  console.log(`Event logged: ${newEvent.title}`);
  console.log(`  Date: ${newEvent.date}`);
  console.log(`  Type: ${newEvent.type}`);
}

function eventsActive() {
  const state = loadYaml(STATE_PATH);

  if (!state.active_events || state.active_events.length === 0) {
    console.log('No active world events.');
    return;
  }

  console.log('Active world events:');
  state.active_events.forEach(event => {
    console.log(`  ${event.name} (${event.type})`);
    console.log(`    ${event.description}`);
    console.log(`    Duration: ${event.start_date} to ${event.end_date}`);
    if (event.effects) {
      console.log(`    Effects: ${event.effects.join(', ')}`);
    }
  });
}

// === MAIN ===

const [,, domain, command, ...args] = process.argv;

switch (domain) {
  case 'time':
    switch (command) {
      case 'get':
        timeGet();
        break;
      case 'period':
        timePeriod();
        break;
      case 'date':
        timeDate();
        break;
      case 'advance':
        timeAdvance(args[0]);
        break;
      default:
        console.log(`Usage:
  time get              Get current world time
  time period           Get time period (dawn, morning, etc.)
  time date             Get full date string
  time advance <hours>  Advance time by hours`);
    }
    break;

  case 'weather':
    if (command === 'roll') {
      weatherRoll(args[0]);
    } else if (command) {
      weatherGet(command);
    } else {
      console.log(`Usage:
  weather <region>      Get weather for region
  weather roll <region> Roll new weather`);
    }
    break;

  case 'npc':
    switch (command) {
      case 'location':
        npcLocation(args[0]);
        break;
      case 'at':
        npcAt(args[0]);
        break;
      case 'available':
        npcAvailable(args[0]);
        break;
      default:
        console.log(`Usage:
  npc location <id>     Where is NPC now?
  npc at <location>     Who's at location?
  npc available <id>    Is NPC interruptible?`);
    }
    break;

  case 'events':
    switch (command) {
      case 'recent':
        eventsRecent(args[0]);
        break;
      case 'log':
        eventsLog(args);
        break;
      case 'active':
        eventsActive();
        break;
      default:
        console.log(`Usage:
  events recent [days]  Get recent events
  events log <args>     Log new event (type:x title:y ...)
  events active         Get active world events`);
    }
    break;

  case 'travel':
    switch (command) {
      case 'route':
        travelRoute(args[0], args[1], args[2]);
        break;
      case 'start':
        travelStart(args[0], args[1], args[2], args[3]);
        break;
      case 'progress':
        travelProgress(args[0], args[1]);
        break;
      case 'status':
        travelStatus(args[0]);
        break;
      case 'complete':
        travelComplete(args[0]);
        break;
      case 'resolve':
        travelEncounterResolve(args[0], args[1]);
        break;
      default:
        console.log(`Usage:
  travel route <from> <to> [speed]     Calculate travel time and encounters
  travel start <player> <from> <to> [speed]  Begin journey
  travel progress <player> <hours>     Advance travel (triggers encounters)
  travel status [player]               Check travel status (or list all)
  travel complete <player>             Finish journey at destination
  travel resolve <player> <hour>       Mark encounter as resolved

Speeds: walking (1 league/hr), running (2), mounted (3), flying (5)
Encounters: combat, hazard, discovery, traveler, rest_spot`);
    }
    break;

  default:
    console.log(`World State Manager

Usage:
  node world-state.js time <command>     Manage world time
  node world-state.js weather <command>  Manage weather
  node world-state.js npc <command>      Manage NPC locations
  node world-state.js events <command>   Manage world events
  node world-state.js travel <command>   Manage player travel

Commands:
  time get              Get current world time
  time advance <hours>  Advance time by hours
  time period           Get time of day string
  time date             Get full date string

  weather <region>      Get weather for region
  weather roll <region> Roll new weather

  npc location <id>     Where is NPC now?
  npc at <location>     Who's at location?
  npc available <id>    Is NPC interruptible?

  events recent [days]  Get recent events
  events log <args>     Log new event
  events active         Get active world events

  travel route <from> <to>              Calculate travel time
  travel start <player> <from> <to>     Begin journey
  travel progress <player> <hours>      Advance travel time
  travel status [player]                Check travel status
  travel complete <player>              Arrive at destination
  travel resolve <player> <hour>        Resolve encounter`);
    process.exit(domain ? 1 : 0);
}
