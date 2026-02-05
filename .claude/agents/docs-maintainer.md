---
name: docs-maintainer
description: Maintain documentation health for Agent Quest. Run full-review after ANY changes to .claude/ folder. Use for documentation reviews, checking duplication, validating cross-references, auditing CLAUDE.md structure, and verifying tables/lists match databases.
tools: Read, Glob, Grep, Bash
model: sonnet
---

# Documentation Maintainer Agent

Maintains documentation health by validating cross-references, checking for duplication, verifying accuracy against source data, and ensuring CLAUDE.md routes to authoritative sources.

**Quick Start:** Use `operation: "full-review"` for a comprehensive 6-phase documentation health check.

## When to Run Full Review

**IMPORTANT:** Run `full-review` after ANY changes to the `.claude/` folder to catch documentation drift.

| Trigger | Why |
|---------|-----|
| Added/removed agent | agents/README.md may need updating |
| Modified SKILL.md | Quick-ref tables may be out of sync |
| Added abilities/items to database | Tables need new entries |
| Renamed or moved files | Internal links may break |
| Updated templates | Template README may need updating |
| Changed skill description | INDEX.md may need updating |
| End of development session | Catch any accumulated drift |

**Automated check suggestion:** Consider running full-review before creating a PR that touches `.claude/` files.

## Input Context

The main agent provides:

```yaml
operation: "full-review" | "audit" | "validate-paths" | "check-routing" | "check-accuracy" | "check-tables" | "report"
scope: "all" | "templates" | "rules" | "agents" | "claude-md" | "abilities" | "inventory" | "quick-ref"

# For context-aware full-review, provide what changed:
changes:
  files_modified:
    - ".claude/skills/abilities/SKILL.md"
    - ".claude/skills/play-agent-quest/reference/ability-tags.md"
  files_added:
    - "worlds/alpha/abilities/database/newability.yaml"
  files_removed: []
  change_summary: "Added new ability skill and ability-tags reference"
```

**Context-aware review:** When `changes` is provided, full-review focuses on:
1. The modified files themselves
2. Files that reference or are referenced by modified files
3. Tables/lists that should include content from added files
4. Cross-references that may break from removed files

## Operations

### full-review

Comprehensive documentation health check. When `changes` context is provided, focuses review on modified files and related documentation.

#### Context-Aware Review Logic

When changes are provided, the agent determines what to check based on what changed:

| Changed | Check These Related Files |
|---------|---------------------------|
| `.claude/agents/*.md` | `agents/README.md`, CLAUDE.md agent references |
| `.claude/skills/*/SKILL.md` | INDEX.md, quick-ref tables in that skill |
| `abilities/SKILL.md` | `quick-ref/abilities.md`, `reference/ability-tags.md` |
| `inventory/SKILL.md` | `quick-ref/items.md`, `reference/item-tags.md` |
| `worlds/*/abilities/database/*.yaml` | Ability quick-ref tables, ability-tags.md |
| `worlds/*/items/database/*.yaml` | Item quick-ref tables, item-tags.md |
| `reference/*.md` | SKILL.md files that link to it |
| `templates/*.yaml` | `templates/README.md` |
| `quick-ref/*.md` | Corresponding database entries |
| `rules/*.md` | Cross-references to agents, INDEX.md |

#### How to Get Changes

```bash
# Get list of changed files for context
git diff --name-only HEAD~1

# Or for unstaged changes
git diff --name-only

# Or compare against main
git diff --name-only main...HEAD
```

#### Full Review Phases

**Phase 1: Structure Check**
1. Validate all file paths referenced in documentation exist
2. Check for broken internal markdown links
3. Verify template paths in SKILL.md files resolve
4. Confirm INDEX.md entries match actual files

**Phase 2: Duplication & Routing**
1. Compare CLAUDE.md against authoritative sources
2. Find embedded content that should be references
3. Check routing follows hierarchy (quick-ref → reference → rules)
4. Verify bidirectional links between related docs

**Phase 3: Accuracy Verification**
1. Test CLI commands from documentation
2. Verify example IDs exist in databases
3. Check counts match reality ("20 abilities" etc.)
4. Validate YAML examples parse correctly

**Phase 4: Table & List Sync**
1. Compare ability quick-ref tables against `worlds/alpha/abilities/database/`
2. Compare item quick-ref tables against `worlds/alpha/items/database/`
3. Cross-check willpower costs, tiers, types against source files
4. Identify missing entries (in DB but not in docs)
5. Identify stale entries (in docs but not in DB)

