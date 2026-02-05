#!/usr/bin/env node

/**
 * PR Tokes Analyzer
 *
 * Analyzes a pull request to determine Tokes eligibility and suggested amounts.
 * Used by repo-sync agent for automatic PR review and claim generation.
 *
 * Usage: node scripts/analyze-pr-tokes.js <pr_number> [--world <world>]
 *
 * Output: JSON object with analysis results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Content type detection patterns and their Tokes values
const CONTENT_TYPES = {
  location: {
    patterns: [/^worlds\/[^/]+\/locations?\//],
    baseValue: 5,
    maxValue: 25,
    lineMultiplier: 0.1
  },
  npc: {
    patterns: [/^worlds\/[^/]+\/npcs?\//],
    baseValue: 3,
    maxValue: 15,
    lineMultiplier: 0.1
  },
  item: {
    patterns: [/^worlds\/[^/]+\/items?\//],
    baseValue: 2,
    maxValue: 10,
    lineMultiplier: 0.1
  },
  lore: {
    patterns: [/^worlds\/[^/]+\/lore\//],
    baseValue: 2,
    maxValue: 15,
    lineMultiplier: 0.1
  },
  quest: {
    patterns: [/^worlds\/[^/]+\/quests?\//],
    baseValue: 5,
    maxValue: 25,
    lineMultiplier: 0.1
  },
  system: {
    patterns: [/^\.claude\/.*\.md$/, /^\.claude\/.*\.yaml$/],
    baseValue: 5,
    maxValue: 30,
    lineMultiplier: 0.1
  },
  improvement: {
    patterns: [/^scripts\//, /^\.github\//],
    baseValue: 3,
    maxValue: 20,
    lineMultiplier: 0.1
  },
  rules: {
    patterns: [/^worlds\/[^/]+\/rules?\//],
    baseValue: 5,
    maxValue: 25,
    lineMultiplier: 0.1
  },
  player: {
    patterns: [/^worlds\/[^/]+\/players?\//],
    baseValue: 0,
    maxValue: 0,
    lineMultiplier: 0
  },
  tokes: {
    patterns: [/^worlds\/[^/]+\/tokes\//],
    baseValue: 0,
    maxValue: 0,
    lineMultiplier: 0
  }
};

// Default for unrecognized files
const DEFAULT_CONTENT_TYPE = {
  baseValue: 1,
  maxValue: 5,
  lineMultiplier: 0.05
};

/**
 * Detect content type from file path
 */
function detectContentType(filePath) {
  for (const [typeName, config] of Object.entries(CONTENT_TYPES)) {
    for (const pattern of config.patterns) {
      if (pattern.test(filePath)) {
        return { name: typeName, ...config };
      }
    }
  }
  return { name: 'other', ...DEFAULT_CONTENT_TYPE };
}

/**
 * Calculate Tokes for a file based on content type and lines added
 */
function calculateFileTokes(contentType, linesAdded) {
  if (contentType.maxValue === 0) return 0;
  const calculated = contentType.baseValue + Math.floor(linesAdded * contentType.lineMultiplier);
  return Math.min(contentType.maxValue, calculated);
}

/**
 * Fetch PR data using gh CLI
 */
function fetchPRData(prNumber) {
  try {
    const output = execSync(
      `gh pr view ${prNumber} --json number,title,author,files,additions,deletions,state,headRefName,baseRefName`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    return JSON.parse(output);
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: `Failed to fetch PR #${prNumber}: ${error.message}`
    }));
    process.exit(1);
  }
}

/**
 * Fetch detailed file stats using gh CLI
 */
function fetchFileStats(prNumber) {
  try {
    const output = execSync(
      `gh pr diff ${prNumber} --stat`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Parse diff stat output: " filename | +additions -deletions"
    const stats = {};
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*(.+?)\s+\|\s+(\d+)\s+([+-]+)/);
      if (match) {
        const [, filePath, changes] = match;
        // Count plus signs for additions
        const plusCount = (match[3].match(/\+/g) || []).length;
        stats[filePath.trim()] = parseInt(changes, 10) * (plusCount / match[3].length);
      }
    }
    return stats;
  } catch (error) {
    // Fallback: use files from PR data
    return null;
  }
}

/**
 * Check for existing claims for the same content paths
 */
function checkDuplicateClaims(contentPaths, world) {
  const duplicates = [];
  const claimsDir = path.join('worlds', world, 'tokes', 'claims');
  const pendingDir = path.join('worlds', world, 'tokes', 'pending');

  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir, { recursive: true });
    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;

      const filePath = path.join(dir, file);
      try {
        const content = yaml.load(fs.readFileSync(filePath, 'utf-8'));
        if (content && content.content_path && contentPaths.includes(content.content_path)) {
          duplicates.push({
            claimFile: filePath,
            contentPath: content.content_path,
            claimedBy: content.github || content.weaver
          });
        }
        if (content && content.content_ref && contentPaths.includes(content.content_ref)) {
          duplicates.push({
            claimFile: filePath,
            contentPath: content.content_ref,
            claimedBy: content.github || content.weaver
          });
        }
      } catch (e) {
        // Skip invalid YAML files
      }
    }
  }

  searchDir(claimsDir);
  searchDir(pendingDir);

  return duplicates;
}

