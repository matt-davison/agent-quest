# Housing System

Players can purchase homes in cities to gain storage, fast travel, respawn points, and political participation rights.

## Core Mechanics

- Each persona can own **multiple homes** across different cities
- Only **one home per location** per persona
- Homes are **permanent** unless sold by the player
- Ownership enables **political participation** in that city
- Homes provide **private storage** separate from carried inventory

## Housing Tiers

Five tiers of housing exist, from basic quarters to legendary estates:

### Tier 1: Basic Housing (500g)
- **Storage:** 20 slots
- **Requirements:** Level 2+
- **Examples:** Small apartment, modest room, basic quarters
- **Benefits:** Political rights, storage, respawn/fast travel

### Tier 2: Comfortable Housing (2,000g)
- **Storage:** 40 slots
- **Requirements:** Level 5+, Standing 3+
- **Examples:** Nice apartment, townhouse room, comfortable flat
- **Benefits:** All Tier 1 benefits + doubled storage

### Tier 3: Luxury Housing (10,000g)
- **Storage:** 100 slots
- **Requirements:** Level 7+, Standing 6+, Fame 5+
- **Examples:** Penthouse, luxury condo, spacious home
- **Benefits:** All Tier 2 benefits + significant storage increase

### Tier 4: Estate Housing (50,000g)
- **Storage:** 250 slots
- **Requirements:** Level 9+, Standing 8+, Fame 10+
- **Examples:** Manor, estate, corporate suite
- **Benefits:** All Tier 3 benefits + massive storage

### Tier 5: Legendary Housing (200,000g)
- **Storage:** 500 slots
- **Requirements:** Level 10, Standing 10, Legendary status
- **Examples:** Tower penthouse, private island, palatial estate
- **Benefits:** All Tier 4 benefits + maximum storage

## Upgrade Catalog

Homes can be enhanced with upgrades that provide additional benefits:

### Storage Upgrades
- **Wall Safe** (100g): +10 storage slots [Tiers 1-2]
- **Storage Room** (500g): +25 storage slots [Tiers 2-3]
- **Vault** (2,000g): +50 storage slots [Tiers 3-5]
- **Expanded Vault** (5,000g): +100 storage slots [Tier 5 only]

### Security Upgrades
- **Basic Lock** (50g): Prevents casual theft [All tiers]
- **Advanced Security** (500g): Magical/tech protection [Tiers 2-5]
- **Fortress Security** (2,000g): Maximum protection [Tiers 4-5]

### Comfort Upgrades
- **Basic Furniture** (100g): +1% rest bonus [All tiers]
- **Luxury Furniture** (500g): +3% rest bonus [Tiers 2-5]
- **Masterwork Decor** (2,000g): +5% rest bonus [Tiers 3-5]

### Utility Upgrades
- **Alchemy Lab** (1,000g): Craft potions at home [Tiers 2-5]
- **Enchanting Station** (2,000g): Enchant items at home [Tiers 3-5]
- **Portal Anchor** (3,000g): Reduced fast travel cost [Tiers 3-5]
- **Training Dummy** (500g): Practice combat at home [Tiers 2-5]

## Actions

### BUY HOME
**Requirements:**
- Meet tier requirements (level, standing, fame)
- Have sufficient gold
- Don't already own a home in this location
- Home of desired tier is available

**Process:**
1. Player declares intent to purchase specific property
2. Validate requirements and availability
3. Deduct gold from player's gold total
4. Add home entry to persona's `homes` array
5. Generate unique property ID
6. Log purchase in chronicle if Tier 3+

**Outcome:**
- Home appears in persona.yaml
- Storage becomes available
- Political participation enabled in that city
- Fast travel and respawn options added

### SELL HOME
**Recovery:** 70% of total invested (purchase price + upgrades)

**Requirements:**
- Must own the home being sold
- Storage must be empty (or items transfer to inventory with space check)

**Process:**
1. Validate ownership
2. Check storage contents
3. Transfer items to inventory (fail if no space)
4. Calculate recovery: `(purchase_price + sum(upgrade_costs)) * 0.70`
5. Add gold to player's total
6. Remove home entry from persona.yaml
7. If player held political office in city, mark seat vacant

