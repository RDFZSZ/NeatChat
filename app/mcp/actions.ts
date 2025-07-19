import { McpRequestMessage, ServerConfig } from "./types";

async function mcpApiRequest(action: string, payload?: any) {
  const response = await fetch("/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "An unknown error occurred",
    }));
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
}

export async function getClientsStatus() {
  return mcpApiRequest("getClientsStatus");
}

export async function getClientTools(clientId: string) {
  return mcpApiRequest("getClientTools", { clientId });
}

export async function getAvailableClientsCount() {
  return mcpApiRequest("getAvailableClientsCount");
}

export async function getAllTools() {
  return mcpApiRequest("getAllTools");
}

export async function initializeMcpSystem() {
  return mcpApiRequest("initializeMcpSystem");
}

export async function addMcpServer(clientId: string, config: ServerConfig) {
  return mcpApiRequest("addMcpServer", { clientId, config });
}

export async function pauseMcpServer(clientId: string) {
  return mcpApiRequest("pauseMcpServer", { clientId });
}

export async function resumeMcpServer(clientId: string) {
  return mcpApiRequest("resumeMcpServer", { clientId });
}

export async function removeMcpServer(clientId: string) {
  return mcpApiRequest("removeMcpServer", { clientId });
}

export async function restartAllClients() {
  return mcpApiRequest("restartAllClients");
}

export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
  return mcpApiRequest("executeMcpAction", { clientId, request });
}

export async function getMcpConfigFromFile() {
  return mcpApiRequest("getMcpConfigFromFile");
}

export async function isMcpEnabled() {
  return mcpApiRequest("isMcpEnabled");
}
