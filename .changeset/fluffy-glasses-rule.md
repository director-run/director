---
"@director.run/cli": major
"@director.run/docker": major
"@director.run/sdk": major
---

Introducing Director V1: Playbooks for AI Agents.

Playbooks are sets of MCP tools, prompts and configuration that give your agent new abilities. Director maintains playbook definitions as flat YAML files, which makes them them easy to share and edit.

You can think of a Playbook like a Claude Skill, but for any agent, powered by MCP. Director has 1-click integrations with Claude Code, Cursor, Claude Desktop and VSCode, making it lighting fast to switch playbooks in and out of context. And tool filtering to keep your context clean and focused.

If you'd like to see it in action, head over to the home page to [watch the demo video](https://director.run)

## Release Notes

- <ins>**Playbooks**</ins> group MCP tools, prompts and configuration into a single entity
- Full <ins>**OAuth support**</ins> for MCP servers (currently supported by Notion and Sentry)
- <ins>**Tool filtering & prefixing**</ins>, allowing you to add only the tools you need to a playbook / context
- 1-click <ins>**Claude Code**</ins> integration
- Move config from JSON to YAML for better readability and editing experience
- Ability to maintain <ins>**playbook to client mapping in config**</ins>, which is enforced at startup
- Config search pattern will look for config in current directory if available, otherwise will default to ~/.director/. (so you can commit playbooks to version control)
- MCP server <ins>**connection status / lifecycle management**</ins>
- Bundle the Studio with the CLI, which makes it work in Safari and Brave
- Basic MCP debugging capabilities in the CLI (`director mcp`)
- Added <ins>**Sentry**</ins> and <ins>**Postgres**</ins> MCP servers to the registry