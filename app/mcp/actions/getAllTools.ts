import { clientsMap } from "./shared";

// 获取所有客户端工具
export async function getAllTools() {
  const result = [];
  for (const [clientId, status] of clientsMap.entries()) {
    result.push({
      clientId,
      tools: status.tools,
    });
  }
  return result;
}