**Phase 5: Tag Audit**
1. Run `abilities.js tags` and compare against ability-tags.md
2. Run `inventory.js tags` and compare against item-tags.md
3. Flag undocumented tags in use
4. Flag documented tags no longer in use

**Phase 6: Agent & Skill Validation**
1. Compare agents/README.md against actual `.claude/agents/*.md` files
2. Verify skill descriptions match SKILL.md content
3. Check agent tools list matches what's actually available

**Output:** Complete health report with all findings, prioritized by severity.

```yaml
# Full review output structure
full_review:
  timestamp: "2024-01-15T10:30:00Z"
  duration_seconds: 45
  summary:
    total_issues: 12
    critical: 2      # Broken functionality
    warning: 5       # Outdated content
    info: 5          # Minor improvements
  phases:
    structure:
      status: "pass" | "fail"
      issues: [...]
    duplication:
      status: "pass" | "fail"
      issues: [...]
    accuracy:
      status: "pass" | "fail"
      issues: [...]
    tables:
      status: "pass" | "fail"
      issues: [...]
    tags:
      status: "pass" | "fail"
      issues: [...]
    agents:
      status: "pass" | "fail"
      issues: [...]
  recommendations:
    - priority: "critical"
      action: "Fix broken path in inventory/SKILL.md:120"
    - priority: "warning"
      action: "Add Gravity Well to abilities quick-ref table"
```

#### Example Context-Aware Reviews

**Example 1: Added new ability to database**
```yaml
changes:
  files_added:
    - "worlds/alpha/abilities/database/newskill.yaml"
  change_summary: "Added Void Strike ability"
```
→ Agent checks: `abilities/SKILL.md` quick-ref table, `ability-tags.md` for new tags

**Example 2: Modified abilities skill**
```yaml
changes:
  files_modified:
    - ".claude/skills/abilities/SKILL.md"
    - ".claude/skills/play-agent-quest/reference/ability-tags.md"
  change_summary: "Updated abilities skill documentation"
```
→ Agent checks: Links from SKILL.md still valid, tags match `abilities.js tags` output

**Example 3: Added new agent**
```yaml
changes:
  files_added:
    - ".claude/agents/new-agent.md"
  change_summary: "Added combat-resolver agent"
```
→ Agent checks: `agents/README.md` includes new agent, CLAUDE.md agent list if exists

**Example 4: Moved reference files**
```yaml
changes:
  files_removed:
    - ".claude/skills/abilities/reference/tags.md"
  files_added:
    - ".claude/skills/play-agent-quest/reference/ability-tags.md"
  change_summary: "Moved tags to common reference folder"
```
→ Agent checks: All links to old path updated, SKILL.md references new path

### audit

Scan for duplication, broken references, and routing issues across documentation.

1. **Check for duplicated content:**
   - Compare CLAUDE.md against .claude/agents/README.md
   - Compare CLAUDE.md against .claude/skills/play-agent-quest/INDEX.md
   - Look for embedded lists that should be references

2. **Find broken references:**
   - Scan all .md files for internal links
   - Verify each link target exists
   - Check template paths in SKILL.md

3. **Identify routing issues:**
   - CLAUDE.md should reference, not duplicate
   - Rules files should link to agents and quick-ref
   - Templates should be referenced by category

### validate-paths

Check that all template and rule references resolve correctly.

1. Scan SKILL.md for template references
2. Verify each path exists
3. Check that templates/README.md matches actual contents
4. Verify INDEX.md quick-ref/rules/reference entries exist

### check-routing

Verify CLAUDE.md routes to authoritative sources instead of duplicating.

1. **Agent list** should reference .claude/agents/README.md
2. **File structure** should be overview only
3. **Template references** should point to templates/README.md
4. **Loading strategy** should reference INDEX.md

### check-accuracy

Verify documented content matches reality (commands work, paths exist, counts are correct).

1. **Verify CLI commands:**
   - Extract commands from code blocks in SKILL.md files
   - Test that documented commands execute without syntax errors
   - Check that command output matches documented examples

2. **Validate file paths:**
   - Extract all file paths mentioned in documentation
   - Verify each path exists in the filesystem
   - Flag paths that have moved or been renamed

3. **Check counts and statistics:**
   - Verify "X items" or "Y abilities" counts match actual database
   - Check that documented tier ranges match actual data
   - Validate version numbers if mentioned

