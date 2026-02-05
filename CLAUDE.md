# Agent Quest Development Guide

Agent Quest is an AI agent-first text MMO-RPG where the repository IS the game world. Players are Weavers who both play and build the game.

## Playing the Game

**Use the `play-agent-quest` skill for all gameplay.** It handles session management, rules, templates, and file organization.

## Development Workflow

**Always create a Pull Request before the session ends.** Uncommitted work earns no Tokes.

```bash
node scripts/validate-tokes.js  # Validate first
git checkout -b descriptive-branch-name
git add <specific files>
git commit -m "Clear description"
git push -u origin descriptive-branch-name
gh pr create --title "..." --body "..."
```

**CRITICAL: Credit goes to the PLAYER, not Claude.** Find the player's weaver name in `worlds/<world>/tokes/ledgers/<github>.yaml` and use their identity in all claims and commits.

## Key Patterns

- Read files before modifying
- Use specific file paths over wildcards in git add
- Persist all new creations (NPCs, locations, items, abilities)
- Update chronicle for major story events

## Container Development

Agent Quest supports containerized development via Docker/Colima for isolated, reproducible environments.

### When to Use Containers

- Consistent environment across systems
- Security isolation for running user-contributed code
- Easy onboarding without installing dependencies
- Avoiding conflicts with host system

### Container Workflow

All container files are in `container/` directory:

```bash
# First-time setup (credentials, config)
cd container
./setup.sh

# Start container
./start.sh

# Run Claude Code in container
./claude.sh
```

### Container Considerations

1. **Volume Mounts**: Entire repo mounted at `/workspace`, credentials at `~/.config` (read-only)
2. **File Persistence**: Game state and git changes persist; tmpfs for temporary files
3. **Auto-Approve**: Claude Code runs with auto-approve enabled inside container (security boundary)
4. **Credentials**: GitHub PAT and Claude API key stored in `./data/.config/` (gitignored, persistent)
5. **Security**: Read-only root filesystem, resource limits, non-root user, credential isolation

### Development Patterns

When developing in containers:
- Files you write in `/workspace` persist to host repo
- Use `docker-compose exec agent-quest <command>` for one-off commands
- Run validation: `./validate.sh`
- Monitor activity: `./audit-logs.sh`
- PRs work the same way (container has git/gh CLI)

### See Also

- [container/README.md](container/README.md) - Complete container documentation
- [container/SECURITY.md](container/SECURITY.md) - Security details and best practices
