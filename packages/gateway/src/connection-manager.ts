import { getLogger } from "@director.run/utilities/logger";
import LRUCache from "lru-cache";

const logger = getLogger("ConnectionManager");

export interface ConnectionInfo {
  id: string;
  proxyId: string;
  serverName: string;
  lastUsed: Date;
  connectionCount: number;
  isHealthy: boolean;
}

export interface ConnectionManagerConfig {
  maxConnections: number;
  connectionTTL: number; // milliseconds
  healthCheckInterval: number; // milliseconds
  enableConnectionReuse: boolean;
}

const DEFAULT_CONFIG: ConnectionManagerConfig = {
  maxConnections: 100,
  connectionTTL: 300000, // 5 minutes
  healthCheckInterval: 60000, // 1 minute
  enableConnectionReuse: true,
};

export class ConnectionManager {
  private connections: LRUCache<string, ConnectionInfo>;
  private config: ConnectionManagerConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: Partial<ConnectionManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.connections = new LRUCache<string, ConnectionInfo>({
      max: this.config.maxConnections,
      ttl: this.config.connectionTTL,
      dispose: (value: ConnectionInfo, key: string) => {
        logger.debug({
          message: "connection disposed from cache",
          connectionId: key,
          proxyId: value.proxyId,
          serverName: value.serverName,
        });
      },
    });

    if (this.config.enableConnectionReuse) {
      this.startHealthChecks();
    }
  }

  public registerConnection(proxyId: string, serverName: string): string {
    const connectionId = `${proxyId}:${serverName}`;

    const existingConnection = this.connections.get(connectionId);
    if (existingConnection) {
      existingConnection.lastUsed = new Date();
      existingConnection.connectionCount++;

      logger.debug({
        message: "reusing existing connection",
        connectionId,
        connectionCount: existingConnection.connectionCount,
      });

      return connectionId;
    }

    const connectionInfo: ConnectionInfo = {
      id: connectionId,
      proxyId,
      serverName,
      lastUsed: new Date(),
      connectionCount: 1,
      isHealthy: true,
    };

    this.connections.set(connectionId, connectionInfo);

    logger.debug({
      message: "registered new connection",
      connectionId,
      proxyId,
      serverName,
    });

    return connectionId;
  }

  public updateConnectionHealth(
    connectionId: string,
    isHealthy: boolean,
  ): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isHealthy = isHealthy;
      connection.lastUsed = new Date();

      logger.debug({
        message: "updated connection health",
        connectionId,
        isHealthy,
      });
    }
  }

  public removeConnection(connectionId: string): boolean {
    const removed = this.connections.delete(connectionId);

    if (removed) {
      logger.debug({
        message: "removed connection",
        connectionId,
      });
    }

    return removed;
  }

  public getConnection(connectionId: string): ConnectionInfo | undefined {
    return this.connections.get(connectionId);
  }

  public getConnectionsByProxy(proxyId: string): ConnectionInfo[] {
    const connections: ConnectionInfo[] = [];

    for (const [, connection] of this.connections) {
      if (connection.proxyId === proxyId) {
        connections.push(connection);
      }
    }

    return connections;
  }

  public getHealthyConnections(): ConnectionInfo[] {
    const connections: ConnectionInfo[] = [];

    for (const [, connection] of this.connections) {
      if (connection.isHealthy) {
        connections.push(connection);
      }
    }

    return connections;
  }

  public getStats() {
    const totalConnections = this.connections.size;
    const healthyConnections = this.getHealthyConnections().length;
    const unhealthyConnections = totalConnections - healthyConnections;

    const connectionsByProxy: Record<string, number> = {};
    for (const [, connection] of this.connections) {
      connectionsByProxy[connection.proxyId] =
        (connectionsByProxy[connection.proxyId] || 0) + 1;
    }

    return {
      totalConnections,
      healthyConnections,
      unhealthyConnections,
      maxConnections: this.config.maxConnections,
      connectionsByProxy,
      config: this.config,
    };
  }

  public cleanup(): void {
    const now = new Date();
    const connectionsToRemove: string[] = [];

    for (const [connectionId, connection] of this.connections) {
      const timeSinceLastUsed = now.getTime() - connection.lastUsed.getTime();

      if (
        timeSinceLastUsed > this.config.connectionTTL ||
        !connection.isHealthy
      ) {
        connectionsToRemove.push(connectionId);
      }
    }

    for (const connectionId of connectionsToRemove) {
      this.removeConnection(connectionId);
    }

    if (connectionsToRemove.length > 0) {
      logger.info({
        message: "cleaned up stale connections",
        removedCount: connectionsToRemove.length,
      });
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.cleanup();
    }, this.config.healthCheckInterval);

    logger.info({
      message: "started connection health checks",
      interval: this.config.healthCheckInterval,
    });
  }

  public stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.connections.clear();

    logger.info({
      message: "connection manager stopped",
    });
  }

  public updateConfig(config: Partial<ConnectionManagerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };

    // Recreate LRU cache if max connections or TTL changed
    if (
      oldConfig.maxConnections !== this.config.maxConnections ||
      oldConfig.connectionTTL !== this.config.connectionTTL
    ) {
      const oldConnections = new Map(this.connections);

      this.connections = new LRUCache<string, ConnectionInfo>({
        max: this.config.maxConnections,
        ttl: this.config.connectionTTL,
        dispose: (value: ConnectionInfo, key: string) => {
          logger.debug({
            message: "connection disposed from cache",
            connectionId: key,
            proxyId: value.proxyId,
            serverName: value.serverName,
          });
        },
      });

      // Restore connections that fit in new cache
      for (const [key, value] of oldConnections) {
        this.connections.set(key, value);
      }
    }

    // Restart health checks if interval changed
    if (oldConfig.healthCheckInterval !== this.config.healthCheckInterval) {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.config.enableConnectionReuse) {
        this.startHealthChecks();
      }
    }

    logger.info({
      message: "connection manager config updated",
      oldConfig,
      newConfig: this.config,
    });
  }

  public getConnectionHistory(connectionId: string): {
    connectionInfo?: ConnectionInfo;
    isActive: boolean;
  } {
    const connectionInfo = this.connections.get(connectionId);

    return {
      connectionInfo,
      isActive: !!connectionInfo,
    };
  }

  public forceHealthCheck(): void {
    logger.info({ message: "forcing connection health check" });
    this.cleanup();
  }
}

// Export a default instance
export const defaultConnectionManager = new ConnectionManager();
