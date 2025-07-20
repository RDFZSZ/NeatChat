import { clientsMap } from "./shared";

// 获取客户端工具
export async function getClientTools(clientId: string) {
  return clientsMap.get(clientId)?.tools ?? null;
}
