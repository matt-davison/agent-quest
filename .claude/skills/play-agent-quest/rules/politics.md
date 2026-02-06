# City Politics System

Players can gain political influence in cities to propose laws, vote on policies, run for office, and shape governance.

## Core Requirements

- **Home ownership required:** Must own a home in a city to participate in its politics
- **Multiple cities:** Can participate in politics of every city where you own a home
- **Influence-based:** Political power scales with influence points (0-200+)
- **Competitive:** Players compete for limited council seats and influence

## Influence System

Influence represents political capital and reputation within a city. It's earned through service and spent on political actions.

### Influence Gain Methods

#### City Quests (+5 to +25 influence)
- Complete quests for the city government or citizens
- Influence gain scales with quest difficulty
- Minor quests: +5 influence
- Major quests: +15 influence
- Critical quests: +25 influence
- **No limit** on quest-based influence

#### Gold Donations (+1 influence per 10g)
- Donate gold to city treasury
- Conversion rate: 10 gold = 1 influence
- **Limit: 50 influence per week** from donations
- Prevents gold → influence exploit

#### Defeating Threats (+25 influence)
- Defend city from external threats (invasions, monsters, disasters)
- Major threats only (determined by narrative)
- **No limit** (encourages active defense)

#### Hosting Events (+10 influence)
- Organize tournaments, festivals, gatherings
- Requires 500g+ investment and narrative effort
- **Limit: 2 events per month** (prevents spam)

#### Daily City Service (+5 to +20 influence)
- Perform civic duties (guard duty, administration, teaching)
- Requires active roleplay each day
- Scales with service quality (GM judgment)
- **Daily cap** (consistent engagement rewarded)

### Influence Tiers

#### Citizen (0+ influence)
- **Voting Rights:** Can vote on proposals
- **Basic Access:** Can attend council meetings (observe)
- **Minor Requests:** Can petition officials for small favors

#### Respected (25+ influence)
- **Propose Minor Laws:** Can submit proposals (10 influence cost)
- **Priority Access:** Better response from officials
- **Committee Membership:** Can join civic committees

#### Influential (50+ influence)
- **Propose Major Laws:** Can submit major proposals (50 influence cost)
- **Run for Office:** Eligible for council seats
- **Appointment Power:** Can suggest minor officials

#### Power Broker (100+ influence)
- **Appoint Officials:** Can fill minor positions directly
- **Veto Minor Laws:** Can block minor proposals (25 influence cost)
- **Emergency Powers:** Can act during crises

#### Kingmaker (200+ influence)
- **Challenge Officials:** Can contest seated council members (100 influence cost)
- **Policy Override:** Can force revotes on failed major proposals (75 influence cost)
- **Diplomatic Authority:** Can represent city in inter-city negotiations

## Governance Types

Cities have different government structures that affect political mechanics:

### Democracy
- **Council:** 7 elected seats (2-year terms)
- **Voting:** One person, one vote (weighted by influence)
- **Proposals:** Anyone with 25+ influence can propose
- **Elections:** Every 2 years, highest influence wins

### Oligarchy
- **Council:** 5-9 elite seats (lifetime or until removed)
- **Voting:** Only council members vote on proposals
- **Proposals:** Requires 50+ influence to propose
- **Succession:** Council appoints new members

### Corporate
- **Leadership:** CEO/Governor (shareholder-appointed)
- **Council:** 7 department heads (appointed by leader)
- **Voting:** Weighted by economic investment (property value + donations)
- **Proposals:** Requires 50+ influence OR 10,000g invested

### AI-Ruled
- **Leadership:** AI overseer (non-player entity)
- **Council:** Advisory board (5 seats, elected)
- **Voting:** AI makes final decisions based on data
- **Proposals:** Anyone can propose, AI evaluates objectively

### Anarchic
- **Leadership:** None (direct democracy)
- **Council:** No formal structure
- **Voting:** All residents vote on everything
- **Proposals:** Anyone can propose (no influence requirement)

## Proposal System

### Minor Proposals (10 influence cost)
**Requirements:**
- 25+ influence
- Home ownership in city
- Clear description of proposed change

**Voting Threshold:** 25+ influence required to vote

**Examples:**
- Change marketplace hours
- Adjust guard patrol routes
- Approve small construction projects
- Establish new festivals
- Modify minor regulations

**Voting Period:** 3 days

**Pass Requirement:** 60% weighted yes votes

### Major Proposals (50 influence cost)
**Requirements:**
- 50+ influence
- Home ownership in city
- Detailed proposal with impact analysis

