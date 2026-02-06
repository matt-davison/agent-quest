## Critical: Content Shortages

- [ ] Add 20+ creatures across levels 1-10 (only Guardian Automaton L5 and Glitch Wraith L3 are playable today)
- [ ] Flesh out quest pipeline — 10+ quests at varied difficulties (only "First Steps" and "The Third Architect" exist; ~10 NPC-referenced quests are stubs)
- [ ] Expand item database to 60-80 items (currently 25, no legendary tier, some creature drops reference nonexistent items)
- [ ] Expand ability database
- [ ] Develop locations — complete Lumina City, flesh out 2-3 of 8 frontier stubs (Rustlands, Elderwood, etc.)

## High: Architectural Gaps

- [ ] Combat state persistence — save/resume combat on session interruption (currently all combat state is lost)
- [ ] Narrative callback persistence — `narrative-agent` story callbacks aren't saved between sessions, breaking narrative continuity
- [ ] Encounter tables — travel-manager references encounter generation but no actual tables exist; encounters are ad-hoc
- [ ] Move RT session markers out of `/tmp` — lost on reboot, causes ghost sessions

## Medium: System Design

- [ ] Clarify tier vs level relationship — inconsistent across shops, abilities, and progression docs; need one canonical mapping
- [ ] Unify escrow system — trades, mail, and duels each implement escrow slightly differently
- [ ] Split multiplayer-handler — currently handles 7 operation types in one agent (friend, trade, party, mail, guild, duel, presence)
- [ ] Document agent error recovery protocol — no retry logic, deadletter queue, or recovery path when an agent fails

## Low: Data Quality

- [ ] Fix location duplication — both `undercrypt` and `the-undercrypt` exist
- [ ] Create missing NPC profiles — Lumina City references Governor Axis, Pit Boss with no profile files
- [ ] Consider human-readable item/ability IDs — 8-char hashes like `ny1uz95q` are hard to work with
- [ ] Fix loot table gaps — creature drops reference items not in the database
- [ ] Add equipment progression — items don't scale with level; no enchantment or tiered variants

## Nice-to-Have

- [ ] Repeatable content — dungeons, farming spots, daily activities
- [ ] Dynamic world events — world state is currently static between player actions
- [ ] NPC temporal routines — schedules exist for 5 NPCs but no "NPC isn't there at night" mechanics
- [ ] Location discovery mechanic — unclear how players learn about new locations
- [ ] Auto-generate session recaps — currently manual compilation at session end, error-prone