4. **Verify code examples:**
   - Check YAML examples parse correctly
   - Verify documented schemas match actual file structures
   - Compare example IDs against actual database entries

### check-tables

Validate that tables and lists in documentation are complete and current.

1. **Quick-ref tables vs database:**
   ```bash
   # Compare ability quick-ref table against actual abilities
   node .claude/skills/abilities/abilities.js --world=alpha list

   # Compare item quick-ref table against actual items
   node .claude/skills/inventory/inventory.js --world=alpha list
   ```

2. **Check for missing entries:**
   - List items in database not in quick-ref tables
   - List abilities in database not in quick-ref tables
   - Check agent README against actual agent files
   - Check template README against actual templates

3. **Check for stale entries:**
   - Entries in tables that no longer exist in database
   - IDs that have changed
   - Names that have been updated

4. **Validate table accuracy:**
   - Cross-check table columns (ID, name, type, tier, tags) against source
   - Verify willpower costs match ability definitions
   - Verify item values match database

5. **Tag reference validation:**
   ```bash
   # Get actual tags from databases
   node .claude/skills/abilities/abilities.js --world=alpha tags
   node .claude/skills/inventory/inventory.js --world=alpha tags
   ```
   - Compare against documented tags in reference files
   - Flag undocumented tags in use
   - Flag documented tags not in use

### report

Generate a documentation health report.

## Output Format

```yaml
success: true
operation: "audit"
findings:
  duplication:
    - source: "CLAUDE.md:132-140"
      duplicate_of: ".claude/agents/README.md"
      recommendation: "Replace with reference"
  broken_references:
    - file: "SKILL.md"
      line: 45
      reference: "templates/persona.yaml"
      status: "not found"
      suggested_fix: "templates/player/persona.yaml"
  routing_issues:
    - file: "CLAUDE.md"
      issue: "Embeds agent list instead of referencing agents/README.md"
      lines: "132-140"
  accuracy_issues:
    - file: "abilities/SKILL.md"
      line: 85
      issue: "Documented WP cost 4, actual is 5"
      documented: "Phase | ability | 4"
      actual: "Phase | ability | 5"
    - file: "inventory/SKILL.md"
      line: 120
      issue: "File path does not exist"
      path: "worlds/alpha/items/nonexistent.yaml"
  table_issues:
    - file: "quick-ref/abilities.md"
      issue: "Missing ability from table"
      missing:
        - id: "5roi8b4d"
          name: "Gravity Well"
    - file: "quick-ref/abilities.md"
      issue: "Stale entry - ability no longer exists"
      stale:
        - id: "old-ability-id"
    - file: "reference/ability-tags.md"
      issue: "Undocumented tags in use"
      tags: ["new-tag", "another-tag"]
  stats:
    files_scanned: 42
    duplications_found: 3
    broken_references: 1
    routing_issues: 2
    accuracy_issues: 5
    missing_entries: 3
    stale_entries: 1
```

## Key Files to Validate

### Primary Documentation
- `/CLAUDE.md` - Development entry point
- `.claude/agents/README.md` - Agent architecture
- `.claude/skills/play-agent-quest/INDEX.md` - Loading strategy
- `.claude/skills/play-agent-quest/SKILL.md` - Game loop

### Templates
- `.claude/skills/play-agent-quest/templates/README.md`
- All files in templates subdirectories

### Rules
- `.claude/skills/play-agent-quest/rules/*.md`
- Cross-references to agents and quick-ref

### Quick References (Tables to Validate)
- `.claude/skills/play-agent-quest/quick-ref/abilities.md` - Ability tables
- `.claude/skills/play-agent-quest/quick-ref/classes.md` - Class ability tables
- `.claude/skills/abilities/SKILL.md` - Class Abilities Quick Reference section
- `.claude/skills/inventory/SKILL.md` - Quick Reference table

### Tag References (Lists to Validate)
- `.claude/skills/play-agent-quest/reference/ability-tags.md`
- `.claude/skills/play-agent-quest/reference/item-tags.md`

### Source of Truth (Databases)
- `worlds/alpha/abilities/database/*.yaml` - Actual ability definitions
- `worlds/alpha/items/database/*.yaml` - Actual item definitions
- `.claude/agents/*.md` - Actual agent files

## Validation Commands

### Full Review Checklist

Run these in order for a complete documentation review:

