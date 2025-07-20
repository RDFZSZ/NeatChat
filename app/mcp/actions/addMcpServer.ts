import { ServerConfig } from "../types";
import { getMcpConfig } from "./getMcpConfig";
import { initializeSingleClient } from "./initializeSingleClient";
import { logger } from "./shared";

// 添加服务器
export async function addMcpServer(clientId: string, config: ServerConfig) {
  try {
    const currentConfig = await getMcpConfig();
    const isNewServer = !(clientId in currentConfig.mcpServers);

    // 如果是新服务器，设置默认状态为 active
    if (isNewServer && !config.status) {
      config.status = "active";
    }

    // 只有新服务器或状态为 active 的服务器才初始化
    if (isNewServer || config.status === "active") {
      await initializeSingleClient(clientId, config);
    }

    return currentConfig;
  } catch (error) {
    logger.error(`Failed to add server [${clientId}]: ${error}`);
    throw error;
  }
}
