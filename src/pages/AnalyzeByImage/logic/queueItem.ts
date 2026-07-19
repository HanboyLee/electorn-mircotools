export type QueueItemStatus = 'pending' | 'running' | 'ok' | 'fail';

export interface QueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
}

export function makeQueueItemId(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

export function createQueueItem(file: File, status: QueueItemStatus = 'pending'): QueueItem {
  return {
    id: makeQueueItemId(file),
    file,
    status,
  };
}

/** 合併入隊：按 id 去重，保留已有項狀態 */
export function mergeQueueItems(existing: QueueItem[], incoming: File[]): {
  next: QueueItem[];
  skippedNames: string[];
} {
  const map = new Map(existing.map(item => [item.id, item]));
  const skippedNames: string[] = [];

  for (const file of incoming) {
    const id = makeQueueItemId(file);
    if (map.has(id)) {
      skippedNames.push(file.name);
      continue;
    }
    // 同名不同內容：允許；僅同 id 視為重複
    map.set(id, createQueueItem(file, 'pending'));
  }

  return { next: Array.from(map.values()), skippedNames };
}
