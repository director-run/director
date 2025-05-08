import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { db } from "../../../../db/src";
import type { ProxyTargetAttributes } from "../../../../db/src/schema";
import { ProxyServer } from "../../../../mcp/src/proxy-server";

import { fetchEntry } from "@director.run/registry-client/client";

const logger = getLogger("ProxyServerStore");

export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServer> = new Map();

  private constructor() {}

  public static async create(): Promise<ProxyServerStore> {
    logger.info("Creating and initializing ProxyServerStore...");
    const store = new ProxyServerStore();
    await store.initialize();
    logger.info("ProxyServerStore initialization complete.");
    return store;
  }

  private async initialize(): Promise<void> {
    logger.info("Fetching proxy configurations...");
    let proxies = await db.getAll();

    for (const proxyConfig of proxies) {
      const proxyId = proxyConfig.id;
      logger.info({ message: `Initializing proxy`, proxyId });

      const proxyServer = new ProxyServer({
        id: proxyId,
        name: proxyConfig.name,
        description: proxyConfig.description ?? undefined,
        servers: proxyConfig.servers,
      });
      await proxyServer.connectTargets();
      this.proxyServers.set(proxyId, proxyServer);
    }
  }

  public get(proxyId: string) {
    const server = this.proxyServers.get(proxyId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Proxy server '${proxyId}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async delete(proxyId: string) {
    const proxy = this.get(proxyId);
    await proxy.close();
    await db.deleteProxy(proxyId);
    this.proxyServers.delete(proxyId);
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async purge() {
    await this.closeAll();
    await db.purge();
    this.proxyServers.clear();
  }

  async closeAll() {
    logger.info("cleaning up all proxy servers...");
    await Promise.all(
      Array.from(this.proxyServers.values()).map((proxy) => proxy.close()),
    );
    logger.info("finished cleaning up all proxy servers.");
  }

  public getAll(): ProxyServer[] {
    return Array.from(this.proxyServers.values());
  }

  public async create({
    name,
    description,
    servers,
  }: {
    name: string;
    description?: string;
    servers?: ProxyTargetAttributes[];
  }): Promise<ProxyServer> {
    const newProxy = await db.addProxy({
      name,
      description,
      servers: servers ?? [],
    });
    const proxyServer = new ProxyServer({
      name: name,
      id: newProxy.id,
      servers: newProxy.servers,
    });
    await proxyServer.connectTargets();
    this.proxyServers.set(newProxy.id, proxyServer);
    logger.info({ message: `Created new proxy`, proxyId: newProxy.id });
    return proxyServer;
  }

  public async addServer(
    proxyId: string,
    server: ProxyTargetAttributes,
  ): Promise<ProxyServer> {
    const proxy = this.get(proxyId);
    // TODO: Implement a more efficient update mechanism without recreating the proxy server
    const updatedProxy = await this.update(proxyId, {
      servers: [...proxy.attributes.servers, server],
    });
    return updatedProxy;
  }

  public async removeServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyServer> {
    const proxy = this.get(proxyId);
    // TODO: don't re-create the proxy server, just update the servers
    const updatedProxy = await this.update(proxyId, {
      servers: proxy.attributes.servers.filter(
        (s) => s.name.toLowerCase() !== serverName.toLowerCase(),
      ),
    });
    return updatedProxy;
  }

  public async addServerFromRegistry(
    proxyId: string,
    entryId: string,
  ): Promise<ProxyServer> {
    const entry = await fetchEntry(entryId);
    if (!entry) {
      throw new AppError(ErrorCode.NOT_FOUND, `Entry '${entryId}' not found.`);
    }
    return this.addServer(proxyId, entry);
  }

  public async update(
    proxyId: string,
    attributes: Partial<{
      name: string;
      description: string;
      servers: ProxyTargetAttributes[];
    }>,
  ) {
    const proxy = this.get(proxyId);
    await proxy.close();
    const updatedProxyEntry = await db.updateProxy(proxyId, attributes);
    const updatedProxy = new ProxyServer({
      id: proxyId,
      name: updatedProxyEntry.name,
      description: updatedProxyEntry.description ?? undefined,
      servers: updatedProxyEntry.servers ?? [],
    });
    await updatedProxy.connectTargets();
    this.proxyServers.set(proxyId, updatedProxy);
    logger.info({ message: `Updated proxy`, proxyId });
    return updatedProxy;
  }
}
