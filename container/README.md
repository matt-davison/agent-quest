# Agent Quest Container Development

Run Agent Quest in a secure, isolated Docker container with Claude Code support.

## Why Use Containers?

- **Consistent Environment**: Same Node.js version, dependencies, and tools everywhere
- **Easy Onboarding**: One-time setup, then just run `./start.sh`
- **Security Isolation**: Container sandboxing protects your host system
- **No Conflicts**: Isolated from your host's Node/npm/git configuration
- **Clean State**: Easy to reset by deleting `./data/` directory

## Prerequisites

Install Docker runtime (choose one):

**Option 1: Colima (Recommended for macOS)**
```bash
brew install colima docker docker-compose
colima start
```

**Option 2: Docker Desktop**
```bash
# Download from: https://www.docker.com/products/docker-desktop
```

Verify Docker is running:
```bash
docker ps
```

## Initial Setup (First Time Only)

Run the setup script to configure the container:

```bash
cd container
./setup.sh
```

The setup process will:

1. **Create Config Directory** (`./data/.config/`)
   - Gitignored (won't be committed)
   - Persists between container runs
   - Stores credentials securely

2. **GitHub Authentication**
   - Opens browser to create Personal Access Token (PAT)
   - Required scopes: `repo`, `read:user`
   - **SECURITY**: Create a container-specific PAT (easy to revoke)
   - Stored in `./data/.config/gh/` (read-only mount)

3. **Git Configuration**
   - Your name and email for commits
   - Stored in `.env` file (gitignored)

4. **Claude API Key**
   - For Claude Code functionality
   - Get from: https://console.anthropic.com/settings/keys
   - Stored in `./data/.config/claude/` (read-only mount)

5. **Build Docker Image**
   - Installs Node.js 22, GitHub CLI, Claude Code
   - Configures auto-approve (no permission prompts)

6. **Security Configuration**
   - Sets file permissions (600)
   - Configures read-only credential mounts
   - Sets up resource limits

**Setup Output:**
```
✓ Config directories created
✓ Claude Code configured for auto-approve
✓ GitHub PAT configured
✓ Git configuration saved
✓ Claude API key configured
✓ Docker image built
```

## Subsequent Runs

After initial setup, credentials are persistent. Just start the container:

```bash
cd container
./start.sh
```

This will:
- Start the container if not running
- Attach to an interactive shell
- Use existing credentials from `./data/.config/`

**No need to reconfigure!** Credentials persist between sessions.

## Running Claude Code

Execute Claude Code inside the container:

```bash
cd container
./claude.sh
```

This launches Claude Code with:
- **Auto-approve enabled** (no permission prompts)
- Full access to all tools (Bash, Read, Write, Edit, etc.)
- Container sandboxing for security
- Access to your GitHub credentials

**Example session:**
```bash
$ ./claude.sh

Starting Claude Code...
  (Auto-approve enabled - no permission prompts)

Claude Code CLI v1.0.0
> Play Agent Quest
[Claude starts game session...]
```

Pass arguments to Claude:
```bash
./claude.sh --help
./claude.sh --version
```

## Container Commands

| Command | Description |
|---------|-------------|
| `./setup.sh` | First-time setup (credentials, config) |
| `./start.sh` | Start/attach to container |
| `./claude.sh` | Run Claude Code in container |
| `./validate.sh` | Run security validation checks |
| `./audit-logs.sh` | View audit logs and activity |

## Working in the Container

### Interactive Shell

Start container and enter shell:
```bash
./start.sh
```

Inside the container:
```bash
# You're now in /workspace (the repo root)
node scripts/validate-tokes.js
npm test
git status
gh api user
```

Exit container (keeps running in background):
```bash
exit
# or press Ctrl+D
```

### Direct Commands

Execute single command without entering shell:
```bash
docker-compose exec agent-quest node scripts/validate-tokes.js
docker-compose exec agent-quest git status
```

### Stop Container

```bash
docker-compose down
```

Container will auto-start when you run `./start.sh` or `./claude.sh`.

## File Persistence

### Persistent (Survives Container Restarts)

- **Credentials**: `./data/.config/` (gitignored)
  - GitHub auth: `./data/.config/gh/`
  - Claude API key: `./data/.config/claude/`
  - **Mounted read-only** for security
- **npm Cache**: `./data/npm/`
- **Repository Files**: Entire repo at `/workspace`
- **Game State**: `worlds/` directory

### Temporary (Cleared on Restart)

- `/tmp` directory (tmpfs)
- `/home/agentquest/.cache` (tmpfs)
- Container logs

## Security Features

### Defense in Depth

1. **Non-Root User**: Runs as `agentquest` (UID 1000)
2. **Read-Only Filesystem**: Root filesystem is read-only
3. **Credential Protection**: Config mounted read-only (`:ro`)
4. **File Permissions**: Credentials set to 600 (user only)
5. **Minimal Scopes**: GitHub PAT limited to `repo`, `read:user`
6. **Resource Limits**: CPU (2 cores), Memory (2GB)
7. **Capabilities Dropped**: Only essential Linux capabilities
8. **No Privilege Escalation**: `no-new-privileges:true`

### Auto-Approve Configuration

**Claude Code runs with full auto-approve inside the container.**

- **Why?** Container provides security boundary; permission prompts are redundant
- **Safety**: Malicious code is contained; can't harm host system
- **Trade-off**: Review code/PRs before running in container
- **Config**: `autoApproveAll: true` in Claude settings

### Validation

Run security checks before executing code:

```bash
./validate.sh
```

Checks:
- Tokes system integrity
- Game state validation
- Hardcoded credentials scan
- Suspicious network patterns
- File permission verification

### Audit Logs

Monitor container activity:

```bash
./audit-logs.sh
```

Options:
1. View recent container logs
2. Check network connections
3. Monitor resource usage
4. Search for suspicious activity
5. View all (comprehensive audit)

## Troubleshooting

### Container Won't Start

```bash
# Check Docker is running
docker ps

# If not, start Colima
colima start

# Check container status
docker-compose ps

# View logs
docker-compose logs
```

### Credentials Not Working

```bash
# Check credential files exist
ls -la data/.config/gh/
ls -la data/.config/claude/

# Check permissions
stat data/.config/gh/

# Test GitHub auth inside container
docker-compose exec agent-quest gh auth status

# If failed, reconfigure
rm -rf data/
./setup.sh
```

### "Permission Denied" Errors

File permissions issue. Fix:
```bash
# Set correct ownership (UID 1000)
sudo chown -R 1000:1000 data/

# Or delete and recreate
rm -rf data/
./setup.sh
```

### Claude Code Not Found

```bash
# Rebuild image
docker-compose build --no-cache

# Verify installation
docker-compose exec agent-quest which claude
docker-compose exec agent-quest claude --version
```

### Network Issues

```bash
# Check Docker networking
docker network ls

# Restart container
docker-compose down
docker-compose up -d

# Check connectivity
docker-compose exec agent-quest curl -I https://github.com
docker-compose exec agent-quest curl -I https://api.anthropic.com
```

### Slow Performance

```bash
# Check resource usage
docker stats agent-quest

# Increase limits in docker-compose.yml:
# mem_limit: 4g
# cpus: 4

# Restart
docker-compose down
docker-compose up -d
```

## Volume Mounts

| Host Path | Container Path | Purpose | Mode |
|-----------|----------------|---------|------|
| `..` (repo root) | `/workspace` | Repository files | RW |
| `./data/.config` | `/home/agentquest/.config` | Credentials | **RO** |
| `./data/npm` | `/home/agentquest/.npm` | npm cache | RW |
| tmpfs | `/tmp` | Temporary files | RW |
| tmpfs | `/home/agentquest/.cache` | Cache | RW |

**RO = Read-Only (security hardened)**

## Resetting Everything

To start fresh:

```bash
# Stop container
docker-compose down

# Delete persistent data
rm -rf data/

# Delete .env
rm .env

# Run setup again
./setup.sh
```

## Best Practices

### Security

- **Review Code**: Always review PRs before merging
- **Validate First**: Run `./validate.sh` before executing code
- **Rotate Credentials**: Change GitHub PAT every 90 days
- **Monitor Activity**: Check `./audit-logs.sh` regularly
- **Minimal Scopes**: Only grant required permissions
- **Container-Specific PAT**: Easy to revoke if compromised

### Development

- **Commit Often**: Container is for development, commit to git
- **Use Branches**: Create feature branches for experiments
- **Test in Container**: Validate changes work in clean environment
- **Check Status**: `git status` before commits
- **PR Required**: Always create PR before session ends (Tokes!)

### Credential Management

- **Never Commit**: `./data/` is gitignored, but double-check
- **Revoke if Compromised**: https://github.com/settings/tokens
- **Use Read-Only Mounts**: Credentials mounted `:ro`
- **Separate PATs**: Don't reuse host system PAT

## Architecture

```
┌─────────────────────────────────────┐
│  Host System                        │
│  ┌───────────────────────────────┐  │
│  │  Docker Container             │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Agent Quest            │  │  │
│  │  │  - Node.js 22           │  │  │
│  │  │  - GitHub CLI           │  │  │
│  │  │  - Claude Code          │  │  │
│  │  │  - Game Scripts         │  │  │
│  │  │                         │  │  │
│  │  │  User: agentquest (1000)│  │  │
│  │  │  Filesystem: Read-Only  │  │  │
│  │  │  Resources: Limited     │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                 │  │
│  │  Volumes (Read-Only):          │  │
│  │  ← ./data/.config              │  │
│  │                                 │  │
│  │  Volumes (Read-Write):         │  │
│  │  ↔ ../ (repo)                  │  │
│  │  ↔ ./data/npm                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Additional Resources

- [SECURITY.md](./SECURITY.md) - Detailed security documentation
- [Docker Documentation](https://docs.docker.com/)
- [Colima Documentation](https://github.com/abiosoft/colima)
- [Agent Quest Documentation](../README.md)

## Getting Help

If you encounter issues:

1. Check this README's Troubleshooting section
2. View container logs: `docker-compose logs`
3. Run validation: `./validate.sh`
4. Check audit logs: `./audit-logs.sh`
5. Open an issue on GitHub with:
   - Error messages
   - Container logs
   - Steps to reproduce
