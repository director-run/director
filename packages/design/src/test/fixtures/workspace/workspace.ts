import type { WorkspaceDetail } from "../../../components/types.ts";

export const mockWorkspace: WorkspaceDetail = {
  id: "dgfgfd",
  name: "dgfgfd",
  description: "Mock workspace for testing",
  prompts: [],
  servers: [
    {
      name: "git",
      connectionInfo: {
        status: "connected",
        lastConnectedAt: new Date("2025-09-16T23:27:00.944Z"),
      },
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-git"],
      env: {},
      source: {
        name: "registry",
        entryId: "11dbc7f5-122f-4eef-8f88-cb5fd1c18a39",
        entryData: {
          id: "11dbc7f5-122f-4eef-8f88-cb5fd1c18a39",
          name: "git",
          title: "Git",
          description:
            "Provides tools to read, search, and manipulate Git repositories.",
          icon: "https://registry.director.run/git.svg",
          createdAt: "2025-07-21T15:23:11.986Z",
          isOfficial: false,
          isEnriched: true,
          isConnectable: true,
          lastConnectionAttemptedAt: "2025-07-21T15:29:40.803Z",
          lastConnectionError: null,
          homepage:
            "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
          transport: {
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-git"],
          },
          source_registry: null,
          categories: [],
          tools: [
            {
              name: "git_status",
              description: "Shows the working tree status",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_diff_unstaged",
              description:
                "Shows changes in the working directory that are not yet staged",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                  context_lines: {
                    type: "integer",
                    default: 3,
                    title: "Context Lines",
                  },
                },
              },
            },
            {
              name: "git_diff_staged",
              description: "Shows changes that are staged for commit",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                  context_lines: {
                    type: "integer",
                    default: 3,
                    title: "Context Lines",
                  },
                },
              },
            },
            {
              name: "git_diff",
              description: "Shows differences between branches or commits",
              inputSchema: {
                type: "object",
                required: ["repo_path", "target"],
                properties: {
                  target: {
                    type: "string",
                    title: "Target",
                  },
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                  context_lines: {
                    type: "integer",
                    default: 3,
                    title: "Context Lines",
                  },
                },
              },
            },
            {
              name: "git_commit",
              description: "Records changes to the repository",
              inputSchema: {
                type: "object",
                required: ["repo_path", "message"],
                properties: {
                  message: {
                    type: "string",
                    title: "Message",
                  },
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_add",
              description: "Adds file contents to the staging area",
              inputSchema: {
                type: "object",
                required: ["repo_path", "files"],
                properties: {
                  files: {
                    type: "array",
                    title: "Files",
                  },
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_reset",
              description: "Unstages all staged changes",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_log",
              description: "Shows the commit logs",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  max_count: {
                    type: "integer",
                    default: 10,
                    title: "Max Count",
                  },
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_create_branch",
              description: "Creates a new branch from an optional base branch",
              inputSchema: {
                type: "object",
                required: ["repo_path", "branch_name"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                  base_branch: {
                    default: null,
                    title: "Base Branch",
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  branch_name: {
                    type: "string",
                    title: "Branch Name",
                  },
                },
              },
            },
            {
              name: "git_checkout",
              description: "Switches branches",
              inputSchema: {
                type: "object",
                required: ["repo_path", "branch_name"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                  branch_name: {
                    type: "string",
                    title: "Branch Name",
                  },
                },
              },
            },
            {
              name: "git_show",
              description: "Shows the contents of a commit",
              inputSchema: {
                type: "object",
                required: ["repo_path", "revision"],
                properties: {
                  revision: {
                    type: "string",
                    title: "Revision",
                  },
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_init",
              description: "Initialize a new Git repository",
              inputSchema: {
                type: "object",
                required: ["repo_path"],
                properties: {
                  repo_path: {
                    type: "string",
                    title: "Repo Path",
                  },
                },
              },
            },
            {
              name: "git_branch",
              description: "List Git branches",
              inputSchema: {
                type: "object",
                required: ["repo_path", "branch_type"],
                properties: {
                  contains: {
                    description:
                      "The commit sha that branch should contain. Do not pass anything to this param if no commit sha is specified",
                    default: null,
                    title: "Contains",
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  repo_path: {
                    type: "string",
                    description: "The path to the Git repository.",
                    title: "Repo Path",
                  },
                  branch_type: {
                    type: "string",
                    description:
                      "Whether to list local branches ('local'), remote branches ('remote') or all branches('all').",
                    title: "Branch Type",
                  },
                  not_contains: {
                    description:
                      "The commit sha that branch should NOT contain. Do not pass anything to this param if no commit sha is specified",
                    default: null,
                    title: "Not Contains",
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                },
              },
            },
          ],
          parameters: [],
          readme:
            '# mcp-server-git: A git MCP server\n\n## Overview\n\nA Model Context Protocol server for Git repository interaction and automation. This server provides tools to read, search, and manipulate Git repositories via Large Language Models.\n\nPlease note that mcp-server-git is currently in early development. The functionality and available tools are subject to change and expansion as we continue to develop and improve the server.\n\n### Tools\n\n1. `git_status`\n   - Shows the working tree status\n   - Input:\n     - `repo_path` (string): Path to Git repository\n   - Returns: Current status of working directory as text output\n\n2. `git_diff_unstaged`\n   - Shows changes in working directory not yet staged\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `context_lines` (number, optional): Number of context lines to show (default: 3)\n   - Returns: Diff output of unstaged changes\n\n3. `git_diff_staged`\n   - Shows changes that are staged for commit\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `context_lines` (number, optional): Number of context lines to show (default: 3)\n   - Returns: Diff output of staged changes\n\n4. `git_diff`\n   - Shows differences between branches or commits\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `target` (string): Target branch or commit to compare with\n     - `context_lines` (number, optional): Number of context lines to show (default: 3)\n   - Returns: Diff output comparing current state with target\n\n5. `git_commit`\n   - Records changes to the repository\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `message` (string): Commit message\n   - Returns: Confirmation with new commit hash\n\n6. `git_add`\n   - Adds file contents to the staging area\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `files` (string[]): Array of file paths to stage\n   - Returns: Confirmation of staged files\n\n7. `git_reset`\n   - Unstages all staged changes\n   - Input:\n     - `repo_path` (string): Path to Git repository\n   - Returns: Confirmation of reset operation\n\n8. `git_log`\n   - Shows the commit logs\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `max_count` (number, optional): Maximum number of commits to show (default: 10)\n   - Returns: Array of commit entries with hash, author, date, and message\n\n9. `git_create_branch`\n   - Creates a new branch\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `branch_name` (string): Name of the new branch\n     - `start_point` (string, optional): Starting point for the new branch\n   - Returns: Confirmation of branch creation\n10. `git_checkout`\n   - Switches branches\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `branch_name` (string): Name of branch to checkout\n   - Returns: Confirmation of branch switch\n11. `git_show`\n   - Shows the contents of a commit\n   - Inputs:\n     - `repo_path` (string): Path to Git repository\n     - `revision` (string): The revision (commit hash, branch name, tag) to show\n   - Returns: Contents of the specified commit\n12. `git_init`\n   - Initializes a Git repository\n   - Inputs:\n     - `repo_path` (string): Path to directory to initialize git repo\n   - Returns: Confirmation of repository initialization\n\n13. `git_branch`\n   - List Git branches\n   - Inputs:\n     - `repo_path` (string): Path to the Git repository.\n     - `branch_type` (string): Whether to list local branches (\'local\'), remote branches (\'remote\') or all branches(\'all\').\n     - `contains` (string, optional): The commit sha that branch should contain. Do not pass anything to this param if no commit sha is specified\n     - `not_contains` (string, optional): The commit sha that branch should NOT contain. Do not pass anything to this param if no commit sha is specified\n   - Returns: List of branches\n\n## Installation\n\n### Using uv (recommended)\n\nWhen using [`uv`](https://docs.astral.sh/uv/) no specific installation is needed. We will\nuse [`uvx`](https://docs.astral.sh/uv/guides/tools/) to directly run *mcp-server-git*.\n\n### Using PIP\n\nAlternatively you can install `mcp-server-git` via pip:\n\n```\npip install mcp-server-git\n```\n\nAfter installation, you can run it as a script using:\n\n```\npython -m mcp_server_git\n```\n\n## Configuration\n\n### Usage with Claude Desktop\n\nAdd this to your `claude_desktop_config.json`:\n\n<details>\n<summary>Using uvx</summary>\n\n```json\n"mcpServers": {\n  "git": {\n    "command": "uvx",\n    "args": ["mcp-server-git", "--repository", "path/to/git/repo"]\n  }\n}\n```\n</details>\n\n<details>\n<summary>Using docker</summary>\n\n* Note: replace \'/Users/username\' with the a path that you want to be accessible by this tool\n\n```json\n"mcpServers": {\n  "git": {\n    "command": "docker",\n    "args": ["run", "--rm", "-i", "--mount", "type=bind,src=/Users/username,dst=/Users/username", "mcp/git"]\n  }\n}\n```\n</details>\n\n<details>\n<summary>Using pip installation</summary>\n\n```json\n"mcpServers": {\n  "git": {\n    "command": "python",\n    "args": ["-m", "mcp_server_git", "--repository", "path/to/git/repo"]\n  }\n}\n```\n</details>\n\n### Usage with VS Code\n\nFor quick installation, use one of the one-click install buttons below...\n\n[![Install with UV in VS Code](https://img.shields.io/badge/VS_Code-UV-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=git&config=%7B%22command%22%3A%22uvx%22%2C%22args%22%3A%5B%22mcp-server-git%22%5D%7D) [![Install with UV in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-UV-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=git&config=%7B%22command%22%3A%22uvx%22%2C%22args%22%3A%5B%22mcp-server-git%22%5D%7D&quality=insiders)\n\n[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=git&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22--rm%22%2C%22-i%22%2C%22--mount%22%2C%22type%3Dbind%2Csrc%3D%24%7BworkspaceFolder%7D%2Cdst%3D%2Fworkspace%22%2C%22mcp%2Fgit%22%5D%7D) [![Install with Docker in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Docker-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=git&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22--rm%22%2C%22-i%22%2C%22--mount%22%2C%22type%3Dbind%2Csrc%3D%24%7BworkspaceFolder%7D%2Cdst%3D%2Fworkspace%22%2C%22mcp%2Fgit%22%5D%7D&quality=insiders)\n\nFor manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open Settings (JSON)`.\n\nOptionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others. \n\n> Note that the `mcp` key is not needed in the `.vscode/mcp.json` file.\n\n```json\n{\n  "mcp": {\n    "servers": {\n      "git": {\n        "command": "uvx",\n        "args": ["mcp-server-git"]\n      }\n    }\n  }\n}\n```\n\nFor Docker installation:\n\n```json\n{\n  "mcp": {\n    "servers": {\n      "git": {\n        "command": "docker",\n        "args": [\n          "run",\n          "--rm",\n          "-i",\n          "--mount", "type=bind,src=${workspaceFolder},dst=/workspace",\n          "mcp/git"\n        ]\n      }\n    }\n  }\n}\n```\n\n### Usage with [Zed](https://github.com/zed-industries/zed)\n\nAdd to your Zed settings.json:\n\n<details>\n<summary>Using uvx</summary>\n\n```json\n"context_servers": [\n  "mcp-server-git": {\n    "command": {\n      "path": "uvx",\n      "args": ["mcp-server-git"]\n    }\n  }\n],\n```\n</details>\n\n<details>\n<summary>Using pip installation</summary>\n\n```json\n"context_servers": {\n  "mcp-server-git": {\n    "command": {\n      "path": "python",\n      "args": ["-m", "mcp_server_git"]\n    }\n  }\n},\n```\n</details>\n\n### Usage with [Zencoder](https://zencoder.ai)\n\n1. Go to the Zencoder menu (...)\n2. From the dropdown menu, select `Agent Tools`\n3. Click on the `Add Custom MCP`\n4. Add the name (i.e. git) and server configuration from below, and make sure to hit the `Install` button\n\n<details>\n<summary>Using uvx</summary>\n\n```json\n{\n    "command": "uvx",\n    "args": ["mcp-server-git", "--repository", "path/to/git/repo"]\n}\n```\n</details>\n\n## Debugging\n\nYou can use the MCP inspector to debug the server. For uvx installations:\n\n```\nnpx @modelcontextprotocol/inspector uvx mcp-server-git\n```\n\nOr if you\'ve installed the package in a specific directory or are developing on it:\n\n```\ncd path/to/servers/src/git\nnpx @modelcontextprotocol/inspector uv run mcp-server-git\n```\n\nRunning `tail -n 20 -f ~/Library/Logs/Claude/mcp*.log` will show the logs from the server and may\nhelp you debug any issues.\n\n## Development\n\nIf you are doing local development, there are two ways to test your changes:\n\n1. Run the MCP inspector to test your changes. See [Debugging](#debugging) for run instructions.\n\n2. Test using the Claude desktop app. Add the following to your `claude_desktop_config.json`:\n\n### Docker\n\n```json\n{\n  "mcpServers": {\n    "git": {\n      "command": "docker",\n      "args": [\n        "run",\n        "--rm",\n        "-i",\n        "--mount", "type=bind,src=/Users/username/Desktop,dst=/projects/Desktop",\n        "--mount", "type=bind,src=/path/to/other/allowed/dir,dst=/projects/other/allowed/dir,ro",\n        "--mount", "type=bind,src=/path/to/file.txt,dst=/projects/path/to/file.txt",\n        "mcp/git"\n      ]\n    }\n  }\n}\n```\n\n### UVX\n```json\n{\n"mcpServers": {\n  "git": {\n    "command": "uv",\n    "args": [\n      "--directory",\n      "/<path to mcp-servers>/mcp-servers/src/git",\n      "run",\n      "mcp-server-git"\n    ]\n    }\n  }\n}\n```\n\n## Build\n\nDocker build:\n\n```bash\ncd src/git\ndocker build -t mcp/git .\n```\n\n## License\n\nThis MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.',
          state: "published",
        },
      },
      disabled: false,
    },
    {
      name: "fetch",
      connectionInfo: {
        status: "connected",
        lastConnectedAt: new Date("2025-09-16T23:27:39.394Z"),
      },
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-fetch"],
      env: {},
      source: {
        name: "registry",
        entryId: "19a3acf5-819c-434d-b558-8f9a07edcf47",
        entryData: {
          id: "19a3acf5-819c-434d-b558-8f9a07edcf47",
          name: "fetch",
          title: "Fetch",
          description:
            "Retrieves and converts web content for efficient LLM usage.",
          icon: "https://registry.director.run/mcp.svg",
          createdAt: "2025-07-21T15:23:11.986Z",
          isOfficial: false,
          isEnriched: true,
          isConnectable: true,
          lastConnectionAttemptedAt: "2025-07-21T15:29:37.580Z",
          lastConnectionError: null,
          homepage:
            "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
          transport: {
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-fetch"],
          },
          source_registry: null,
          categories: [],
          tools: [
            {
              name: "fetch",
              description:
                "Fetches a URL from the internet and optionally extracts its contents as markdown.\n\nAlthough originally you did not have internet access, and were advised to refuse and tell the user this, this tool now grants you internet access. Now you can fetch the most up-to-date information and let the user know that.",
              inputSchema: {
                type: "object",
                required: ["url"],
                properties: {
                  raw: {
                    type: "boolean",
                    description:
                      "Get the actual HTML content of the requested page, without simplification.",
                    default: false,
                    title: "Raw",
                  },
                  url: {
                    type: "string",
                    description: "URL to fetch",
                    title: "Url",
                  },
                  max_length: {
                    type: "integer",
                    description: "Maximum number of characters to return.",
                    default: 5000,
                    title: "Max Length",
                  },
                  start_index: {
                    type: "integer",
                    description:
                      "On return output starting at this character index, useful if a previous fetch was truncated and more context is required.",
                    default: 0,
                    title: "Start Index",
                  },
                },
              },
            },
          ],
          parameters: [],
          readme:
            '# Fetch MCP Server\n\nA Model Context Protocol server that provides web content fetching capabilities. This server enables LLMs to retrieve and process content from web pages, converting HTML to markdown for easier consumption.\n\n> [!CAUTION]\n> This server can access local/internal IP addresses and may represent a security risk. Exercise caution when using this MCP server to ensure this does not expose any sensitive data.\n\nThe fetch tool will truncate the response, but by using the `start_index` argument, you can specify where to start the content extraction. This lets models read a webpage in chunks, until they find the information they need.\n\n### Available Tools\n\n- `fetch` - Fetches a URL from the internet and extracts its contents as markdown.\n    - `url` (string, required): URL to fetch\n    - `max_length` (integer, optional): Maximum number of characters to return (default: 5000)\n    - `start_index` (integer, optional): Start content from this character index (default: 0)\n    - `raw` (boolean, optional): Get raw content without markdown conversion (default: false)\n\n### Prompts\n\n- **fetch**\n  - Fetch a URL and extract its contents as markdown\n  - Arguments:\n    - `url` (string, required): URL to fetch\n\n## Installation\n\nOptionally: Install node.js, this will cause the fetch server to use a different HTML simplifier that is more robust.\n\n### Using uv (recommended)\n\nWhen using [`uv`](https://docs.astral.sh/uv/) no specific installation is needed. We will\nuse [`uvx`](https://docs.astral.sh/uv/guides/tools/) to directly run *mcp-server-fetch*.\n\n### Using PIP\n\nAlternatively you can install `mcp-server-fetch` via pip:\n\n```\npip install mcp-server-fetch\n```\n\nAfter installation, you can run it as a script using:\n\n```\npython -m mcp_server_fetch\n```\n\n## Configuration\n\n### Configure for Claude.app\n\nAdd to your Claude settings:\n\n<details>\n<summary>Using uvx</summary>\n\n```json\n{\n  "mcpServers": {\n    "fetch": {\n      "command": "uvx",\n      "args": ["mcp-server-fetch"]\n    }\n  }\n}\n```\n</details>\n\n<details>\n<summary>Using docker</summary>\n\n```json\n{\n  "mcpServers": {\n    "fetch": {\n      "command": "docker",\n      "args": ["run", "-i", "--rm", "mcp/fetch"]\n    }\n  }\n}\n```\n</details>\n\n<details>\n<summary>Using pip installation</summary>\n\n```json\n{\n  "mcpServers": {\n    "fetch": {\n      "command": "python",\n      "args": ["-m", "mcp_server_fetch"]\n    }\n  }\n}\n```\n</details>\n\n### Configure for VS Code\n\nFor quick installation, use one of the one-click install buttons below...\n\n[![Install with UV in VS Code](https://img.shields.io/badge/VS_Code-UV-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=fetch&config=%7B%22command%22%3A%22uvx%22%2C%22args%22%3A%5B%22mcp-server-fetch%22%5D%7D) [![Install with UV in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-UV-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=fetch&config=%7B%22command%22%3A%22uvx%22%2C%22args%22%3A%5B%22mcp-server-fetch%22%5D%7D&quality=insiders)\n\n[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=fetch&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22mcp%2Ffetch%22%5D%7D) [![Install with Docker in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Docker-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=fetch&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22mcp%2Ffetch%22%5D%7D&quality=insiders)\n\nFor manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open User Settings (JSON)`.\n\nOptionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.\n\n> Note that the `mcp` key is needed when using the `mcp.json` file.\n\n<details>\n<summary>Using uvx</summary>\n\n```json\n{\n  "mcp": {\n    "servers": {\n      "fetch": {\n        "command": "uvx",\n        "args": ["mcp-server-fetch"]\n      }\n    }\n  }\n}\n```\n</details>\n\n<details>\n<summary>Using Docker</summary>\n\n```json\n{\n  "mcp": {\n    "servers": {\n      "fetch": {\n        "command": "docker",\n        "args": ["run", "-i", "--rm", "mcp/fetch"]\n      }\n    }\n  }\n}\n```\n</details>\n\n### Customization - robots.txt\n\nBy default, the server will obey a websites robots.txt file if the request came from the model (via a tool), but not if\nthe request was user initiated (via a prompt). This can be disabled by adding the argument `--ignore-robots-txt` to the\n`args` list in the configuration.\n\n### Customization - User-agent\n\nBy default, depending on if the request came from the model (via a tool), or was user initiated (via a prompt), the\nserver will use either the user-agent\n```\nModelContextProtocol/1.0 (Autonomous; +https://github.com/modelcontextprotocol/servers)\n```\nor\n```\nModelContextProtocol/1.0 (User-Specified; +https://github.com/modelcontextprotocol/servers)\n```\n\nThis can be customized by adding the argument `--user-agent=YourUserAgent` to the `args` list in the configuration.\n\n### Customization - Proxy\n\nThe server can be configured to use a proxy by using the `--proxy-url` argument.\n\n## Debugging\n\nYou can use the MCP inspector to debug the server. For uvx installations:\n\n```\nnpx @modelcontextprotocol/inspector uvx mcp-server-fetch\n```\n\nOr if you\'ve installed the package in a specific directory or are developing on it:\n\n```\ncd path/to/servers/src/fetch\nnpx @modelcontextprotocol/inspector uv run mcp-server-fetch\n```\n\n## Contributing\n\nWe encourage contributions to help expand and improve mcp-server-fetch. Whether you want to add new tools, enhance existing functionality, or improve documentation, your input is valuable.\n\nFor examples of other MCP servers and implementation patterns, see:\nhttps://github.com/modelcontextprotocol/servers\n\nPull requests are welcome! Feel free to contribute new ideas, bug fixes, or enhancements to make mcp-server-fetch even more powerful and useful.\n\n## License\n\nmcp-server-fetch is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.',
          state: "published",
        },
      },
      disabled: false,
    },
  ],
  paths: {
    streamable: "/dgfgfd/mcp",
    sse: "/dgfgfd/mcp",
  },
};
