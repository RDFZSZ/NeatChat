/**
 * 文件上传和处理工具
 */

import React from "react";
import { showToast, showModal } from "../components/ui-lib";

/**
 * 读取文件为文本
 * @param file 要读取的文件
 * @returns 文件内容的Promise
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  name: string;
  type: string;
  size: number;
  content: string;
  originalFile: File;
}

// 移除了 mammoth, jszip, pdfjs-dist, xlsx 等重型库的直接导入

/**
 * 远程处理文件
 * @param file 要处理的文件
 * @param action 要执行的操作
 * @returns 文件内容的Promise
 */
async function processFileRemotely(
  file: File,
  action: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );

        const response = await fetch("/api/file-process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            fileContent: base64String,
            fileType: file.type,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `服务器错误: ${response.statusText}`,
          );
        }

        const result = await response.json();
        resolve(result.content);
      } catch (error) {
        console.error(`远程处理文件 ${file.name} 失败:`, error);
        reject(error);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 读取 Word 文件 (.docx)
 * @param file 要读取的文件
 * @returns 文件内容的Promise
 */
export function readWordFile(file: File): Promise<string> {
  if (file.name.endsWith(".doc")) {
    showModal({
      title: "检测到旧版 Word 文档",
      children: React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          null,
          "您上传的是旧版 .doc 格式文件，无法完全解析其内容。",
        ),
        React.createElement(
          "p",
          null,
          "为获得最佳效果，请将文件转换为 .docx 格式后再上传。",
        ),
      ),
    });
    return Promise.resolve(
      "【无法读取】此文件为旧版 .doc 格式。请转换为 .docx 格式。",
    );
  }
  return processFileRemotely(file, "readWord");
}

/**
 * 读取 PowerPoint 文件 (.pptx)
 * @param file 要读取的文件
 * @returns 文件内容的Promise
 */
export function readPowerPointFile(file: File): Promise<string> {
  if (file.name.endsWith(".ppt")) {
    showModal({
      title: "检测到旧版 PowerPoint 文档",
      children: React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          null,
          "您上传的是旧版 .ppt 格式文件，无法完全解析其内容。",
        ),
        React.createElement(
          "p",
          null,
          "为获得最佳效果，请将文件转换为 .pptx 格式后再上传。",
        ),
      ),
    });
    return Promise.resolve(
      "【无法读取】此文件为旧版 .ppt 格式。请转换为 .pptx 格式。",
    );
  }
  return processFileRemotely(file, "readPowerPoint");
}

/**
 * 读取 PDF 文件
 * @param file 要读取的文件
 * @returns 文件内容的Promise
 */
export function readPdfFile(file: File): Promise<string> {
  return processFileRemotely(file, "readPdf");
}

/**
 * 读取 ZIP 文件
 * @param file 要读取的 ZIP 文件
 * @returns 文件内容的 Promise
 */
export function readZipFile(file: File): Promise<string> {
  return processFileRemotely(file, "readZip");
}

/**
 * 读取 Excel 文件
 * @param file 要读取的文件
 * @returns 文件内容的Promise
 */
export function readExcelFile(file: File): Promise<string> {
  if (file.name.endsWith(".xls")) {
    showModal({
      title: "检测到旧版 Excel 文档",
      children: React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          null,
          "您上传的是旧版 .xls 格式文件，可能无法完全解析其内容。",
        ),
        React.createElement(
          "p",
          null,
          "为获得最佳效果，请将文件转换为 .xlsx 格式后再上传。",
        ),
      ),
    });
    return Promise.resolve(
      "【无法读取】此文件为旧版 .xls 格式。请转换为 .xlsx 格式。",
    );
  }
  return processFileRemotely(file, "readExcel");
}

/**
 * 图片文件处理相关函数
 */

// 从chat.tsx移动过来的上传图片函数
export async function uploadImage(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type));
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// 从chat.tsx移动过来的远程上传图片函数
export async function uploadImageRemote(file: File): Promise<string> {
  try {
    return await uploadImage(file);
  } catch (error) {
    console.error("上传图片失败:", error);
    throw error;
  }
}

