export const runtime = "edge";
import { type NextRequest, NextResponse } from "next/server";

// 辅助函数：将 Base64 字符串转换为 ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 读取 Word 文件 (.docx)
 * @param arrayBuffer 文件内容的 ArrayBuffer
 * @returns 文件内容的Promise
 */
async function readWordFile(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // 使用 JSZip 解压 .docx 文件
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    const docXml = zipContent.file("word/document.xml");

    if (!docXml) {
      throw new Error("在 .docx 文件中未找到 document.xml。");
    }

    const content = await docXml.async("string");

    // 从 XML 中提取文本
    const textMatches = content.match(/<w:t>([^<]*)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map((match) => match.replace(/<w:t>|<\/w:t>/g, ""))
        .join("");
    }

    return "无法从 Word 文件中提取文本内容。";
  } catch (error: any) {
    // 如果是 ZIP 相关错误，提供更友好的错误消息
    if (error.message && error.message.includes("zip file")) {
      throw new Error(
        "文件格式不正确或已损坏。如果是 .doc 格式，请转换为 .docx 格式后再上传。",
      );
    }
    throw error;
  }
}

/**
 * 读取 PowerPoint 文件 (.pptx)
 * @param arrayBuffer 文件内容的 ArrayBuffer
 * @returns 文件内容的Promise
 */
async function readPowerPointFile(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // 使用 JSZip 解压 .pptx 文件
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);

    // 提取幻灯片内容
    let slideTexts: string[] = [];
    const slideRegex = /ppt\/slides\/slide(\d+)\.xml/;
    const slidePromises: Promise<void>[] = [];

    zipContent.forEach((path, file) => {
      if (slideRegex.test(path)) {
        const slidePromise = file.async("string").then((content) => {
          // 从 XML 中提取文本
          const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
          if (textMatches) {
            const slideNumber = parseInt(path.match(slideRegex)![1]);
            const slideText = textMatches
              .map((match) => match.replace(/<a:t>|<\/a:t>/g, ""))
              .filter((text) => text.trim().length > 0)
              .join("\n");

            if (slideText.trim()) {
              slideTexts.push(`--- 幻灯片 ${slideNumber} ---\n${slideText}`);
            }
          }
        });
        slidePromises.push(slidePromise);
      }
    });

    await Promise.all(slidePromises);

    // 按幻灯片编号排序
    slideTexts.sort((a, b) => {
      const numA = parseInt(a.match(/幻灯片 (\d+)/)![1]);
      const numB = parseInt(b.match(/幻灯片 (\d+)/)![1]);
      return numA - numB;
    });

    if (slideTexts.length > 0) {
      return `PowerPoint 演示文稿内容：\n\n${slideTexts.join("\n\n")}`;
    } else {
      return "【提取失败】无法从 PowerPoint 文件中提取文本内容。可能是文件格式不支持或不包含文本。";
    }
  } catch (pptxError) {
    console.error("解析 PPTX 失败:", pptxError);
    return "【提取失败】无法解析 PowerPoint 文件内容。请尝试将重要内容复制后直接粘贴。";
  }
}

/**
 * 读取 PDF 文件
 * @param arrayBuffer 文件内容的 ArrayBuffer
 * @returns 文件内容的Promise
 */
async function readPdfFile(arrayBuffer: ArrayBuffer): Promise<string> {
  return Promise.resolve(
    "【功能正在优化中】\n\nPDF 文件解析功能正在升级以提高性能和兼容性，暂时无法使用。请稍后重试，或尝试复制内容后直接粘贴。",
  );
}

/**
 * 读取 ZIP 文件
 * @param arrayBuffer 文件内容的 ArrayBuffer
 * @returns 文件内容的 Promise
 */
