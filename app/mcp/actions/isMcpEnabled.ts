import { getServerSideConfig } from "../../config/server";
import { logger } from "./shared";

// 检查 MCP 是否启用
export async function isMcpEnabled() {
  try {
    const serverConfig = getServerSideConfig();
    return serverConfig.enableMcp;
  } catch (error) {
    logger.error(`Failed to check MCP status: ${error}`);
    return false;
  }
}
