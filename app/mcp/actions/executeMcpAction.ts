import { executeRequest } from "../client";
import { McpRequestMessage } from "../types";
import { clientsMap, logger } from "./shared";

// 执行 MCP 请求
export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
  try {
    const client = clientsMap.get(clientId);
    if (!client?.client) {
      throw new Error(`Client ${clientId} not found`);
    }
    logger.info(`Executing request for [${clientId}]`);
    return await executeRequest(client.client, request);
  } catch (error) {
    logger.error(`Failed to execute request for [${clientId}]: ${error}`);
    throw error;
  }
}
