import { McpClientData } from "../types";
import { MCPClientLogger } from "../logger";

export const logger = new MCPClientLogger("MCP Actions");
export const clientsMap = new Map<string, McpClientData>();
