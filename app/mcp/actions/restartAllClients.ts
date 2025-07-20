import { removeClient } from "../client";
import { getMcpConfig } from "./getMcpConfig";
import { initializeSingleClient } from "./initializeSingleClient";
import { clientsMap, logger } from "./shared";

// 重启所有客户端
export async function restartAllClients() {
  logger.info("Restarting all clients...");
  try {
    // 关闭所有客户端
    for (const client of clientsMap.values()) {
      if (client.client) {
        await removeClient(client.client);
      }
    }

    // 清空状态
    clientsMap.clear();

    // 重新初始化
    const config = await getMcpConfig();
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to restart clients: ${error}`);
    throw error;
  }
}