async function readZipFile(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);

    let fileContents: string[] = [];
    let fileCount = 0;
    let textFileCount = 0;

    zipContent.forEach(() => fileCount++);

    const filePromises: Promise<void>[] = [];

    zipContent.forEach((path, zipEntry) => {
      if (zipEntry.dir) return;

      const filePromise = (async () => {
        try {
          const ext = path.split(".").pop()?.toLowerCase();
          const textExtensions = [
            "txt",
            "md",
            "js",
            "py",
            "html",
            "css",
            "json",
            "csv",
            "xml",
            "log",
            "ts",
            "tsx",
            "jsx",
          ];

          if (ext && textExtensions.includes(ext)) {
            const content = await zipEntry.async("string");
            fileContents.push(`=== ${path} ===\n\n${content}\n\n`);
            textFileCount++;
          } else {
            const metadata = await zipEntry.async("uint8array");
            fileContents.push(
              `=== ${path} ===\n[二进制文件，大小: ${metadata.length} 字节]\n\n`,
            );
          }
        } catch (fileError) {
          fileContents.push(`=== ${path} ===\n[无法读取此文件]\n\n`);
        }
      })();
      filePromises.push(filePromise);
    });

    await Promise.all(filePromises);

    let result = `ZIP 文件内容:\n总文件数: ${fileCount}\n文本文件数: ${textFileCount}\n\n`;
    result += fileContents.join("");

    return result;
  } catch (zipError: any) {
    console.error("解析 ZIP 失败:", zipError);
    return "【ZIP 解析失败】无法提取 ZIP 文件内容。";
  }
}

/**
 * 读取 Excel 文件
 * @param arrayBuffer 文件内容的 ArrayBuffer
 * @returns 文件内容的Promise
 */
async function readExcelFile(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);

    // 1. 解析共享字符串
    const sharedStringsXml = zipContent.file("xl/sharedStrings.xml");
    let sharedStrings: string[] = [];
    if (sharedStringsXml) {
      const sharedStringsContent = await sharedStringsXml.async("string");
      const textMatches = sharedStringsContent.match(/<t>([^<]*)<\/t>/g);
      if (textMatches) {
        sharedStrings = textMatches.map((match) =>
          match.replace(/<t>|<\/t>/g, ""),
        );
      }
    }

    let result = `Excel 表格内容:\n\n`;

    // 2. 遍历工作表
    const sheetRegex = /xl\/worksheets\/sheet(\d+)\.xml/;
    for (const path in zipContent.files) {
      if (sheetRegex.test(path)) {
        const sheetXml = zipContent.file(path);
        if (sheetXml) {
          const sheetContent = await sheetXml.async("string");
          const sheetName = `工作表 ${path.match(sheetRegex)![1]}`;
          result += `=== ${sheetName} ===\n\n`;

          // 3. 解析行和单元格
          const rows = sheetContent.match(/<row.*?<\/row>/g);
          if (rows) {
            const table = rows
              .map((row) => {
                const cells = row.match(/<c.*?<\/c>/g);
                if (!cells) return "";
                return cells
                  .map((cell) => {
                    const valueMatch = cell.match(/<v>(.*?)<\/v>/);
                    if (!valueMatch) return "";
                    let value = valueMatch[1];
                    // 如果是共享字符串，从表中查找
                    if (cell.includes('t="s"')) {
                      value = sharedStrings[parseInt(value)] ?? "";
                    }
                    return value;
                  })
                  .join(",");
              })
              .join("\n");
            result += table + "\n\n";
          } else {
            result += "[空工作表]\n\n";
          }
        }
      }
    }

    return result;
  } catch (excelError: any) {
    console.error("解析 Excel 失败:", excelError);
    return "【Excel 解析失败】无法提取 Excel 文件内容。";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, fileContent, fileType } = await req.json();

    if (!action || !fileContent || !fileType) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const arrayBuffer = base64ToArrayBuffer(fileContent);
    let result = "";

    switch (action) {
      case "readWord":
        result = await readWordFile(arrayBuffer);
        break;
      case "readPowerPoint":
        result = await readPowerPointFile(arrayBuffer);
        break;
      case "readPdf":
        result = await readPdfFile(arrayBuffer);
        break;
      case "readZip":
        result = await readZipFile(arrayBuffer);
        break;
      case "readExcel":
        result = await readExcelFile(arrayBuffer);
        break;
      default:
        return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    return NextResponse.json({ content: result });
  } catch (error: any) {
    console.error("[FILE_PROCESS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