/**
 * 上传附件（包括图片和文件）
 */
export function uploadAttachments(
  onStart: () => void,
  onSuccess: (fileInfos: FileInfo[], imageUrls: string[]) => void,
  onError: (error: any) => void,
  onFinish: () => void,
): void {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept =
    "image/png, image/jpeg, image/webp, image/heic, image/heif, .txt,.md,.js,.py,.html,.css,.json,.csv,.xml,.log,.docx,.doc,.pptx,.ppt,.pdf,.sh,.bash,.zsh,.sql,.ini,.conf,.yaml,.yml,.toml,.tex,.c,.cpp,.h,.hpp,.java,.cs,.go,.rs,.php,.rb,.pl,.swift,.kt,.ts,.jsx,.tsx,.vue,.scss,.less,.bat,.ps1,.r,.m,.ipynb,.zip,.csr,.key,.pem,.crt,.cer,.xlsx,.xls,.rdp,.svg,Dockerfile";
  fileInput.multiple = true;

  fileInput.onchange = async (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      onFinish();
      return;
    }

    onStart();
    try {
      const fileInfos: FileInfo[] = [];
      const imageUrls: string[] = [];

      for (const file of files) {
        try {
          if (file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
            const imageUrl = await uploadImageRemote(file);
            imageUrls.push(imageUrl);
          } else {
            let text = "";
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
              text = await readWordFile(file);
            } else if (
              fileName.endsWith(".pptx") ||
              fileName.endsWith(".ppt")
            ) {
              text = await readPowerPointFile(file);
            } else if (fileName.endsWith(".pdf")) {
              text = await readPdfFile(file);
            } else if (fileName.endsWith(".zip")) {
              text = await readZipFile(file);
            } else if (
              fileName.endsWith(".xlsx") ||
              fileName.endsWith(".xls")
            ) {
              text = await readExcelFile(file);
            } else {
              text = await readFileAsText(file);
            }

            const maxLength = 100000;
            const truncatedText =
              text.length > maxLength
                ? text.substring(0, maxLength) +
                  `\n\n[文件过大，已截断。原文件大小: ${text.length} 字符]`
                : text;

            fileInfos.push({
              name: file.name,
              type: file.type || getFileTypeByExtension(file.name),
              size: file.size,
              content: truncatedText,
              originalFile: file,
            });
          }
        } catch (error: any) {
          console.error(`读取文件 ${file.name} 失败:`, error);
          showToast(
            `读取文件 ${file.name} 失败: ${error.message || "未知错误"}`,
          );
        }
      }

      if (fileInfos.length > 0 || imageUrls.length > 0) {
        onSuccess(fileInfos, imageUrls);
      } else {
        onError(new Error("没有成功读取任何文件"));
      }
    } catch (error) {
      console.error("处理文件失败:", error);
      onError(error);
    } finally {
      onFinish();
    }
  };

  fileInput.click();
}

/**
 * 根据文件扩展名获取文件类型
 */
