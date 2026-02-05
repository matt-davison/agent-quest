# Agent Quest Container Security

This document describes the security measures, threat model, and best practices for running Agent Quest in a containerized environment.

## Table of Contents

- [Threat Model](#threat-model)
- [Security Measures](#security-measures)
- [Credential Protection](#credential-protection)
- [Limitations and Risks](#limitations-and-risks)
- [Best Practices](#best-practices)
- [Incident Response](#incident-response)
- [Security Audit](#security-audit)

## Threat Model

### Threat: Malicious Code Execution

**Description**: User-contributed content (quests, NPCs, items, validation scripts) could contain malicious code.

**Attack Vectors**:
- Malicious PR introduces backdoor in validation scripts
- Compromised quest file executes arbitrary commands
- Malicious NPC dialogue triggers code execution
- Supply chain attack via npm dependencies

**Impact**:
- Credential theft (GitHub PAT, Claude API key)
- Data exfiltration
- System compromise
- Resource exhaustion (DoS)

### Threat: Privilege Escalation

**Description**: Attacker attempts to gain root privileges inside container or escape to host.

**Attack Vectors**:
- Exploit container runtime vulnerability
- Abuse misconfigured volume mounts
- Exploit setuid binaries
- Kernel exploits

**Impact**:
- Container escape
- Host system compromise
- Access to other containers

### Threat: Credential Leakage

**Description**: Malicious code reads and exfiltrates credentials.

**Attack Vectors**:
- Read credential files from mounted volumes
- Extract credentials from environment variables
- Process memory inspection
- Network exfiltration

**Impact**:
- Unauthorized GitHub access
- Claude API abuse
- Repository compromise

### Threat: Resource Exhaustion

**Description**: Malicious code consumes excessive resources.

**Attack Vectors**:
- Infinite loops
- Fork bombs
- Memory leaks
- Network flooding

**Impact**:
- Container crash
- Host system slowdown
- Denial of service

## Security Measures

### 1. Non-Root Container User

**Implementation**:
```dockerfile
RUN groupadd -g 1000 agentquest && \
    useradd -u 1000 -g 1000 -m -s /bin/bash agentquest
USER agentquest
```

**Protection**:
- Limits privilege escalation attacks
- Prevents modification of system files
- Reduces impact of container escape

**Limitations**:
- Can still modify files in `/workspace`
- Can read credential files (mounted read-only)

### 2. Read-Only Root Filesystem

**Implementation**:
```yaml
read_only: true
```

**Protection**:
- Prevents unauthorized file modifications
- Blocks persistence mechanisms
- Stops malware installation

**Writable Exceptions**:
```yaml
tmpfs:
  - /tmp (size limited, noexec)
  - /home/agentquest/.cache
```

**Limitations**:
- `/workspace` is still writable (required for git)
- tmpfs can be used for temporary storage

### 3. Credential Protection (Defense in Depth)

#### Layer 1: File Permissions

```bash
chmod 600 ./data/.config/gh/token
chmod 600 ./data/.config/claude/api_key
chmod 700 ./data/.config/
```

- **Protection**: Only container user can read
- **Limitation**: Container user can still read

#### Layer 2: Read-Only Mount

```yaml
volumes:
  - ./data/.config:/home/agentquest/.config:ro
```

- **Protection**: Prevents modification/deletion
- **Limitation**: Can still be read

#### Layer 3: Minimal Scopes

GitHub PAT scopes:
- `repo`: Repository access (required)
- `read:user`: User info (required)

**NOT GRANTED**:
- `admin:org`: Organization admin
- `delete_repo`: Delete repositories
- `write:packages`: Modify packages
- `admin:gpg_key`: Manage GPG keys

- **Protection**: Limits damage if compromised
- **Recommendation**: Use container-specific PAT

#### Layer 4: No Environment Variables

Credentials loaded from files, not env vars.

- **Protection**: Not exposed via `docker inspect` or `/proc/*/environ`
- **Limitation**: Files can still be read

#### Layer 5: Audit Logging

All API calls should be logged (future enhancement).

- **Protection**: Detect exfiltration attempts
- **Monitoring**: Check for unexpected API calls

### 4. Resource Limits

**Implementation**:
```yaml
mem_limit: 2g
cpus: 2
```

**Protection**:
- Prevents memory exhaustion
- Limits CPU usage
- Contains fork bombs

**Monitoring**:
```bash
docker stats agent-quest
```

### 5. Capabilities Dropping

**Implementation**:
```yaml
cap_drop: [ALL]
cap_add: [CHOWN, DAC_OVERRIDE, SETGID, SETUID]
```

**Dropped Capabilities**:
- `CAP_NET_ADMIN`: Network configuration
- `CAP_SYS_ADMIN`: System administration
- `CAP_SYS_MODULE`: Load kernel modules
- `CAP_SYS_PTRACE`: Trace processes

**Added Back** (minimal set):
- `CHOWN`: Change file ownership (for npm)
- `DAC_OVERRIDE`: Bypass file permissions (for git)
- `SETGID`: Set GID (for su/sudo - if needed)
- `SETUID`: Set UID (for su/sudo - if needed)

### 6. Security Options

**Implementation**:
```yaml
security_opt:
  - no-new-privileges:true
```

**Protection**:
- Prevents privilege escalation via setuid binaries
- Blocks execve() privilege gains

### 7. Network Access

**Current Implementation**: Full network access to required services.

**Allowed Domains**:
- `github.com` (API and git operations)
- `registry.npmjs.org` (npm packages)
- `anthropic.com` (Claude API)
- `openai.com` (OpenAI API)

**Risk**: Potential data exfiltration.

**Mitigation**:
- Code validation before execution
- Audit logs for network activity
- User vigilance

**Future Enhancement**: Network policy filtering (Docker network policies or external firewall).

### 8. Validation Checks

**Pre-Execution Validation** (`./validate.sh`):

1. **Tokes System Validation**
   ```bash
   node scripts/validate-tokes.js
   ```

2. **Credential Scan**
   - Regex patterns for GitHub PAT, API keys
   - Scan `worlds/` and `scripts/` directories
   - Fail on detection

3. **Suspicious Network Patterns**
   - Check for `curl http://`, `wget`, `nc -l`
   - Warn on detection

4. **File Permission Verification**
   - Ensure credential files are 600/700
   - Auto-fix if incorrect

### 9. Auto-Approve Configuration

**Implementation**:
```json
{
  "autoApproveAll": true,
  "autoApproveTools": ["Bash", "Read", "Write", "Edit", ...],
  "allowedPrompts": {
    "Bash": [".*"]
  }
}
```

**Rationale**:
- Container provides security boundary
- Permission prompts redundant inside container
- Improves UX for development

**Trade-off**:
- Claude can execute any command without prompting
- User should review code/PRs before running

**Safety**:
- Container isolation prevents host damage
- Read-only filesystem limits modifications
- Resource limits prevent DoS

## Credential Protection

### How Credentials Are Stored

```
container/data/.config/  (gitignored, mode 700)
├── gh/                  (mode 700)
│   └── token           (mode 600, read-only mount)
└── claude/             (mode 700)
    └── api_key         (mode 600, read-only mount)
```

### Read-Only Mount Behavior

```yaml
volumes:
  - ./data/.config:/home/agentquest/.config:ro
```

**What This Prevents**:
- ✓ Modifying credential files
- ✓ Deleting credential files
- ✓ Creating new credential files
- ✓ Changing file permissions

**What This Does NOT Prevent**:
- ✗ Reading credential files (by design - needed for auth)
- ✗ Copying credentials elsewhere
- ✗ Exfiltrating via network

### Detecting Credential Leakage

#### Signs of Compromise

1. **Unexpected API Calls**
   ```bash
   ./audit-logs.sh
   # Check for API calls to unexpected endpoints
   ```

2. **Unusual Network Connections**
   ```bash
   docker-compose exec agent-quest netstat -tunap
   # Look for connections to suspicious hosts
   ```

3. **GitHub Activity**
   - Check: https://github.com/settings/security-log
   - Look for: Unexpected repository access, token usage from unknown IPs

4. **Anthropic Usage**
   - Check: https://console.anthropic.com/settings/logs
   - Look for: Unusual API call patterns, high usage

#### Automated Detection

**Validation Script** (`./validate.sh`):
```bash
# Scan for hardcoded credentials
grep -r -E "ghp_[a-zA-Z0-9]{36}" worlds/
grep -r -E "sk-[a-zA-Z0-9]{48}" worlds/
```

**Audit Logs** (`./audit-logs.sh`):
```bash
# Check for credential access
docker-compose logs | grep -E "(\.config/gh|api[_-]?key|token)"
```

### Credential Rotation

#### When to Rotate

- **Immediately if compromised**
- **Every 90 days** (best practice)
- **After running untrusted code**
- **Before sharing container image**

#### How to Rotate GitHub PAT

1. **Revoke Old PAT**
   - Visit: https://github.com/settings/tokens
   - Click "Delete" next to old token

2. **Create New PAT**
   - Visit: https://github.com/settings/tokens/new
   - Scopes: `repo`, `read:user`
   - Description: `Agent Quest Container (rotated YYYY-MM-DD)`

3. **Update Container**
   ```bash
   cd container
   rm -rf data/.config/gh/
   ./setup.sh  # Re-run setup with new PAT
   ```

#### How to Rotate Claude API Key

1. **Revoke Old Key** (if supported)
   - Visit: https://console.anthropic.com/settings/keys

2. **Create New Key**
   - Visit: https://console.anthropic.com/settings/keys
   - Click "Create Key"

3. **Update Container**
   ```bash
   cd container
   rm data/.config/claude/api_key
   ./setup.sh  # Re-run setup with new key
   ```

### What to Do If Credentials Are Compromised

#### Immediate Actions (Within 1 Hour)

1. **Revoke Credentials**
   - GitHub: https://github.com/settings/tokens
   - Anthropic: https://console.anthropic.com/settings/keys

2. **Stop Container**
   ```bash
   docker-compose down
   ```

3. **Review Audit Logs**
   ```bash
   ./audit-logs.sh
   docker-compose logs > incident-$(date +%Y%m%d-%H%M%S).log
   ```

4. **Check for Unauthorized Activity**
   - GitHub security log: https://github.com/settings/security-log
   - Repository activity
   - Anthropic usage logs

#### Investigation (Within 24 Hours)

1. **Identify Attack Vector**
   - Review recently merged PRs
   - Check validation script modifications
   - Scan for malicious code patterns

2. **Assess Impact**
   - What data was accessed?
   - What repositories were compromised?
   - What API calls were made?

3. **Document Incident**
   - Timeline of events
   - Attack vector
   - Affected systems
   - Actions taken

#### Recovery (Within 48 Hours)

1. **Clean Environment**
   ```bash
   cd container
   docker-compose down
   rm -rf data/
   docker system prune -a
   ```

2. **Create New Credentials**
   - New GitHub PAT (different scopes if needed)
   - New Claude API key
   - New git commit identity (if email compromised)

3. **Rebuild Container**
   ```bash
   ./setup.sh  # Fresh setup
   ```

4. **Implement Additional Safeguards**
   - Review and merge validation improvements
   - Add monitoring/alerting
   - Update security policies

## Limitations and Risks

### Known Limitations

1. **Credential Reading**
   - **Risk**: Container user can read credential files
   - **Impact**: Malicious code can exfiltrate credentials
   - **Mitigation**: Code review, validation, minimal scopes, rotation

2. **Network Exfiltration**
   - **Risk**: Full network access allows data exfiltration
   - **Impact**: Credentials or game data can be sent to attacker
   - **Mitigation**: Audit logs, network monitoring (future)

3. **Workspace Modifications**
   - **Risk**: `/workspace` is writable
   - **Impact**: Malicious code can modify game files
   - **Mitigation**: Git version control, PR review, validation

4. **Dependency Vulnerabilities**
   - **Risk**: npm packages may have vulnerabilities
   - **Impact**: Supply chain attacks
   - **Mitigation**: Regular updates, `npm audit`, minimal dependencies

5. **Container Escape**
   - **Risk**: Container runtime vulnerabilities
   - **Impact**: Host system compromise
   - **Mitigation**: Keep Docker updated, follow security advisories

### Risk Assessment

| Threat | Likelihood | Impact | Risk Level | Mitigation |
|--------|-----------|--------|------------|------------|
| Credential exfiltration | Medium | High | **High** | Code review, validation, rotation |
| Resource exhaustion | Medium | Medium | Medium | Resource limits, monitoring |
| Malicious file modifications | Medium | Low | Low | Git version control, PR review |
| Container escape | Low | Critical | Medium | Keep Docker updated |
| Supply chain attack | Low | High | Medium | Dependency audits |
| Privilege escalation | Low | High | Low | Non-root user, capabilities drop |

### Acceptable Trade-offs

**Trade-off**: Credential files can be read by container user.

**Justification**:
- Required for authentication (gh CLI, Claude Code)
- Alternative (env vars) is less secure
- Mitigated by: Minimal scopes, rotation, monitoring

**Trade-off**: Full network access to required services.

**Justification**:
- Required for GitHub API, npm, Claude API
- Filtering would break functionality
- Mitigated by: Code review, validation, audit logs

**Trade-off**: Auto-approve for Claude Code.

**Justification**:
- Improves developer experience
- Container provides security boundary
- Mitigated by: Code review, container isolation

## Best Practices

### For Users

1. **Review Code Before Running**
   - Read all PRs before merging
   - Check for suspicious patterns
   - Validate scripts before execution

2. **Run Validation**
   ```bash
   ./validate.sh
   ```

3. **Use Container-Specific Credentials**
   - Create separate GitHub PAT for container
   - Easy to revoke if compromised
   - Minimal required scopes

4. **Rotate Credentials Regularly**
   - Every 90 days minimum
   - After running untrusted code
   - If suspicious activity detected

5. **Monitor Activity**
   ```bash
   ./audit-logs.sh
   ```

6. **Keep Docker Updated**
   ```bash
   colima version
   docker version
   ```

7. **Limit Exposure**
   - Don't run untrusted code
   - Only accept PRs from trusted contributors
   - Review validation script changes carefully

### For Contributors

1. **Never Hardcode Credentials**
   - No API keys in code
   - No tokens in comments
   - Use environment variables or config files

2. **Minimize Network Calls**
   - Only call approved APIs
   - Document external API usage
   - Avoid unnecessary network requests

3. **Follow Validation Rules**
   - Pass `validate-tokes.js` checks
   - No suspicious patterns
   - Clean code review

4. **Document Security-Sensitive Code**
   - Explain why external API is needed
   - Document network calls
   - Clarify file system operations

### For Maintainers

1. **Review PRs Carefully**
   - Check for credential leakage
   - Scan for network exfiltration
   - Validate script changes

2. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

3. **Monitor Security Advisories**
   - GitHub security advisories
   - Docker CVE database
   - Node.js security updates

4. **Improve Validation**
   - Add new security checks
   - Enhance pattern detection
   - Implement automated scanning

5. **Document Incidents**
   - Record security events
   - Update this document
   - Share lessons learned

## Incident Response

### Response Team

- **Incident Commander**: Repository owner/maintainer
- **Technical Lead**: Developer with container expertise
- **Communication**: Designated PR liaison

### Response Procedures

#### Phase 1: Detection (0-15 minutes)

1. **Identify Incident**
   - Unusual activity detected
   - Credential compromise suspected
   - Security violation reported

2. **Initial Assessment**
   - What happened?
   - When did it happen?
   - What systems affected?

3. **Activate Response**
   - Notify team
   - Begin logging
   - Prepare for containment

#### Phase 2: Containment (15 minutes - 1 hour)

1. **Revoke Credentials**
   - GitHub PATs
   - Claude API keys
   - Other compromised credentials

2. **Stop Container**
   ```bash
   docker-compose down
   ```

3. **Preserve Evidence**
   ```bash
   docker-compose logs > incident-logs.txt
   cp -r data/ evidence-$(date +%Y%m%d-%H%M%S)/
   ```

4. **Assess Damage**
   - Check GitHub activity
   - Review API usage
   - Scan for unauthorized changes

#### Phase 3: Eradication (1-4 hours)

1. **Identify Root Cause**
   - Which PR introduced vulnerability?
   - What code executed?
   - How were credentials accessed?

2. **Remove Malicious Code**
   - Revert malicious commits
   - Remove backdoors
   - Fix vulnerabilities

3. **Clean Environment**
   ```bash
   rm -rf data/
   docker system prune -a
   git clean -fdx
   ```

#### Phase 4: Recovery (4-24 hours)

1. **Rebuild Securely**
   - Fresh container setup
   - New credentials
   - Updated validation

2. **Verify Integrity**
   - Run all validation checks
   - Test functionality
   - Confirm security measures

3. **Resume Operations**
   - Document incident
   - Update team
   - Return to normal operations

#### Phase 5: Post-Incident (1-7 days)

1. **Write Incident Report**
   - Timeline
   - Root cause
   - Impact assessment
   - Lessons learned

2. **Improve Security**
   - Implement new safeguards
   - Update documentation
   - Enhance monitoring

3. **Share Knowledge**
   - Brief team
   - Update procedures
   - Document improvements

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

**Instead**:
1. Email repository maintainer directly
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Allow 90 days for fix before public disclosure

## Security Audit

### Self-Audit Checklist

Run this checklist monthly:

#### Configuration Audit

- [ ] Credentials stored in `./data/.config/` (gitignored)
- [ ] File permissions: 600 for files, 700 for directories
- [ ] Credentials mounted read-only (`:ro`)
- [ ] Resource limits configured (CPU, memory)
- [ ] Read-only root filesystem enabled
- [ ] Non-root user configured
- [ ] Capabilities dropped
- [ ] Security options enabled

#### Code Audit

- [ ] No hardcoded credentials
- [ ] No suspicious network calls
- [ ] Validation scripts pass
- [ ] Dependencies up to date (`npm audit`)
- [ ] No obvious backdoors

#### Activity Audit

- [ ] Review GitHub security log
- [ ] Check Anthropic usage
- [ ] Review container logs
- [ ] Check for unexpected network connections
- [ ] Verify credential rotation dates

#### Process Audit

- [ ] Team trained on security practices
- [ ] Incident response plan reviewed
- [ ] Documentation up to date
- [ ] Validation scripts working
- [ ] Monitoring in place

### External Audit

For production deployments, consider:
- Professional security audit
- Penetration testing
- Code review by security expert
- Container security scanning

## References

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [OWASP Container Security](https://owasp.org/www-project-container-security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## Changelog

- **2025-01-XX**: Initial security documentation
- **Future**: Add network policy filtering
- **Future**: Add API rate limiting
- **Future**: Add automated credential rotation

---

**Remember**: Security is a process, not a product. Stay vigilant, keep learning, and always review code before running it.
