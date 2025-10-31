# @director.run/cli

## 1.1.1

### Patch Changes

- [#414](https://github.com/director-run/director/pull/414) [`e21f9d1`](https://github.com/director-run/director/commit/e21f9d19fb6eb2601342c7cb4b0dab7f162492ee) Thanks [@barnaby](https://github.com/barnaby)! - Fix Gateway SDK example

## 1.1.0

## 1.0.2

### Patch Changes

- [#410](https://github.com/director-run/director/pull/410) [`b36a070`](https://github.com/director-run/director/commit/b36a07010cf25b4b763bff3f4b98dbba08d7d87c) Thanks [@barnaby](https://github.com/barnaby)! - Update documentation & fix broken sdk install

## 1.0.1

### Patch Changes

- [#407](https://github.com/director-run/director/pull/407) [`5ef3608`](https://github.com/director-run/director/commit/5ef36081008b194e54b8dfd3a11b14c9ae8ef5e4) Thanks [@barnaby](https://github.com/barnaby)! - Fix typos & spelling

## 1.0.0

### Major Changes

- [#405](https://github.com/director-run/director/pull/405) [`df0305f`](https://github.com/director-run/director/commit/df0305f88a70e70d593fa441292a332455a98c97) Thanks [@barnaby](https://github.com/barnaby)! - Introducing Director V1: Playbooks for AI Agents.

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

## 0.3.0

### Minor Changes

- [#373](https://github.com/director-run/director/pull/373) [`5d0d956`](https://github.com/director-run/director/commit/5d0d95697e0c33f97ae7934e728c27026e8ba77f) Thanks [@barnaby](https://github.com/barnaby)! - 'director studio' opens up the locally hosted version of the studio

## 0.2.2

### Patch Changes

- [#371](https://github.com/director-run/director/pull/371) [`b7645d7`](https://github.com/director-run/director/commit/b7645d7588df323ef8230363d50e81297b9743d5) Thanks [@barnaby](https://github.com/barnaby)! - fix: studio path resolution in compiled cli JS

## 0.2.1

### Patch Changes

- [#369](https://github.com/director-run/director/pull/369) [`ef6d90b`](https://github.com/director-run/director/commit/ef6d90b603b89637cd2805a23e41b2420fe126d5) Thanks [@barnaby](https://github.com/barnaby)! - fix 404 error when trying to access locally hosted studio

## 0.2.0

### Minor Changes

- [#367](https://github.com/director-run/director/pull/367) [`92fb2b1`](https://github.com/director-run/director/commit/92fb2b142a68264a84ea720cda8b62a6981b34ff) Thanks [@barnaby](https://github.com/barnaby)! - package studio inside of @director.run/cli

## 0.1.0

### Minor Changes

- [#313](https://github.com/director-run/director/pull/313) [`850f279`](https://github.com/director-run/director/commit/850f279c44360762bc4c30d44d709e5ea43a937a) Thanks [@barnaby](https://github.com/barnaby)! - This release introduces a number of major improvements to director:

  - oAuth support
  - ability to filter / omit tools from a proxy
  - ability to disable a server
  - ability to add tool prefixes
  - ability to add prompts to proxy servers
  - use yaml instead of json for configuration file

  currently this functionality is available in the CLI and configuration file, we'll update the UI next.