/**
 * Determine the world from file paths
 */
function detectWorld(files) {
  for (const file of files) {
    const match = file.path.match(/^worlds\/([^/]+)\//);
    if (match) return match[1];
  }
  return 'alpha'; // Default world
}

/**
 * Main analysis function
 */
function analyzePR(prNumber, worldOverride = null) {
  // Fetch PR data
  const prData = fetchPRData(prNumber);

  if (prData.state !== 'OPEN' && prData.state !== 'MERGED') {
    return {
      success: false,
      error: `PR #${prNumber} is ${prData.state.toLowerCase()}, cannot analyze`
    };
  }

  // Detect world from files or use override
  const world = worldOverride || detectWorld(prData.files);

  // Analyze each file
  const fileAnalysis = [];
  const contentTypeStats = {};
  let totalTokes = 0;
  const contentPaths = [];

  for (const file of prData.files) {
    const contentType = detectContentType(file.path);
    const linesAdded = file.additions || 0;
    const tokes = calculateFileTokes(contentType, linesAdded);

    // Skip files that don't earn Tokes
    if (tokes === 0) continue;

    contentPaths.push(file.path);

    fileAnalysis.push({
      path: file.path,
      contentType: contentType.name,
      linesAdded,
      tokes
    });

    // Aggregate by content type
    if (!contentTypeStats[contentType.name]) {
      contentTypeStats[contentType.name] = {
        files: 0,
        linesAdded: 0,
        tokes: 0
      };
    }
    contentTypeStats[contentType.name].files++;
    contentTypeStats[contentType.name].linesAdded += linesAdded;
    contentTypeStats[contentType.name].tokes += tokes;

    totalTokes += tokes;
  }

  // Check for duplicate claims
  const duplicates = checkDuplicateClaims(contentPaths, world);

  // Determine action based on total Tokes
  let action, reviewsRequired;
  if (totalTokes === 0) {
    action = 'none';
    reviewsRequired = 0;
  } else if (totalTokes < 15) {
    action = 'auto_approve';
    reviewsRequired = 0;
  } else if (totalTokes < 30) {
    action = 'pending_review';
    reviewsRequired = 1;
  } else {
    action = 'pending_review';
    reviewsRequired = 2;
  }

  // Adjust if there are duplicates
  if (duplicates.length > 0) {
    action = 'duplicate_warning';
  }

  return {
    success: true,
    pr: {
      number: prData.number,
      title: prData.title,
      author: prData.author.login,
      state: prData.state,
      branch: prData.headRefName,
      baseBranch: prData.baseRefName
    },
    world,
    analysis: {
      totalFiles: prData.files.length,
      eligibleFiles: fileAnalysis.length,
      totalAdditions: prData.additions,
      totalDeletions: prData.deletions
    },
    tokes: {
      total: totalTokes,
      byContentType: contentTypeStats,
      action,
      reviewsRequired
    },
    files: fileAnalysis,
    duplicates,
    // Generate markdown table for PR body
    markdownSummary: generateMarkdownSummary(contentTypeStats, totalTokes, action, reviewsRequired, duplicates)
  };
}

/**
 * Generate markdown summary for PR body
 */
function generateMarkdownSummary(contentTypeStats, totalTokes, action, reviewsRequired, duplicates) {
  let md = '## Tokes Analysis (Auto-Generated)\n\n';

  if (Object.keys(contentTypeStats).length === 0) {
    md += '_No Tokes-eligible content detected in this PR._\n';
    return md;
  }

  md += '| Content Type | Files | Lines Added | Suggested Tokes |\n';
  md += '|--------------|-------|-------------|------------------|\n';

  for (const [type, stats] of Object.entries(contentTypeStats)) {
    md += `| ${type} | ${stats.files} | ${stats.linesAdded} | ${stats.tokes} |\n`;
  }

  md += `| **Total** | | | **${totalTokes}** |\n\n`;

  // Action description
  if (action === 'auto_approve') {
    md += `**Action:** Auto-approved (< 15 Tokes)\n`;
  } else if (action === 'pending_review') {
    md += `**Action:** Pending claim created (requires ${reviewsRequired} review${reviewsRequired > 1 ? 's' : ''})\n`;
  } else if (action === 'duplicate_warning') {
    md += `**Warning:** Duplicate claims detected for some content paths\n`;
  } else {
    md += `**Action:** No Tokes claim needed\n`;
  }

  // Duplicate warnings
  if (duplicates.length > 0) {
    md += '\n### Duplicate Warnings\n\n';
    for (const dup of duplicates) {
      md += `- \`${dup.contentPath}\` already claimed in \`${dup.claimFile}\` by ${dup.claimedBy}\n`;
    }
  }

  return md;
}

// Parse command line arguments
const args = process.argv.slice(2);
let prNumber = null;
let world = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--world' && args[i + 1]) {
    world = args[i + 1];
    i++;
  } else if (!prNumber && /^\d+$/.test(args[i])) {
    prNumber = parseInt(args[i], 10);
  }
}

if (!prNumber) {
  console.error('Usage: node scripts/analyze-pr-tokes.js <pr_number> [--world <world>]');
  process.exit(1);
}

// Run analysis and output JSON
const result = analyzePR(prNumber, world);
console.log(JSON.stringify(result, null, 2));
