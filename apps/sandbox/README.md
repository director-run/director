# Director VM Sandbox

> **Platform Requirements:** Apple Silicon (M1/M2/M3) only

## Overview

The Director VM Sandbox provides a secure environment for running MCP servers that execute untrusted code from the internet. By isolating code within an virtual machine, you can protect your system from potential security threats.

## Prerequisites

Install the required dependencies using Homebrew:

```bash
brew install cirruslabs/cli/tart
brew install ansible
brew install sshpass
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/theworkingcompany/director.git
cd apps/sandbox
```

### 2. Create and Provision the VM

```bash
# Create a new VM named 'my-sandbox' and start it
bun cli create my-sandbox --start

# Provision the VM with ansible
bun cli provision my-sandbox

# SSH into your VM
bun cli ssh my-sandbox
```

### 3. Start the Director Service

Inside the VM:

```bash
# Navigate to the shared directory
cd shared/director

# Start the Director service
bun cli serve
```

### 4. Connect from Host

On your host machine:

```bash
# Connect to the VM sandbox through the gateway
GATEWAY_URL=http://my-sandbox.local:3673 bun cli connect my-proxy -t claude
```

## Architecture

- **Host Machine**: Runs the VM management commands and connects to the sandbox
- **VM Sandbox**: Isolated Ubuntu environment running the Director service
- **Gateway**: HTTP endpoint at `<vm-name>.local:3673` for communication

## Planned Improvements

- [ ] Implement key-based SSH authentication (replace password authentication)
- [ ] Add `--mount` flag for directory mounting (e.g., `--mount director/source`)
- [ ] Create golden master image workflow for faster sandbox creation

## Security Considerations

- All untrusted code execution happens within the VM
- Network isolation prevents direct access to host resources
- VM can be destroyed and recreated cleanly if compromised