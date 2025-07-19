import { NextRequest, NextResponse } from "next/server";
import { ApiPath } from "@/app/constant";
import { handle as openaiHandler } from "../openai";
import { handle as azureHandler } from "../azure";
import { handle as googleHandler } from "../google";
import { handle as anthropicHandler } from "../anthropic";
import { handle as baiduHandler } from "../baidu";
import { handle as bytedanceHandler } from "../bytedance";
import { handle as alibabaHandler } from "../alibaba";
import { handle as moonshotHandler } from "../moonshot";
import { handle as stabilityHandler } from "../stability";
import { handle as iflytekHandler } from "../iflytek";
import { handle as xaiHandler } from "../xai";
import { handle as chatglmHandler } from "../glm";

async function handler(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");
  const apiPath = `/api/${provider}`;
  console.log(`[Proxy Route] provider: ${provider}`);

  // Create a dummy context object to satisfy the downstream handlers' signatures
  const context = { params: { provider: provider || "", path: [] } };

  switch (apiPath) {
    case ApiPath.Azure:
      return azureHandler(req, context);
    case ApiPath.Google:
      return googleHandler(req, context);
    case ApiPath.Anthropic:
      return anthropicHandler(req, context);
    case ApiPath.Baidu:
      return baiduHandler(req, context);
    case ApiPath.ByteDance:
      return bytedanceHandler(req, context);
    case ApiPath.Alibaba:
      return alibabaHandler(req, context);
    case ApiPath.Moonshot:
      return moonshotHandler(req, context);
    case ApiPath.Stability:
      return stabilityHandler(req, context);
    case ApiPath.Iflytek:
      return iflytekHandler(req, context);
    case ApiPath.XAI:
      return xaiHandler(req, context);
    case ApiPath.ChatGLM:
      return chatglmHandler(req, context);
    case ApiPath.OpenAI:
      return openaiHandler(req, context);
    default:
      // Fallback to a default handler if provider is not specified or unknown
      return NextResponse.json(
        { error: true, msg: `Unknown provider: ${provider}` },
        { status: 400 },
      );
  }
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

export const runtime = "edge";
