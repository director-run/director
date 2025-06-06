import { beforeEach, describe, expect, test, vi } from "vitest";
import { VSCodeInstaller } from "./vscode";

vi.mock("@director.run/utilities/os", () => ({
  isAppInstalled: vi.fn(() => true),
  isFilePresent: vi.fn(() => true),
  App: {
    VSCODE: "Visual Studio Code",
  },
}));

vi.mock("@director.run/utilities/json", () => ({
  readJSONFile: vi.fn(),
  writeJSONFile: vi.fn(),
}));

const { readJSONFile, writeJSONFile } = await import(
  "@director.run/utilities/json"
);

const mockConfig = {
  mcp: {
    servers: {
      "existing-server": {
        url: "https://example.com/existing-server/sse",
      },
    },
  },
  "editor.fontSize": 14,
  "editor.tabSize": 2,
};

describe("VSCodeInstaller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readJSONFile).mockResolvedValue(mockConfig);
  });

  test("should install a new server", async () => {
    const installer = await VSCodeInstaller.create();
    await installer.install({
      name: "test-server",
      url: "https://example.com/test-server/sse",
    });

    expect(writeJSONFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        mcp: {
          servers: expect.objectContaining({
            "director__test-server": {
              url: "https://example.com/test-server/sse",
            },
          }),
        },
      }),
    );
  });

  test("should list installed servers", async () => {
    const configWithDirectorServer = {
      ...mockConfig,
      mcp: {
        ...mockConfig.mcp,
        servers: {
          ...mockConfig.mcp.servers,
          "director__test-server": {
            url: "https://example.com/test-server/sse",
          },
        },
      },
    };

    vi.mocked(readJSONFile).mockResolvedValue(configWithDirectorServer);

    const installer = await VSCodeInstaller.create();
    const servers = await installer.list();

    expect(servers).toEqual([
      {
        name: "director__test-server",
        url: "https://example.com/test-server/sse",
      },
    ]);
  });

  test("should uninstall a server", async () => {
    const configWithDirectorServer = {
      ...mockConfig,
      mcp: {
        ...mockConfig.mcp,
        servers: {
          ...mockConfig.mcp.servers,
          "director__test-server": {
            url: "https://example.com/test-server/sse",
          },
        },
      },
    };

    vi.mocked(readJSONFile).mockResolvedValue(configWithDirectorServer);

    const installer = await VSCodeInstaller.create();
    await installer.uninstall("test-server");

    expect(writeJSONFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        mcp: {
          servers: {
            "director__existing-server": {
              url: "https://example.com/existing-server/sse",
            },
          },
        },
      }),
    );
  });
});
