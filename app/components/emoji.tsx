import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import { ModelType } from "../store";

import ClaudeIcon from "../icons/claude-color.svg?react";
import DallEIcon from "../icons/dalle-color.svg?react";
import GeminiIcon from "../icons/gemini-color.svg?react";
import DouBaoIcon from "../icons/doubao-color.svg?react";
import HunYuanIcon from "../icons/hunyuan-color.svg?react";
import MetaIcon from "../icons/meta-color.svg?react";
import CohereIcon from "../icons/cohere-color.svg?react";
import DeepseekIcon from "../icons/deepseek-color.svg?react";
import MoonShotIcon from "../icons/moonshot.svg?react";
import GlmIcon from "../icons/qingyan-color.svg?react";
import GrokIcon from "../icons/grok.svg?react";
import Gpt35Icon from "../icons/openai-3.5.svg?react";
import QwenIcon from "../icons/qwen-color.svg?react";
import OpenAIIcon from "../icons/openai.svg?react";
import WenXinIcon from "../icons/wenxin-color.svg?react";
import NeatIcon from "../icons/neat.svg?react";
import MistralIcon from "../icons/mistral-color.svg?react";
import YiIcon from "../icons/yi-color.svg?react";
import SenseNovaIcon from "../icons/sensenova-color.svg?react";
import SparkIcon from "../icons/spark-color.svg?react";
import MiniMaxIcon from "../icons/minimax-color.svg?react";
import HaiLuoIcon from "../icons/hailuo-color.svg?react";
import GemmaIcon from "../icons/gemma-color.svg?react";
import StepFunIcon from "../icons/stepfun-color.svg?react";
import OllamaIcon from "../icons/ollama.svg?react";
import ComfyUIIcon from "../icons/comfyui-color.svg?react";
import VolcEngineIcon from "../icons/volcengine-color.svg?react";
import VertexAIIcon from "../icons/vertexai-color.svg?react";
import SiliconCloudIcon from "../icons/siliconcloud-color.svg?react";
import PerplexityIcon from "../icons/perplexity-color.svg?react";
import StabilityIcon from "../icons/stability-color.svg?react";
import FluxIcon from "../icons/flux.svg?react";

import "../styles/model-avatar.scss";

// 导出图标，让其他组件可以使用
export {
  ClaudeIcon,
  DallEIcon,
  GeminiIcon,
  DouBaoIcon,
  HunYuanIcon,
  MetaIcon,
  CohereIcon,
  DeepseekIcon,
  MoonShotIcon,
  GlmIcon,
  GrokIcon,
  Gpt35Icon,
  QwenIcon,
  OpenAIIcon,
  WenXinIcon,
  NeatIcon,
  MistralIcon,
  YiIcon,
  SenseNovaIcon,
  SparkIcon,
  MiniMaxIcon,
  HaiLuoIcon,
  GemmaIcon,
  StepFunIcon,
  OllamaIcon,
  ComfyUIIcon,
  VolcEngineIcon,
  VertexAIIcon,
  SiliconCloudIcon,
  PerplexityIcon,
  StabilityIcon,
  FluxIcon,
};

// 添加默认系统类别匹配规则常量
export const DEFAULT_SYSTEM_CATEGORY_PATTERNS: Record<string, string> = {
  Claude: "claude",
  "DALL-E": "dall",
  DeepSeek: "deepseek",
  Grok: "grok",
  Gemini: "gemini",
  MoonShot: "moonshot|kimi",
  WenXin: "wenxin|ernie",
  DouBao: "doubao",
  HunYuan: "hunyuan",
  Cohere: "command",
  GLM: "glm",
  Llama: "llama",
  Qwen: "qwen|qwq|qvq",
  ChatGPT: "gpt|o1|o3",
  Mistral: "mistral",
  Yi: "yi",
  SenseNova: "sensenova|sense",
  Spark: "spark",
  MiniMax: "minimax|abab",
  HaiLuo: "hailuo",
  Gemma: "gemma",
  StepFun: "stepfun",
  Ollama: "ollama",
  ComfyUI: "comfyui",
  VolcEngine: "volcengine",
  VertexAI: "vertexai",
  SiliconCloud: "siliconcloud",
  Perplexity: "perplexity",
  Stability: "stability",
  Flux: "flux",
};

// 共享本地存储键
export const SYSTEM_CATEGORIES_STORAGE_KEY = "chat-next-web-system-categories";

