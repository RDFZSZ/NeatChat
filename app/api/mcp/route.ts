import { NextRequest, NextResponse } from "next/server";
import {
  addMcpServer,
  executeMcpAction,
  getAllTools,
  getAvailableClientsCount,
  getClientTools,
  getClientsStatus,
  getMcpConfig,
  initializeMcpSystem,
  isMcpEnabled,
  pauseMcpServer,
  removeMcpServer,
  restartAllClients,
  resumeMcpServer,
} from "@/app/mcp/backend-actions";

async function handlePostRequest(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case "isMcpEnabled":
        return NextResponse.json(await isMcpEnabled());
      case "initializeMcpSystem":
        return NextResponse.json(await initializeMcpSystem());
      case "getClientsStatus":
        return NextResponse.json(await getClientsStatus());
      case "getClientTools":
        return NextResponse.json(await getClientTools(payload.clientId));
      case "getAvailableClientsCount":
        return NextResponse.json(await getAvailableClientsCount());
      case "getAllTools":
        return NextResponse.json(await getAllTools());
      case "addMcpServer":
        return NextResponse.json(
          await addMcpServer(payload.clientId, payload.config),
        );
      case "pauseMcpServer":
        return NextResponse.json(await pauseMcpServer(payload.clientId));
      case "resumeMcpServer":
        return NextResponse.json(await resumeMcpServer(payload.clientId));
      case "removeMcpServer":
        return NextResponse.json(await removeMcpServer(payload.clientId));
      case "restartAllClients":
        return NextResponse.json(await restartAllClients());
      case "executeMcpAction":
        return NextResponse.json(
          await executeMcpAction(payload.clientId, payload.request),
        );
      case "getMcpConfig":
        return NextResponse.json(await getMcpConfig());
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