function getFileTypeByExtension(filename: string): string {
  if (filename.toLowerCase() === "dockerfile") {
    return "text/x-dockerfile";
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  // ... (保持原有的 switch case)
  switch (ext) {
    case "docx":
    case "doc":
      return "application/msword";
    case "pptx":
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "txt":
      return "text/plain";
    case "html":
      return "text/html";
    case "js":
      return "application/javascript";
    case "css":
      return "text/css";
    case "json":
      return "application/json";
    case "md":
      return "text/markdown";
    case "py":
      return "text/x-python";
    case "csv":
      return "text/csv";
    case "xml":
      return "application/xml";
    case "pdf":
      return "application/pdf";
    case "sh":
    case "bash":
    case "zsh":
      return "text/x-sh";
    case "bat":
    case "ps1":
      return "text/x-script";
    case "ini":
    case "conf":
      return "text/x-ini";
    case "yaml":
    case "yml":
      return "text/x-yaml";
    case "toml":
      return "text/x-toml";
    case "sql":
      return "text/x-sql";
    case "c":
    case "cpp":
    case "h":
    case "hpp":
      return "text/x-c";
    case "java":
      return "text/x-java";
    case "cs":
      return "text/x-csharp";
    case "go":
      return "text/x-go";
    case "rs":
      return "text/x-rust";
    case "php":
      return "text/x-php";
    case "rb":
      return "text/x-ruby";
    case "pl":
      return "text/x-perl";
    case "swift":
      return "text/x-swift";
    case "kt":
      return "text/x-kotlin";
    case "ts":
    case "tsx":
      return "text/x-typescript";
    case "jsx":
      return "text/x-jsx";
    case "vue":
      return "text/x-vue";
    case "scss":
    case "less":
      return "text/x-scss";
    case "r":
      return "text/x-r";
    case "m":
      return "text/x-matlab";
    case "tex":
      return "text/x-tex";
    case "ipynb":
      return "application/x-ipynb+json";
    case "zip":
      return "application/zip";
    case "csr":
      return "application/pkcs10";
    case "key":
      return "application/pkcs8";
    case "pem":
    case "crt":
    case "cer":
      return "application/x-x509-ca-cert";
    case "xlsx":
    case "xls":
      return "application/vnd.ms-excel";
    case "rdp":
      return "application/x-rdp";
    case "svg":
      return "image/svg+xml";
    default:
      return "文本文件";
  }
}

/**
 * 上传并处理单个文本文件
 */
export function uploadTextFile(
  onStart: () => void,
  onSuccess: (fileInfo: FileInfo) => void,
  onError: (error: any) => void,
  onFinish: () => void,
): void {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept =
    ".txt,.md,.js,.py,.html,.css,.json,.csv,.xml,.log,.sh,.bash,.zsh,.sql,.ini,.conf,.yaml,.yml,.toml,.tex,.c,.cpp,.h,.hpp,.java,.cs,.go,.rs,.php,.rb,.pl,.swift,.kt,.ts,.jsx,.tsx,.vue,.scss,.less,.bat,.ps1,.r,.m,.ipynb,.csr,.key,.pem,.crt,.cer,.rdp,.svg,Dockerfile";

  fileInput.onchange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      onFinish();
      return;
    }

    onStart();
    try {
      const text = await readFileAsText(file);
      const maxLength = 5000;
      const truncatedText =
        text.length > maxLength
          ? text.substring(0, maxLength) +
            `\n\n[文件过大，已截断。原文件大小: ${text.length} 字符]`
          : text;

      onSuccess({
        name: file.name,
        type: file.type || "文本文件",
        size: file.size,
        content: truncatedText,
        originalFile: file,
      });
    } catch (error: any) {
      console.error("读取文件失败:", error);
      onError(error);
    } finally {
      onFinish();
    }
  };

  fileInput.click();
}

/**
 * 获取文件图标
 */
export function getFileIconClass(fileType: string): string {
  const type = fileType.toLowerCase();

  if (type.includes("application/msword") || type.includes("word"))
    return "file-word";
  if (type.includes("powerpoint") || type.includes("presentation"))
    return "file-powerpoint";
  if (type.includes("text/plain")) return "file-text";
  if (type.includes("html")) return "file-html";
  if (type.includes("javascript")) return "file-js";
  if (type.includes("css")) return "file-css";
  if (type.includes("json")) return "file-json";
  if (type.includes("markdown")) return "file-md";
  if (type.includes("python")) return "file-py";
  if (type.includes("csv")) return "file-csv";
  if (type.includes("xml")) return "file-xml";
  if (type.includes("pdf")) return "file-pdf";
  if (type.includes("zip")) return "file-zip";
  if (type.includes("excel")) return "file-excel";
  if (type.includes("svg")) return "file-svg";
  // ... (保持其他图标逻辑)
  return "file-document";
}

/**
 * 上传并处理多个文本文件
 */
export function uploadMultipleTextFiles(
  onStart: () => void,
  onSuccess: (fileInfos: FileInfo[]) => void,
  onError: (error: any) => void,
  onFinish: () => void,
): void {
  uploadAttachments(
    onStart,
    (fileInfos, _) => onSuccess(fileInfos),
    onError,
    onFinish,
  );
}
