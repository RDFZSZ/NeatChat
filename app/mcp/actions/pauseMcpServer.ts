import { removeClient } from "../client";
import { getMcpConfig } from "./getMcpConfig";
import { clientsMap, logger } from "./shared";

// 暂停服务器
export async function pauseMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfig();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 然后关闭客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return currentConfig;
  } catch (error) {
    logger.error(`Failed to pause server [${clientId}]: ${error}`);
    throw error;
  }
}
