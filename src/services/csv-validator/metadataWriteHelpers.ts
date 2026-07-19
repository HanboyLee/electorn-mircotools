import * as fsSync from 'fs';
import * as path from 'path';
import type { CsvMetadataRow } from '../../types/metadata';

/**
 * Resolve bundled Windows ExifTool (Oliver Betz pack under resources).
 * Prefer production resourcesPath; fall back to cwd / appPath for dev.
 */
export function resolveWindowsExiftoolPath(
  resourcesPath: string | undefined,
  cwd: string,
  appPath: string
): string | null {
  const possiblePaths = [
    path.join(resourcesPath || '', 'exiftool-13.12_64', 'exiftool.exe'),
    path.join(cwd, 'exiftool-13.12_64', 'exiftool.exe'),
    path.join(appPath, '..', 'resources', 'exiftool-13.12_64', 'exiftool.exe'),
    path.join(appPath, 'resources', 'exiftool-13.12_64', 'exiftool.exe'),
  ];

  for (const testPath of possiblePaths) {
    try {
      if (fsSync.existsSync(testPath)) {
        return testPath;
      }
    } catch {
      // ignore and try next
    }
  }
  return null;
}

/** Build tags written to image/video (shared by platforms). */
export function buildWriteTags(row: CsvMetadataRow, isVideo: boolean) {
  const keywordList = row.Keywords.split(',')
    .map(k => k.trim())
    .filter(Boolean);

  if (isVideo) {
    return {
      keywordList,
      tags: {
        Title: row.Title,
        Description: row.Description,
        Keywords: keywordList,
        'QuickTime:Title': row.Title,
        'QuickTime:Description': row.Description,
        'XMP-dc:Title': row.Title,
        'XMP-dc:Description': row.Description,
        'XMP-dc:Subject': keywordList,
      },
    };
  }

  return {
    keywordList,
    tags: {
      Title: row.Title,
      Description: row.Description,
      Keywords: keywordList,
      // XMP (JPEG + PNG; what most tools show as keywords on PNG)
      'XMP-dc:Title': row.Title,
      'XMP-dc:Description': row.Description,
      'XMP-dc:Subject': keywordList,
      // IPTC (common for JPEG stock/DAM)
      'IPTC:ObjectName': row.Title,
      'IPTC:Caption-Abstract': row.Description,
      'IPTC:Keywords': keywordList,
    },
  };
}

/** Collect keywords from IPTC/XMP/generic fields after ExifTool read. */
export function normalizeKeywordsFromRead(written: any, fallback: string[]): string[] {
  if (!written) return fallback;
  const candidates = [
    written.Keywords,
    written.Subject,
    written['IPTC:Keywords'],
    written['XMP-dc:Subject'],
    written['XMP:Subject'],
  ];
  for (const value of candidates) {
    if (Array.isArray(value) && value.length) {
      return value.map(String).map((k: string) => k.trim()).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(/[;,]/)
        .map(k => k.trim())
        .filter(Boolean);
    }
  }
  return fallback;
}

/** Prefer short, user-facing errors over dumping the full process command. */
export function formatWriteError(error: unknown): string {
  if (!(error instanceof Error)) {
    return '處理失敗';
  }
  const msg = error.message || '處理失敗';
  // Node child_process / older shell path used to dump entire cmdline
  if (/^Command failed:/i.test(msg) || /^Commandline failed:/i.test(msg)) {
    const firstLine = msg.split('\n')[0];
    const truncated = firstLine.length > 180 ? `${firstLine.slice(0, 180)}…` : firstLine;
    return `ExifTool 執行失敗（常見原因：路徑含特殊字符、文件被占用、或描述過長）。详情：${truncated}`;
  }
  if (msg.length > 400) {
    return `${msg.slice(0, 400)}…`;
  }
  return msg;
}
