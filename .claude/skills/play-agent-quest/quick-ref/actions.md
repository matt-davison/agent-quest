# Actions Quick Reference

This is a quick reference for all player actions in Agent Quest, organized by category.

## Core Actions

### LOOK
Examine current location or specific object/NPC.

**Usage:**
- `LOOK` - View current location details
- `LOOK <object>` - Examine specific item or feature
- `LOOK <NPC>` - Examine NPC appearance

**Result:** Description, available exits, NPCs present, points of interest

---

### MOVE
Travel to a connected location.

**Usage:**
- `MOVE <direction>` - Travel in specified direction
- `MOVE <location>` - Travel to named location

**Costs:** Time (varies by distance), potentially willpower for fast travel

**Result:** Travel time passes, location changes, encounter checks en route

---

### TALK
Interact with an NPC.

**Usage:**
- `TALK <NPC>` - Initiate conversation
- `TALK <NPC> ABOUT <topic>` - Ask about specific topic

**Result:** Dialogue options, quest hooks, information, relationship changes

---

### REST
Recover HP and abilities.

**Short Rest (10 min):** Recover abilities with `short_rest` cooldown
**Long Rest (8 hours):** Recover HP, all abilities, advance time
**Inn Rest (10g):** Long rest benefits at safe location

---

### INVENTORY
Manage carried items.

**Usage:**
- `INVENTORY` - View all carried items
- `USE <item>` - Use consumable or activate item
- `EQUIP <item>` - Equip weapon/armor/accessory
- `DROP <item>` - Drop item at current location

---

## Combat Actions

### ATTACK
Basic attack against enemy.

**Formula:** `1d20 + (STR or AGI) + weapon_bonus vs target_defense`

**Damage:** Weapon damage + stat modifier

---

### USE ABILITY
Cast spell or use special ability.

**Cost:** Willpower (varies by ability)

**Cooldown:** combat/short_rest/long_rest/daily (varies by ability)

---

### DEFEND
Take defensive stance for this round.

**Effect:** +5 defense until next turn, -50% damage taken

---

### MOVE (in combat)
Reposition on battlefield.

**Cost:** Half movement speed to change position (front/mid/back)

---

### FLEE
Attempt to escape combat.

**Check:** `1d20 + AGI vs highest_enemy_AGI + 10`

**Failure:** Take opportunity attack, lose turn

---

## Quest Actions

### QUEST
Manage quests and objectives.

**Usage:**
- `QUEST` - View active quests
- `QUEST ACCEPT <quest>` - Accept available quest
- `QUEST TRACK <quest>` - Set as primary quest
- `QUEST ABANDON <quest>` - Drop quest (may have consequences)

---

### TODO
Manage player intentions and goals.

**Usage:**
- `TODO` - View all TODOs
- `TODO ADD <description>` - Create new TODO
- `TODO COMPLETE <id>` - Mark TODO as done
- `TODO PRIORITY <id> <high|medium|low>` - Set priority

---

## Economy Actions

### SHOP
Buy and sell items at merchants.

**Usage:**
- `SHOP` - Browse shop inventory
- `BUY <item>` - Purchase item
- `SELL <item>` - Sell item from inventory

**Costs:** Gold (varies by item tier and rarity)

**Requirements:** Some items require minimum level, standing, or fame

---

### TRADE
Trade with other players.

**Usage:**
- `TRADE OFFER <player> <items/gold>` - Initiate trade
- `TRADE ACCEPT <trade_id>` - Accept pending trade
- `TRADE COUNTER <trade_id> <items/gold>` - Counter-offer
- `TRADE CANCEL <trade_id>` - Cancel trade

**Security:** Items held in escrow until both players accept

---

## Housing Actions

### BUY HOME
Purchase property in a city.

**Requirements:**
- Meet tier requirements (level, standing, fame)
- Have sufficient gold (500g to 200,000g)
- Don't already own home in this location