// 获取模型类别的函数
export function getModelCategory(modelId: string): string {
  const lowerModelId = modelId.toLowerCase();

  try {
    // 尝试从本地存储获取自定义规则
    const storedPatterns = localStorage.getItem(SYSTEM_CATEGORIES_STORAGE_KEY);
    const categoryPatterns = storedPatterns
      ? JSON.parse(storedPatterns)
      : DEFAULT_SYSTEM_CATEGORY_PATTERNS;

    // 检查系统类别
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      const patterns = (pattern as string).split("|");
      for (const p of patterns) {
        if (lowerModelId.includes(p.toLowerCase())) {
          return category;
        }
      }
    }
  } catch (error) {
    console.error("从本地存储加载系统类别匹配规则失败:", error);

    // 如果出错，使用默认规则
    for (const [category, pattern] of Object.entries(
      DEFAULT_SYSTEM_CATEGORY_PATTERNS,
    )) {
      const patterns = (pattern as string).split("|");
      for (const p of patterns) {
        if (lowerModelId.includes(p.toLowerCase())) {
          return category;
        }
      }
    }
  }

  return "Other";
}

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  // Whoever owns this Content Delivery Network (CDN), I am using your CDN to serve emojis
  // Old CDN broken, so I had to switch to this one
  // Author: https://github.com/H0llyW00dzZ
  return `https://fastly.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      width={"100%"}
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: {
  model?: ModelType;
  avatar?: string;
  provider?: string;
}) {
  if (props.model) {
    return (
      <div className="no-dark">
        {(() => {
          const model = props.model?.toLowerCase() || "";
          const provider = props.provider?.toLowerCase() || "";

          // 如果提供了 provider，优先根据 provider 显示头像
          if (provider) {
            if (provider.includes("anthropic")) {
              return (
                <ClaudeIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("openai")) {
              // 对于 OpenAI 的模型，区分 GPT-3.5 和其他模型
              if (model.includes("gpt-3.5") || model.includes("gpt3")) {
                return (
                  <Gpt35Icon
                    className="user-avatar model-avatar"
                    
                  />
                );
              }
              return (
                <OpenAIIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("google")) {
              return (
                <GeminiIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("bytedance")) {
              return (
                <DouBaoIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("baidu")) {
              return (
                <WenXinIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("tencent")) {
              return (
                <HunYuanIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            }

            if (provider.includes("meta")) {
              return (
                <MetaIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("cohere")) {
              return (
                <CohereIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("deepseek")) {
              return <DeepseekIcon className="user-avatar model-avatar" />;
            }

            if (provider.includes("moonshot")) {
              return (
                <MoonShotIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            }

            if (provider.includes("zhipu")) {
              return <GlmIcon className="user-avatar model-avatar"  />;
            }

            if (provider.includes("xai")) {
              return (
                <GrokIcon className="user-avatar model-avatar"  />
              );
            }

            if (provider.includes("aliyun")) {
              return (
                <QwenIcon className="user-avatar model-avatar"  />
              );
            }
          }

          // 使用统一的模型类别匹配逻辑
          const category = getModelCategory(model);

          // 根据类别返回对应的图标
          switch (category) {
            case "Claude":
              return (
                <ClaudeIcon className="user-avatar model-avatar"  />
              );
            case "DALL-E":
              return (
                <DallEIcon className="user-avatar model-avatar"  />
              );
            case "WenXin":
              return (
                <WenXinIcon className="user-avatar model-avatar"  />
              );
            case "DouBao":
              return (
                <DouBaoIcon className="user-avatar model-avatar"  />
              );
            case "HunYuan":
              return (
                <HunYuanIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Gemini":
              return (
                <GeminiIcon className="user-avatar model-avatar"  />
              );
            case "Llama":
              return (
                <MetaIcon className="user-avatar model-avatar"  />
              );
            case "ChatGPT":
              // 特殊处理GPT-3.5
              if (model.includes("gpt-3.5") || model.includes("gpt3")) {
                return (
                  <Gpt35Icon
                    className="user-avatar model-avatar"
                    
                  />
                );
              }
              return (
                <OpenAIIcon className="user-avatar model-avatar"  />
              );
            case "Cohere":
              return (
                <CohereIcon className="user-avatar model-avatar"  />
              );
            case "DeepSeek":
              return <DeepseekIcon className="user-avatar model-avatar" />;
            case "MoonShot":
              return (
                <MoonShotIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "GLM":
              return <GlmIcon className="user-avatar model-avatar"  />;
            case "Grok":
              return (
                <GrokIcon className="user-avatar model-avatar"  />
              );
            case "Qwen":
              return (
                <QwenIcon className="user-avatar model-avatar"  />
              );
            case "Mistral":
              return (
                <MistralIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Yi":
              return <YiIcon className="user-avatar model-avatar"  />;
            case "SenseNova":
              return (
                <SenseNovaIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Spark":
              return (
                <SparkIcon className="user-avatar model-avatar"  />
              );
            case "MiniMax":
              return (
                <MiniMaxIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "HaiLuo":
              return (
                <HaiLuoIcon className="user-avatar model-avatar"  />
              );
            case "Gemma":
              return (
                <GemmaIcon className="user-avatar model-avatar"  />
              );
            case "StepFun":
              return (
                <StepFunIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Ollama":
              return (
                <OllamaIcon className="user-avatar model-avatar"  />
              );
            case "ComfyUI":
              return (
                <ComfyUIIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "VolcEngine":
              return (
                <VolcEngineIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "VertexAI":
              return (
                <VertexAIIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "SiliconCloud":
              return (
                <SiliconCloudIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Perplexity":
              return (
                <PerplexityIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Stability":
              return (
                <StabilityIcon
                  className="user-avatar model-avatar"
                  
                />
              );
            case "Flux":
              return (
                <FluxIcon className="user-avatar model-avatar"  />
              );
            default:
              return (
                <NeatIcon className="user-avatar model-avatar"  />
              );
          }
        })()}
      </div>
    );
  }

  return (
    <div className="user-avatar">
      {props.avatar && <EmojiAvatar avatar={props.avatar} />}
    </div>
  );
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}

// 添加并导出获取固定类别头像的函数
export function getFixedCategoryAvatar(category: string) {
  // 添加一个 div 容器并应用 no-dark 类
  return (
    <div className="no-dark">
      {(() => {
        switch (category) {
          case "Claude":
            return (
              <ClaudeIcon className="user-avatar model-avatar"  />
            );
          case "DALL-E":
            return (
              <DallEIcon className="user-avatar model-avatar"  />
            );
          case "WenXin":
            return (
              <WenXinIcon className="user-avatar model-avatar"  />
            );
          case "DouBao":
            return (
              <DouBaoIcon className="user-avatar model-avatar"  />
            );
          case "HunYuan":
            return (
              <HunYuanIcon className="user-avatar model-avatar"  />
            );
          case "Gemini":
            return (
              <GeminiIcon className="user-avatar model-avatar"  />
            );
          case "Llama":
            return <MetaIcon className="user-avatar model-avatar"  />;
          case "ChatGPT":
            return (
              <OpenAIIcon className="user-avatar model-avatar"  />
            );
          case "Cohere":
            return (
              <CohereIcon className="user-avatar model-avatar"  />
            );
          case "DeepSeek":
            return <DeepseekIcon className="user-avatar model-avatar" />;
          case "MoonShot":
            return (
              <MoonShotIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "GLM":
            return <GlmIcon className="user-avatar model-avatar"  />;
          case "Grok":
            return <GrokIcon className="user-avatar model-avatar"  />;
          case "Qwen":
            return <QwenIcon className="user-avatar model-avatar"  />;
          case "Mistral":
            return (
              <MistralIcon className="user-avatar model-avatar"  />
            );
          case "Yi":
            return <YiIcon className="user-avatar model-avatar"  />;
          case "SenseNova":
            return (
              <SenseNovaIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "Spark":
            return (
              <SparkIcon className="user-avatar model-avatar"  />
            );
          case "MiniMax":
            return (
              <MiniMaxIcon className="user-avatar model-avatar"  />
            );
          case "HaiLuo":
            return (
              <HaiLuoIcon className="user-avatar model-avatar"  />
            );
          case "Gemma":
            return (
              <GemmaIcon className="user-avatar model-avatar"  />
            );
          case "StepFun":
            return (
              <StepFunIcon className="user-avatar model-avatar"  />
            );
          case "Ollama":
            return (
              <OllamaIcon className="user-avatar model-avatar"  />
            );
          case "ComfyUI":
            return (
              <ComfyUIIcon className="user-avatar model-avatar"  />
            );
          case "VolcEngine":
            return (
              <VolcEngineIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "VertexAI":
            return (
              <VertexAIIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "SiliconCloud":
            return (
              <SiliconCloudIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "Perplexity":
            return (
              <PerplexityIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "Stability":
            return (
              <StabilityIcon
                className="user-avatar model-avatar"
                
              />
            );
          case "Flux":
            return <FluxIcon className="user-avatar model-avatar"  />;
          default:
            return <NeatIcon className="user-avatar model-avatar"  />;
        }
      })()}
    </div>
  );
}
