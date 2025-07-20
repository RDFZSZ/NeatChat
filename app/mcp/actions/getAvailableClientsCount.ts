import { clientsMap } from "./shared";

// 获取可用客户端数量
export async function getAvailableClientsCount() {
  let count = 0;
  clientsMap.forEach((map) => !map.errorMsg && count++);
  return count;
}