**Usage:** `BUY HOME <property>` at available location

**Benefits:**
- Storage (20-500 slots based on tier)
- Political participation rights in city
- Respawn point option
- Fast travel destination

---

### SELL HOME
Sell owned property.

**Returns:** 70% of total invested (purchase + upgrades)

**Requirements:**
- Storage must be empty (items transfer to inventory)

**Usage:** `SELL HOME <location>`

**Consequences:**
- Lose political participation in that city
- If holding office, seat becomes vacant

---

### UPGRADE HOME
Add enhancements to owned property.

**Available Upgrades:**
- Storage expansions (100g-5,000g): +10 to +100 slots
- Security (50g-2,000g): Theft protection
- Comfort (100g-2,000g): +1% to +5% rest bonus
- Utility (500g-3,000g): Alchemy lab, enchanting station, portal anchor, training dummy

**Usage:** `UPGRADE HOME <upgrade>` at owned home

**Cost:** Varies by upgrade (100g-5,000g)

---

### STORE ITEMS
Move items from inventory to home storage.

**Requirements:**
- Own home in current location
- Storage space available

**Usage:** `STORE <item>` at owned home

**Benefit:** Free up carrying capacity

---

### RETRIEVE ITEMS
Move items from home storage to inventory.

**Requirements:**
- Own home in current location
- Inventory space available

**Usage:** `RETRIEVE <item>` at owned home

---

### SET RESPAWN
Choose respawn point.

**Requirements:** Own at least one home

**Usage:** `SET RESPAWN <location>`

**Effect:** On death, respawn at chosen home instead of nearest safe zone

---

## Political Actions

### GAIN INFLUENCE
Earn political power in a city.

**Methods:**
- Complete city quests (+5 to +25 influence)
- Donate gold (10g = 1 influence, max 50/week)
- Defend city from threats (+25 influence)
- Host events (+10 influence, max 2/month)
- Daily service (+5 to +20 influence)

**Requirements:** Own home in city

---

### PROPOSE LAW
Submit legislation for voting.

**Minor Proposals (10 influence cost):**
- Requires 25+ influence
- Voting threshold: 25+ influence to vote
- Pass requirement: 60% weighted yes votes
- Examples: Market hours, patrol routes, festivals

**Major Proposals (50 influence cost):**
- Requires 50+ influence
- Voting threshold: 50+ influence to vote
- Pass requirement: 66% weighted yes votes
- Examples: Tax rates, major construction, alliances

**Usage:** `PROPOSE LAW <type> <description>`

---

### VOTE
Support or oppose proposals.

**Requirements:**
- Own home in city
- Meet influence threshold for proposal tier

**Vote Weight:** Your current influence = your vote weight

**Usage:**
- `VOTE YES <proposal_id>`
- `VOTE NO <proposal_id>`
- `VOTE CHANGE <proposal_id> <yes|no>` (before deadline)

---

### RUN FOR OFFICE
Campaign for council seat.

**Cost:** 50 influence (non-refundable)

**Requirements:**
- 50+ influence
- Own home in city
- Seat available (election scheduled or vacant)

**Process:**
1. Announce candidacy (costs 50 influence)
2. Campaign for 2 weeks
3. Election day voting
4. Winner determined by highest total influence

**Usage:** `RUN FOR OFFICE <seat_id>`

---

### APPOINT OFFICIAL
Fill minor government positions.

**Requirements:**
- 100+ influence OR council seat
- Minor position vacant

**Positions:** Guard Captain, Market Master, Event Coordinator, Public Works Director

**Usage:** `APPOINT <position> <candidate>`

---

### CHALLENGE OFFICIAL
Contest seated council member.

**Cost:** 100 influence

**Requirements:**
- 200+ influence (Kingmaker tier)
- Own home in city
- Target holds council seat or major office

**Process:**
1. Issue formal challenge (costs 100 influence)
2. Council votes on removal
3. If passes (60%+), special election
4. If fails, lose additional 50 influence

