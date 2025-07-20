import { removeClient } from "../client";
import { getMcpConfig } from "./getMcpConfig";
import { clientsMap, logger } from "./shared";

// 移除服务器
export async function removeMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfig();
    const { [clientId]: _, ...rest } = currentConfig.mcpServers;
    const newConfig = {
      ...currentConfig,
      mcpServers: rest,
    };

    // 关闭并移除客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to remove server [${clientId}]: ${error}`);
    throw error;
  }
}
