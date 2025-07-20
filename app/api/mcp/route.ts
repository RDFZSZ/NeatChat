export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
async function handlePostRequest(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case "isMcpEnabled": {
        const { isMcpEnabled } = await import("@/app/mcp/actions/isMcpEnabled");
        return NextResponse.json(await isMcpEnabled());
      }
      case "initializeMcpSystem": {
        const { initializeMcpSystem } = await import(
          "@/app/mcp/actions/initializeMcpSystem"
        );
        return NextResponse.json(await initializeMcpSystem());
      }
      case "getClientsStatus": {
        const { getClientsStatus } = await import(
          "@/app/mcp/actions/getClientsStatus"
        );
        return NextResponse.json(await getClientsStatus());
      }
      case "getClientTools": {
        const { getClientTools } = await import(
          "@/app/mcp/actions/getClientTools"
        );
        return NextResponse.json(await getClientTools(payload.clientId));
      }
      case "getAvailableClientsCount": {
        const { getAvailableClientsCount } = await import(
          "@/app/mcp/actions/getAvailableClientsCount"
        );
        return NextResponse.json(await getAvailableClientsCount());
      }
      case "getAllTools": {
        const { getAllTools } = await import("@/app/mcp/actions/getAllTools");
        return NextResponse.json(await getAllTools());
      }
      case "addMcpServer": {
        const { addMcpServer } = await import("@/app/mcp/actions/addMcpServer");
        return NextResponse.json(
          await addMcpServer(payload.clientId, payload.config),
        );
      }
      case "pauseMcpServer": {
        const { pauseMcpServer } = await import(
          "@/app/mcp/actions/pauseMcpServer"
        );
        return NextResponse.json(await pauseMcpServer(payload.clientId));
      }
      case "resumeMcpServer": {
        const { resumeMcpServer } = await import(
          "@/app/mcp/actions/resumeMcpServer"
        );
        return NextResponse.json(await resumeMcpServer(payload.clientId));
      }
      case "removeMcpServer": {
        const { removeMcpServer } = await import(
          "@/app/mcp/actions/removeMcpServer"
        );
        return NextResponse.json(await removeMcpServer(payload.clientId));
      }
      case "restartAllClients": {
        const { restartAllClients } = await import(
          "@/app/mcp/actions/restartAllClients"
        );
        return NextResponse.json(await restartAllClients());
      }
      case "executeMcpAction": {
        const { executeMcpAction } = await import(
          "@/app/mcp/actions/executeMcpAction"
        );
        return NextResponse.json(
          await executeMcpAction(payload.clientId, payload.request),
        );
      }
      case "getMcpConfig": {
        const { getMcpConfig } = await import("@/app/mcp/actions/getMcpConfig");
        return NextResponse.json(await getMcpConfig());
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return await handlePostRequest(req);
}
