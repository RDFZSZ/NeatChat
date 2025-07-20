import { createClient, listTools } from "../client";
import { getMcpConfig } from "./getMcpConfig";
import { clientsMap, logger } from "./shared";

// 恢复服务器
export async function resumeMcpServer(clientId: string): Promise<void> {
  try {
    const currentConfig = await getMcpConfig();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 先尝试初始化客户端
    logger.info(`Trying to initialize client [${clientId}]...`);
    try {
      const client = await createClient(clientId, serverConfig);
      const tools = await listTools(client);
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);

      // 初始化成功后更新配置
    } catch (error) {
      const currentConfig = await getMcpConfig();
      const serverConfig = currentConfig.mcpServers[clientId];

      // 如果配置中存在该服务器，则更新其状态为 error
      if (serverConfig) {
        serverConfig.status = "error";
      }

      // 初始化失败
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Failed to resume server [${clientId}]: ${error}`);
    throw error;
  }
}