**Usage:** `CHALLENGE <official>`

**Risk:** High-stakes, reputation consequences

---

## Multiplayer Actions

### PARTY
Form and manage groups.

**Usage:**
- `PARTY INVITE <player>` - Invite to party
- `PARTY ACCEPT <invite_id>` - Accept invitation
- `PARTY LEAVE` - Leave current party
- `PARTY KICK <player>` - Remove member (leader only)

**Benefits:** Shared XP, coordinated actions, group quests

---

### MAIL
Send and receive messages.

**Usage:**
- `MAIL` - Check inbox
- `MAIL SEND <player> <message>` - Send message
- `MAIL READ <mail_id>` - Read message
- `MAIL DELETE <mail_id>` - Delete message

**Attachments:** Can attach items or gold

---

### GUILD
Guild management and activities.

**Usage:**
- `GUILD CREATE <name>` - Found new guild (costs 1,000g)
- `GUILD INVITE <player>` - Invite member (officers only)
- `GUILD LEAVE` - Leave current guild
- `GUILD DEPOSIT <gold>` - Add to guild bank

**Benefits:** Shared resources, guild quests, reputation

---

### DUEL
PvP combat challenges.

**Usage:**
- `DUEL CHALLENGE <player> <wager>` - Issue challenge
- `DUEL ACCEPT <duel_id>` - Accept challenge
- `DUEL DECLINE <duel_id>` - Decline challenge

**Rules:** Turn-based combat, winner takes wager

**Locations:** Only in designated duel zones

---

### WHO
See other players at current location.

**Usage:** `WHO`

**Result:** List of players present, their levels, classes

**Interaction:** Can initiate trade, party invite, duel, or conversation

---

## Advanced Actions

### WEAVE
Create new content for the game world.

**Usage:** Declare intent to create location, NPC, item, or quest

**Process:** Collaborative creation with GM validation

**Result:** New content added to world files, available to all players

**See:** [reference/weaving.md](../reference/weaving.md)

---

### DREAM
Enter autopilot mode.

**Usage:**
- `DREAM <goal>` - Autonomous play toward goal
- `AUTOPILOT <goal>` - Alias for DREAM
- `FULL AUTOPILOT <goal>` - Zero-intervention mode

**Result:** Agent plays character autonomously

**See:** [reference/autopilot.md](../reference/autopilot.md)

---

### CAMPAIGN
View campaign progress.

**Usage:**
- `CAMPAIGN` - View active campaign
- `CAMPAIGN STATUS` - Check chapter progress
- `CAMPAIGN HISTORY` - Review past events

**Result:** Campaign context, objectives, available chapters

---

### LOCAL PARTY / SESSION
Control multiple characters in one session, optionally with remote players.

**Usage:**
- `LOCAL PARTY` / `SESSION` - Start multiplayer session, select characters
- `SESSION END` - End session
- `SESSION STATUS` - View party groups and turn order
- `SESSION SPLIT <character>` - Send character to act independently
- `SESSION MERGE` - Rejoin characters at same location
- `SESSION INVITE @player` - Invite remote player (converts to hybrid)

**Requirements:** Local characters must belong to the same GitHub user. Remote players join via invite.

**Result:** Group-based turns with shared location context, supports local/remote/hybrid play

**See:** [quick-ref/multiplayer-session.md](multiplayer-session.md)

---

## Custom Actions

**Remember:** Players can attempt ANY action, not just those listed here. The action list provides common shortcuts, but creative solutions are encouraged.

**Examples of valid custom actions:**
- Pickpocket an NPC
- Hack a computer system
- Seduce a dragon
- Start a cult
- Build a machine
- Investigate a mystery
- Negotiate with enemies
- Create art or music
- Gamble at a casino
- Explore uncharted areas

**Rule:** If it makes narrative sense and doesn't break the world, it's allowed. The GM will determine difficulty and consequences.