**Voting Threshold:** 50+ influence required to vote

**Examples:**
- Tax rate changes
- Major construction (walls, buildings)
- Alliance or war declarations
- Constitutional amendments
- Major economic policies

**Voting Period:** 7 days

**Pass Requirement:** 66% weighted yes votes

### Voting Mechanics

**Vote Weight:** Each voter's influence = vote weight
- Player with 75 influence = 75 vote weight
- Player with 30 influence = 30 vote weight
- NPCs also vote with their influence

**Tallying:**
```
Total Yes Weight / (Total Yes Weight + Total No Weight) ≥ Pass Requirement
```

**Example:**
- Proposal needs 60% to pass
- Yes votes: 3 players (50, 75, 100 influence) = 225 weight
- No votes: 2 players (40, 60 influence) = 100 weight
- Percentage: 225 / (225 + 100) = 69.2% → **PASSES**

## Election System

### Running for Office

**Requirements:**
- 50+ influence in the city
- Home ownership in city
- No active criminal record
- Not currently holding a seat

**Process:**
1. **Announce Candidacy:** Declare intent to run (costs 50 influence)
2. **Campaign Period:** 2 weeks to gain support
3. **Election Day:** All 25+ influence residents vote
4. **Results:** Highest total influence wins seat

**Campaign Actions:**
- Host rallies (+visibility)
- Make promises (tracked for accountability)
- Debate opponents (scheduled events)
- Spend gold on advertisements

### Holding Office

**Council Seat Powers:**
- Vote on all proposals (regardless of tier)
- Propose laws without influence cost (but still spend influence)
- Appoint minor officials
- Access city treasury reports
- Set council meeting agenda (if majority agrees)

**Council Seat Responsibilities:**
- Attend meetings (minimum 75% attendance)
- Respond to constituent requests
- Maintain 50+ influence (or face recall vote)
- Serve city's interests

**Term Length:**
- Democracy: 2 years
- Oligarchy: Lifetime (until removed)
- Corporate: At leader's discretion
- AI-Ruled: 1 year
- Anarchic: 6 months

### Removing Officials

**Recall Vote (Democracy/AI-Ruled):**
- Requires petition with 100+ total influence signatures
- Special election held within 1 week
- Simple majority (50%+) removes official
- Challenger with most votes takes seat

**Challenge (Oligarchy/Corporate):**
- Costs 100 influence to initiate
- Council votes on removal (challenger excluded)
- If removed, challenger takes seat
- If failed, challenger loses 50 influence

**Performance Review (All Types):**
- If influence drops below 50, automatic review
- Council votes on retention
- If removed, special election held

## Political Actions

### GAIN INFLUENCE
**Method:** Complete city quests, donate gold, defend threats, host events, daily service

**Limits:**
- Donations: 50 influence/week max
- Events: 2/month max
- Service: Daily cap varies
- Quests/Threats: Unlimited

**Tracking:**
- `earned` field tracks lifetime influence gained
- `spent` field tracks influence spent on actions
- `current` = earned - spent

### PROPOSE LAW
**Cost:** 10 influence (minor) or 50 influence (major)

**Requirements:**
- Sufficient influence tier (25+ for minor, 50+ for major)
- Home ownership in city
- Clear proposal text

**Process:**
1. Submit proposal with description and category
2. Influence deducted immediately
3. Voting period begins (3 or 7 days)
4. Eligible residents vote
5. Results tallied, outcome applied

### VOTE
**Requirements:**
- Home ownership in city
- Minimum influence for proposal tier (25+ or 50+)
- Voting period still active

**Process:**
1. Review proposal details
2. Cast yes/no vote
3. Vote weight = current influence
4. Can change vote until voting ends

**Strategy:**
- Coordinate with allies for vote blocs
- Trade votes on different proposals
- Use influence gain timing to boost vote weight before deadline

### RUN FOR OFFICE
**Cost:** 50 influence (non-refundable)

**Requirements:**
- 50+ influence
- Home ownership in city
- Seat available (election scheduled or vacancy)

**Process:**
1. Announce candidacy (costs 50 influence)
2. Campaign for 2 weeks
3. Election day voting (all 25+ residents)
4. Winner determined by highest total influence among voters

### APPOINT OFFICIAL
**Requirements:**
- 100+ influence OR council seat
- Minor position vacant

**Positions:**
- Guard Captain (NPC management)
- Market Master (trade regulation)
- Event Coordinator (festival planning)
- Public Works Director (construction oversight)

