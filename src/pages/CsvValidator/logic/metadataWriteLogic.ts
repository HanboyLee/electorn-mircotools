/**
 * Pure logic for Metadata Write page — unit-tested without Electron/React.
 * Missing directory files are warnings: write may proceed for matched rows only.
 */

import type { ValidationError } from '../types';
import type { CsvMetadataRow, WriteMetadataResult } from '@/types/metadata';

export interface MatchStats {
  directoryCount: number;
  csvRows: number;
  matched: number;
  missing: number;
  missingFilenames: string[];
  matchedFilenames: string[];
}

export type CsvRowRecord = Record<string, string>;

function getFilename(row: CsvRowRecord): string {
  return String(row.Filename ?? row.filename ?? '').trim();
}

export function computeMatchStats(
  directoryImages: string[],
  csvData: CsvRowRecord[]
): MatchStats {
  const dirSet = new Set(directoryImages);
  const matchedFilenames: string[] = [];
  const missingFilenames: string[] = [];

  for (const row of csvData) {
    const name = getFilename(row);
    if (!name) continue;
    if (dirSet.has(name)) {
      matchedFilenames.push(name);
    } else {
      missingFilenames.push(name);
    }
  }

  return {
    directoryCount: directoryImages.length,
    csvRows: csvData.length,
    matched: matchedFilenames.length,
    missing: missingFilenames.length,
    missingFilenames,
    matchedFilenames,
  };
}

export interface ReadyInput {
  imageDirectory: string;
  directoryImages: string[];
  csvData: CsvRowRecord[];
  contentErrors: ValidationError[];
  processing: boolean;
}

export interface ReadyResult {
  canStartWrite: boolean;
  reasons: string[];
  matchedCount: number;
  missingCount: number;
}

export function evaluateReady(input: ReadyInput): ReadyResult {
  const reasons: string[] = [];
  const stats = computeMatchStats(input.directoryImages, input.csvData);

  if (input.processing) {
    reasons.push('正在寫入中，請稍候');
  }
  if (!input.imageDirectory?.trim()) {
    reasons.push('請先選擇圖片目錄');
  } else if (input.directoryImages.length === 0) {
    reasons.push('所選目錄中沒有支持的媒體文件');
  }
  if (!input.csvData || input.csvData.length === 0) {
    reasons.push('請先上傳合法 CSV');
  }
  if (input.contentErrors && input.contentErrors.length > 0) {
    reasons.push('CSV 內容校驗未通過');
  }
  if (
    input.csvData?.length > 0 &&
    (!input.contentErrors || input.contentErrors.length === 0) &&
    stats.matched === 0 &&
    input.directoryImages.length > 0
  ) {
    reasons.push('沒有可匹配的文件可寫入');
  }

  return {
    canStartWrite: reasons.length === 0,
    reasons,
    matchedCount: stats.matched,
    missingCount: stats.missing,
  };
}

export function filterMatchedRows(
  csvData: CsvRowRecord[],
  directoryImages: string[]
): CsvMetadataRow[] {
  const dirSet = new Set(directoryImages);
  return csvData
    .filter(row => dirSet.has(getFilename(row)))
    .map(row => mapCsvRowsToMetadata([row])[0]);
}

export function mapCsvRowsToMetadata(rows: CsvRowRecord[]): CsvMetadataRow[] {
  return rows.map(row => ({
    Filename: getFilename(row),
    Title: String(row.Title ?? row.title ?? ''),
    Description: String(row.Description ?? row.description ?? ''),
    Keywords: String(row.Keywords ?? row.keywords ?? ''),
  }));
}

export interface WriteSummary {
  success: number;
  failed: number;
  skipped: number;
  failures: Array<{ filename: string; error: string }>;
}

export function summarizeWriteResults(
  results: WriteMetadataResult[],
  skipped: number
): WriteSummary {
  let success = 0;
  let failed = 0;
  const failures: Array<{ filename: string; error: string }> = [];

  for (const r of results || []) {
    const filename = String(r.Filename ?? r.filename ?? '');
    if (r.success) {
      success += 1;
    } else {
      failed += 1;
      failures.push({
        filename,
        error: r.error || '未知錯誤',
      });
    }
  }

  return {
    success,
    failed,
    skipped,
    failures,
  };
}
