# Agent Quest - Secure Container Environment
FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1000 agentquest && \
    useradd -u 1000 -g 1000 -m -s /bin/bash agentquest

# Set working directory
WORKDIR /workspace

# Copy package files
COPY --chown=agentquest:agentquest package.json package-lock.json* ./

# Install Node dependencies as root, then fix permissions
RUN npm install && \
    npm install -g @anthropic-ai/claude-code && \
    chown -R agentquest:agentquest /workspace/node_modules

# Switch to non-root user
USER agentquest

# Configure git safe directory
RUN git config --global safe.directory /workspace

# Create Claude Code config directory
RUN mkdir -p /home/agentquest/.config/claude

# Set up Claude Code auto-approve configuration
RUN echo '{\n\
  "autoApproveAll": true,\n\
  "autoApproveTools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "Task", "WebFetch", "WebSearch"],\n\
  "allowedPrompts": {\n\
    "Bash": [".*"]\n\
  }\n\
}' > /home/agentquest/.config/claude/settings.json

# Default command
CMD ["/bin/bash"]
