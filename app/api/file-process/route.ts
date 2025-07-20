import { type NextRequest, NextResponse } from "next/server";

// 保持 mammoth 的导入方式
import mammoth from "mammoth";

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
    // 使用 mammoth 将 .docx 文档转换为文本
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value; // 返回纯文本内容
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
  try {
    // 动态导入 pdf.js
    const pdfjsLib = await import("pdfjs-dist");

    // 设置 worker 路径
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      try {
        const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
      } catch (workerError) {
        // 使用一个稳定版本的CDN链接作为后备
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.677/pdf.worker.min.js`;
      }
    }

    // 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 提取文本内容
    let textContent = `PDF 文档内容 (共 ${pdf.numPages} 页):\n\n`;
    let hasContent = false;

    // 遍历页面
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");

        if (pageText.trim().length > 0) {
          hasContent = true;
          textContent += `--- 第 ${i} 页 ---\n${pageText}\n\n`;
        } else {
          textContent += `--- 第 ${i} 页 ---\n[空白或图像内容]\n\n`;
        }
      } catch (pageError) {
        textContent += `--- 第 ${i} 页 ---\n[无法解析此页]\n\n`;
      }
    }

    if (!hasContent) {
      return `【PDF 内容提取受限】\n\n此 PDF 文件无法提取文本内容，可能是扫描版或受保护的 PDF。`;
    }

    return textContent;
  } catch (pdfError: any) {
    console.error("解析 PDF 失败:", pdfError);
    return "【PDF 解析失败】无法提取 PDF 文件内容。请尝试使用 PDF 查看器打开文件，然后复制内容后直接粘贴。";
  }
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
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    let result = `Excel 表格内容:\n\n`;
    const sheetNames = workbook.SheetNames;

    sheetNames.forEach((sheetName) => {
      result += `=== 工作表: ${sheetName} ===\n\n`;
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });
      if (jsonData.length > 0) {
        // 手动将JSON转换为CSV格式
        const table = jsonData.map((row) => row.join(",")).join("\n");
        result += table + "\n\n";
      } else {
        result += "[空工作表]\n\n";
      }
    });

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
