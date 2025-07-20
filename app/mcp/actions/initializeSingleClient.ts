import { createClient, listTools } from "../client";
import { ServerConfig } from "../types";
import { clientsMap, logger } from "./shared";

// 初始化单个客户端
export async function initializeSingleClient(
  clientId: string,
  serverConfig: ServerConfig,
) {
  // 如果服务器状态是暂停，则不初始化
  if (serverConfig.status === "paused") {
    logger.info(`Skipping initialization for paused client [${clientId}]`);
    return;
  }

  logger.info(`Initializing client [${clientId}]...`);

  // 先设置初始化状态
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: null, // null 表示正在初始化
  });

  // 异步初始化
  createClient(clientId, serverConfig)
    .then(async (client) => {
      const tools = await listTools(client);
      logger.info(
        `Supported tools for [${clientId}]: ${JSON.stringify(tools, null, 2)}`,
      );
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);
    })
    .catch((error) => {
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
    });
}