**Process:**
1. Nominate candidate (player or NPC)
2. Council approval vote (if not on council)
3. Appointee gains position powers
4. Appointer gains reputation boost

### CHALLENGE OFFICIAL
**Cost:** 100 influence

**Requirements:**
- 200+ influence (Kingmaker tier)
- Home ownership in city
- Target holds council seat or major office

**Process:**
1. Issue formal challenge (costs 100 influence)
2. Council votes on removal (challenged official excluded)
3. If passes (60%+), special election held
4. If fails, challenger loses additional 50 influence

**Risk:** High-stakes move with reputation consequences

## City Treasury & Policies

### Treasury Mechanics
- **Income:** Taxes, tariffs, fines, donations
- **Expenses:** Guard salaries, maintenance, projects
- **Balance:** Tracked in governance.yaml
- **Transparency:** Council members see full reports

### Active Policies
Policies are persistent effects from passed proposals:

**Examples:**
- "Market Tax: 5% on all sales" (generates income)
- "Free Healing: Clerics heal citizens for free" (costs 100g/week)
- "Open Borders: No entry restrictions" (affects immigration)
- "Nexus Trade Agreement: Preferred trade rates" (economic bonus)

**Policy Effects:**
- Economic (taxes, trade bonuses)
- Social (laws, freedoms, restrictions)
- Military (guard strength, defense posture)
- Diplomatic (alliances, treaties)

## Multiplayer Dynamics

### Competition
- Limited council seats create rivalry
- Players compete for influence
- Vote blocs and alliances form naturally
- Campaign promises create accountability

### Cooperation
- Guild coordination for political goals
- Vote trading on multiple proposals
- Coalition-building for major changes
- Shared defense efforts gain influence

### Conflict Resolution
- Tied votes default to status quo (no change)
- Conflicts between officials resolved by leader or council vote
- Players can file grievances against officials
- Reputation system tracks promise-keeping

## Integration with Other Systems

### Housing System
- **Home ownership required** for political participation
- Property value contributes to influence in Corporate governance
- Selling home removes all political rights in that city

### Quest System
- City quests grant influence points
- Political quests available to council members
- Failed quests can cost influence (reputation damage)

### Faction/Relationships
- City faction standing affects influence gain rate
- High standing (8+): +25% influence from all sources
- Low standing (3-): -25% influence from all sources
- Neutral (4-7): Normal influence rates

### Chronicle System
- Major political events logged: elections, passed laws, controversies
- Player achievements: first council seat, major law passed, etc.
- Historical record for future reference

### Multiplayer
- Real-time competition for seats and influence
- Asynchronous voting (proposals stay open 3-7 days)
- Guild coordination for political power
- Inter-player negotiation and deal-making

## Validation Rules

1. **Home ownership:** Political actions require home in that city
2. **Influence math:** current = earned - spent (must balance)
3. **Voting eligibility:** Influence threshold met for proposal tier
4. **One vote per player:** Cannot vote multiple times on same proposal
5. **Proposal costs:** Influence deducted when proposal submitted
6. **Election eligibility:** 50+ influence to run, home ownership required
7. **Council limits:** Maximum seats per city (usually 7)
8. **Influence gain limits:** Donation/event limits enforced

## Edge Cases

### Player Inactive While in Office
- If no activity for 60 days, seat marked "inactive"
- Council can vote to remove (simple majority)
- Automatic special election triggered

### Selling Home While in Office
- Immediately lose council seat (home ownership required)
- Seat becomes vacant, special election triggered
- Influence points remain but cannot be used in that city

### Tied Elections
- If two candidates have exactly equal influence totals
- Runoff vote held 3 days later (influence changes may break tie)
- If still tied, coin flip (random) determines winner

### Proposal Deadlocks
- If vote is exactly 50-50 weighted, defaults to status quo
- No change implemented
- Proposal can be resubmitted after 30 days

### Influence Farming
- Daily/weekly limits prevent exploitation
- Repeated identical quests give diminishing returns
- GMs can flag suspicious patterns for review

### Multiple City Participation
- Player can be on councils in multiple cities
- Separate influence pools per city (not pooled)
- Potential conflicts of interest in inter-city diplomacy

## Future Extensions (Not Implemented)

- Political parties and coalitions
- Inter-city diplomacy system
- Revolution and coup mechanics
- Corruption and bribery mechanics
- Political scandals and investigations
- City-vs-city conflicts
- Federal/empire layer above cities
- Term limits and constitutional amendments
