interface FileManifestItem {
  originalPath: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  mimeType: string;
}

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  rtf: "application/rtf",
  csv: "text/csv",
  // Code
  js: "text/javascript",
  ts: "text/typescript",
  jsx: "text/javascript",
  tsx: "text/typescript",
  json: "application/json",
  html: "text/html",
  css: "text/css",
  py: "text/x-python",
  rb: "text/x-ruby",
  java: "text/x-java",
  cpp: "text/x-c++",
  c: "text/x-c",
  // Archives
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  gz: "application/gzip",
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
  // Video
  mp4: "video/mp4",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  // Other
  xml: "application/xml",
  md: "text/markdown",
  yaml: "text/yaml",
  yml: "text/yaml",
};

export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_TYPES[ext] || "application/octet-stream";
}

export function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export function buildManifestFromEntries(
  entries: Array<{ path: string; size: number }>
): FileManifestItem[] {
  return entries
    .filter((entry) => !entry.path.endsWith("/")) // Skip directories
    .filter((entry) => !entry.path.startsWith("__MACOSX")) // Skip Mac metadata
    .filter((entry) => !entry.path.includes(".DS_Store")) // Skip DS_Store
    .map((entry) => ({
      originalPath: entry.path,
      fileName: getFileName(entry.path),
      extension: getExtension(entry.path),
      sizeBytes: entry.size,
      mimeType: getMimeType(entry.path),
    }));
}

export function countUniqueFolders(paths: string[]): number {
  const folders = new Set<string>();
  for (const path of paths) {
    const parts = path.split("/");
    parts.pop(); // Remove filename
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      folders.add(current);
    }
  }
  return folders.size;
}