**Outcome:**
- Home removed from persona
- Gold returned to player
- Political participation rights lost in that city
- Items moved to inventory

### UPGRADE HOME
**Requirements:**
- Must own the home
- Have sufficient gold
- Upgrade is applicable to home's tier

**Process:**
1. Validate ownership and tier compatibility
2. Check if upgrade already applied (prevent duplicates except storage)
3. Deduct gold
4. Add upgrade to home's upgrades array
5. Apply benefits (storage, rest bonus, etc.)

**Outcome:**
- Upgrade appears in home's upgrades list
- Benefits active immediately
- Total invested increased

### STORE ITEMS
**Requirements:**
- Must own the home
- Must be at the location (or use remote storage if Portal Anchor installed)
- Items must be in player's inventory
- Storage slots available (current + items ≤ max)

**Process:**
1. Validate ownership and location
2. Check storage capacity
3. Remove items from inventory
4. Add items to home's storage
5. Update slot count

**Outcome:**
- Items moved from inventory to home storage
- Carrying capacity freed up

### RETRIEVE ITEMS
**Requirements:**
- Must own the home
- Must be at the location (or Portal Anchor)
- Items must be in home storage
- Inventory space available

**Process:**
1. Validate ownership and location
2. Check inventory capacity
3. Remove items from home storage
4. Add items to inventory
5. Update slot count

**Outcome:**
- Items moved from home storage to inventory
- Storage slots freed up

### SET RESPAWN
**Requirements:**
- Must own at least one home
- Can only set one respawn point at a time

**Process:**
1. Validate home ownership
2. Update respawn location in persona.yaml
3. Notify player of change

**Outcome:**
- On death, player respawns at chosen home
- Fast travel to home always available

## Integration with Other Systems

### Political System
- **Home ownership required** to participate in city politics
- Selling home **removes political rights** (voting, proposals, office)
- Multiple homes = participation in multiple cities

### Fast Travel
- Owned homes are **always accessible** fast travel destinations
- Portal Anchor upgrade reduces fast travel cost by 50%
- No level requirement for traveling to owned homes

### Respawn System
- Player can set any owned home as respawn point
- On death, respawn at chosen home instead of nearest safe location
- Can change respawn point at any time

### Storage System
- Home storage is **separate** from carried inventory
- Items cannot be in both home storage and inventory
- No weight limit in home storage, only slot limit
- Storage expansions stack (multiple upgrades allowed)

### Economy
- Major gold sink (500g to 200,000g purchases)
- Selling homes recovers 70% of investment
- Upgrades provide permanent value
- Limited availability on high tiers creates scarcity

## Validation Rules

1. **One home per location:** Each persona can only own one property per city
2. **Storage limits:** Items stored ≤ max_slots at all times
3. **No duplication:** Items cannot exist in both home storage and inventory
4. **Tier requirements:** Purchase requirements must be met
5. **Valid locations:** location_id must reference existing city
6. **Valid property_ids:** Must be unique across all homes
7. **Upgrade compatibility:** Upgrades must be applicable to tier
8. **Gold availability:** Player must have sufficient gold for purchase/upgrade

## Edge Cases

### Selling Home with Items
- Storage must be empty before selling
- If player has inventory space, items auto-transfer
- If no space, sell action fails with error message
- Player must manually retrieve items first

### Limited Availability Tiers
- Some cities may have limited high-tier homes (e.g., only 3 Tier 5 estates)
- If sold out, clear error message shown
- First-come-first-served basis
- Homes become available again when sold by previous owner

### Political Implications
- Selling home removes political participation rights
- If player holds council seat, seat becomes vacant
- Active proposals from player remain (legacy effect)
- Influence points in city remain but cannot be used without home

### Death with Full Home Storage
- Respawning at home doesn't require storage space
- Player spawns normally even if storage at max capacity

### Multiple Homes
- Player can own homes in multiple cities
- Each home tracked separately in persona.yaml
- Storage is per-home, not pooled
- Political participation in all cities with owned homes

## Future Extensions (Not Implemented)

- Home decoration/customization
- Renting vs owning
- Player-to-player property sales
- Property taxes
- Home invasions/robberies
- Roommates/shared housing
- Guild halls (special housing type)
