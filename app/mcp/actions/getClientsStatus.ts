import { ServerStatusResponse } from "../types";
import { getMcpConfig } from "./getMcpConfig";
import { clientsMap } from "./shared";

// 获取客户端状态
export async function getClientsStatus(): Promise<
  Record<string, ServerStatusResponse>
> {
  const config = await getMcpConfig();
  const result: Record<string, ServerStatusResponse> = {};

  for (const clientId of Object.keys(config.mcpServers)) {
    const status = clientsMap.get(clientId);
    const serverConfig = config.mcpServers[clientId];

    if (!serverConfig) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (serverConfig.status === "paused") {
      result[clientId] = { status: "paused", errorMsg: null };
      continue;
    }

    if (!status) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (
      status.client === null &&
      status.tools === null &&
      status.errorMsg === null
    ) {
      result[clientId] = { status: "initializing", errorMsg: null };
      continue;
    }

    if (status.errorMsg) {
      result[clientId] = { status: "error", errorMsg: status.errorMsg };
      continue;
    }

    if (status.client) {
      result[clientId] = { status: "active", errorMsg: null };
      continue;
    }

    result[clientId] = { status: "error", errorMsg: "Client not found" };
  }

  return result;
}
