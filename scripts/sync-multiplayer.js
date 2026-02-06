#!/usr/bin/env node

/**
 * sync-multiplayer.js
 * Node.js wrapper for syncing multiplayer updates
 * Can be called from game logic or skills
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Sync multiplayer updates from main branch
 * @param {Object} options - Configuration options
 * @param {boolean} options.silent - Suppress output (default: false)
 * @param {boolean} options.dryRun - Check for updates without merging (default: false)
 * @returns {Object} Result with success status and message
 */
function syncMultiplayer(options = {}) {
    const { silent = false, dryRun = false } = options;

    try {
        const scriptPath = path.join(__dirname, 'sync-multiplayer.sh');

        // Verify script exists
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Script not found: ${scriptPath}`);
        }

        // If dry run, just check if we're behind
        if (dryRun) {
            try {
                execSync('git fetch origin', { stdio: silent ? 'pipe' : 'inherit' });
                const behindCount = execSync('git rev-list --count HEAD..origin/main', {
                    encoding: 'utf8',
                    stdio: 'pipe'
                }).trim();

                const behind = parseInt(behindCount, 10);
                return {
                    success: true,
                    behind,
                    message: behind > 0
                        ? `Behind origin/main by ${behind} commit(s)`
                        : 'Up to date with origin/main'
                };
            } catch (error) {
                return {
                    success: false,
                    behind: 0,
                    message: 'Could not check sync status',
                    error: error.message
                };
            }
        }

        // Run the sync script
        execSync(scriptPath, {
            stdio: silent ? 'pipe' : 'inherit',
            cwd: path.join(__dirname, '..')
        });

        return {
            success: true,
            message: 'Multiplayer sync completed successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Multiplayer sync failed',
            error: error.message
        };
    }
}

/**
 * Check if there are multiplayer updates available
 * @returns {Promise<Object>} Status of available updates
 */
async function checkForUpdates() {
    return syncMultiplayer({ silent: true, dryRun: true });
}

/**
 * Get a summary of recent multiplayer activity
 * @param {number} count - Number of recent commits to show (default: 5)
 * @returns {Array<Object>} Recent commits
 */
function getRecentActivity(count = 5) {
    try {
        const log = execSync(`git log origin/main --oneline -n ${count} --format="%H|%an|%ar|%s"`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        return log.trim().split('\n').map(line => {
            const [hash, author, date, message] = line.split('|');
            return { hash, author, date, message };
        });
    } catch (error) {
        return [];
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-n');
    const silent = args.includes('--silent') || args.includes('-s');
    const checkOnly = args.includes('--check') || args.includes('-c');

    if (checkOnly) {
        checkForUpdates().then(result => {
            console.log(JSON.stringify(result, null, 2));
            process.exit(result.success ? 0 : 1);
        });
    } else {
        const result = syncMultiplayer({ silent, dryRun });
        if (!silent) {
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(result.success ? 0 : 1);
    }
}

module.exports = {
    syncMultiplayer,
    checkForUpdates,
    getRecentActivity
};