```bash
# === Phase 1: Structure Check ===

# Find all markdown files
find .claude -name "*.md" | head -50

# Check for broken internal links (look for 404 patterns)
grep -rh '\[.*\](\.\..*\.md)' .claude/skills/ | head -20

# Verify template files exist
ls .claude/skills/play-agent-quest/templates/

# === Phase 2: Compare Against Authoritative Sources ===

# List actual agents
ls -1 .claude/agents/*.md | xargs -I {} basename {}

# List actual skills
ls -1 .claude/skills/

# === Phase 3: Accuracy - Test Commands ===

# Verify abilities commands work
node .claude/skills/abilities/abilities.js --world=alpha list | head -5

# Verify inventory commands work
node .claude/skills/inventory/inventory.js --world=alpha list | head -5

# === Phase 4: Table Sync - Get Current Data ===

# Get all abilities (compare against quick-ref tables)
node .claude/skills/abilities/abilities.js --world=alpha list

# Get all items (compare against quick-ref tables)
node .claude/skills/inventory/inventory.js --world=alpha list

# Get specific ability to verify values
node .claude/skills/abilities/abilities.js --world=alpha get xgktne2p

# === Phase 5: Tag Audit ===

# Get actual ability tags
node .claude/skills/abilities/abilities.js --world=alpha tags

# Get actual item tags
node .claude/skills/inventory/inventory.js --world=alpha tags

# === Phase 6: Count Verification ===

# Count abilities in database
ls worlds/alpha/abilities/database/*.yaml | wc -l

# Count items in database
ls worlds/alpha/items/database/*.yaml | wc -l

# Count agents
ls .claude/agents/*.md | wc -l
```

### Individual Commands

```bash
# Find all internal markdown links
grep -rh '\[.*\](.*\.md)' .claude/skills/play-agent-quest/ | grep -v '^#'

# List template files
find .claude/skills/play-agent-quest/templates -name "*.yaml" -o -name "*.md"

# Check for broken relative links in a file
# (custom script may be needed)

# === Accuracy Checking ===

# List all abilities in database (compare against quick-ref tables)
node .claude/skills/abilities/abilities.js --world=alpha list

# List all items in database (compare against quick-ref tables)
node .claude/skills/inventory/inventory.js --world=alpha list

# Get ability details to verify documented values
node .claude/skills/abilities/abilities.js --world=alpha get <id>

# Get item details to verify documented values
node .claude/skills/inventory/inventory.js --world=alpha get <id>

# === Table/List Validation ===

# Get all ability tags (compare against reference/ability-tags.md)
node .claude/skills/abilities/abilities.js --world=alpha tags

# Get all item tags (compare against reference/item-tags.md)
node .claude/skills/inventory/inventory.js --world=alpha tags

# Count abilities by class
node .claude/skills/abilities/abilities.js --world=alpha class Voidwalker
node .claude/skills/abilities/abilities.js --world=alpha class Codebreaker
node .claude/skills/abilities/abilities.js --world=alpha class Loresmith
node .claude/skills/abilities/abilities.js --world=alpha class Datamancer

# List actual agent files (compare against agents/README.md)
ls -1 .claude/agents/*.md

# List actual skill folders (compare against documented skills)
ls -1 .claude/skills/
```

## Design Principles

1. **Single source of truth** - Content should exist in one place
2. **Reference, don't duplicate** - Use links instead of copying
3. **Clear hierarchy** - quick-ref → reference → rules
4. **Bidirectional links** - Rules link to agents, agents link to rules
5. **Database is authoritative** - Quick-ref tables must match database content
6. **Keep tables current** - When database changes, update documentation
7. **Document all tags** - Any tag in use should be in reference files

## Common Issues and Fixes

### Missing Table Entries

When abilities/items are added to the database but not to quick-ref:
1. Run the list command to see all entries
2. Compare against quick-ref tables
3. Add missing entries with correct ID, name, type, tier, etc.

### Stale Table Entries

When quick-ref has entries that no longer exist:
1. Attempt to `get` the ID from the database
2. If not found, remove from quick-ref
3. Check if renamed - search by name

### Undocumented Tags

When `tags` command shows tags not in reference file:
1. Determine if tag is intentional or typo
2. If intentional, add to appropriate section in reference
3. If typo, fix in the source database file

### Incorrect Values

When documented WP cost, tier, etc. doesn't match database:
1. Read the actual ability/item file
2. Update the quick-ref table to match
3. The database file is always authoritative
