import { McpConfigData } from "../types";
import mcpConfig from "../mcp_config.default.json";

// 获取 MCP 配置文件
export async function getMcpConfig(): Promise<McpConfigData> {
  // The config is now imported directly, but we keep this function async
  // to maintain compatibility with the existing code.
  return Promise.resolve(mcpConfig as McpConfigData);
}
