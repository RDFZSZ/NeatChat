import { ApiPath } from "@/app/constant";
import { NextRequest } from "next/server";
import { handle as openaiHandler } from "../../openai";
import { handle as azureHandler } from "../../azure";
import { handle as googleHandler } from "../../google";
import { handle as anthropicHandler } from "../../anthropic";
import { handle as baiduHandler } from "../../baidu";
import { handle as bytedanceHandler } from "../../bytedance";
import { handle as alibabaHandler } from "../../alibaba";
import { handle as moonshotHandler } from "../../moonshot";
import { handle as stabilityHandler } from "../../stability";
import { handle as iflytekHandler } from "../../iflytek";
import { handle as xaiHandler } from "../../xai";
import { handle as chatglmHandler } from "../../glm";
import { handle as proxyHandler } from "../../proxy";

export async function GET(
  req: NextRequest,
  context: { params: { provider: string; path: string[] } },
) {
  const { params } = context;
  const apiPath = `/api/${params.provider}`;
  console.log(`[${params.provider} Route] params `, params);
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
    // case ApiPath.Tencent: using "/api/tencent"
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
      return proxyHandler(req, context);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { provider: string; path: string[] } },
) {
  const { params } = context;
  const apiPath = `/api/${params.provider}`;
  console.log(`[${params.provider} Route] params `, params);
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
    // case ApiPath.Tencent: using "/api/tencent"
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
      return proxyHandler(req, context);
  }
}

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
