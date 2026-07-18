/**
 * Orchestration for Metadata Write page — pure session + injectable IPC deps.
 */

import type { ValidationError } from '../types';
import type { CsvMetadataRow, WriteMetadataResult } from '@/types/metadata';
import { validateCsvContent } from '../utils';
import {
  computeMatchStats,
  evaluateReady,
  filterMatchedRows,
  mapCsvRowsToMetadata,
  summarizeWriteResults,
  type CsvRowRecord,
  type MatchStats,
  type ReadyResult,
  type WriteSummary,
} from './metadataWriteLogic';

export interface MetadataWriteDeps {
  selectDirectory: () => Promise<string | null | undefined>;
  validateImageDirectory: (dir: string) => Promise<string[]>;
  writeMetadata: (dir: string, rows: CsvMetadataRow[]) => Promise<WriteMetadataResult[]>;
}

export interface MetadataWriteState {
  imageDirectory: string;
  directoryImages: string[];
  directoryError: string | null;
  csvData: CsvRowRecord[];
  headers: string[];
  csvFileName: string;
  contentErrors: ValidationError[];
  processing: boolean;
  writeSummary: WriteSummary | null;
  writeError: string | null;
}

const initialState = (): MetadataWriteState => ({
  imageDirectory: '',
  directoryImages: [],
  directoryError: null,
  csvData: [],
  headers: [],
  csvFileName: '',
  contentErrors: [],
  processing: false,
  writeSummary: null,
  writeError: null,
});

export type StartWriteResult =
  | { ok: true; summary: WriteSummary; results: WriteMetadataResult[] }
  | { ok: false; reason: string };

export function createMetadataWriteSession(deps: MetadataWriteDeps) {
  let state: MetadataWriteState = initialState();

  const getState = () => state;

  const getMatchStats = (): MatchStats =>
    computeMatchStats(state.directoryImages, state.csvData);

  const getReady = (): ReadyResult =>
    evaluateReady({
      imageDirectory: state.imageDirectory,
      directoryImages: state.directoryImages,
      csvData: state.csvData,
      contentErrors: state.contentErrors,
      processing: state.processing,
    });

  const setDirectory = (dir: string, images: string[]) => {
    state = {
      ...state,
      imageDirectory: dir,
      directoryImages: images,
      directoryError:
        images.length === 0 ? '所選目錄中沒有支持的媒體文件' : null,
      writeSummary: null,
      writeError: null,
    };
    // Re-validate filename match when directory changes (content errors stay from CSV)
    if (state.csvData.length > 0) {
      // content errors only from content; match is separate via stats
    }
  };

  const selectImageDirectory = async () => {
    const directory = await deps.selectDirectory();
    if (!directory) return;

    const images = await deps.validateImageDirectory(directory);
    setDirectory(directory, images || []);
  };

  const applyCsvData = (data: CsvRowRecord[], headers: string[], fileName: string) => {
    const contentErrors = validateCsvContent(data);
    state = {
      ...state,
      csvData: data,
      headers,
      csvFileName: fileName,
      contentErrors,
      writeSummary: null,
      writeError: null,
    };
  };

  const clearCsv = () => {
    state = {
      ...state,
      csvData: [],
      headers: [],
      csvFileName: '',
      contentErrors: [],
      writeSummary: null,
      writeError: null,
    };
  };

  const startWrite = async (): Promise<StartWriteResult> => {
    const ready = getReady();
    if (!ready.canStartWrite) {
      return { ok: false, reason: ready.reasons[0] || '尚未就緒' };
    }

    state = { ...state, processing: true, writeError: null, writeSummary: null };

    try {
      const matchedRows = filterMatchedRows(state.csvData, state.directoryImages);
      const payload = mapCsvRowsToMetadata(matchedRows);
      const skipped = getMatchStats().missing;

      const results = await deps.writeMetadata(state.imageDirectory, payload);
      const list = Array.isArray(results) ? results : [];
      const summary = summarizeWriteResults(list, skipped);

      state = {
        ...state,
        processing: false,
        writeSummary: summary,
        writeError: null,
      };
      return { ok: true, summary, results: list };
    } catch (error) {
      const message = error instanceof Error ? error.message : '處理過程中發生錯誤';
      state = {
        ...state,
        processing: false,
        writeError: message,
        writeSummary: null,
      };
      return { ok: false, reason: message };
    }
  };

  const reset = () => {
    state = initialState();
  };

  return {
    getState,
    getMatchStats,
    getReady,
    setDirectory,
    selectImageDirectory,
    applyCsvData,
    clearCsv,
    startWrite,
    reset,
  };
}

export type MetadataWriteSession = ReturnType<typeof createMetadataWriteSession>;
