import type { FileGroup } from '@/types/zip';

export type GroupRowStatus = 'idle' | 'pending' | 'running' | 'ok' | 'fail';

export function groupFileCount(group: FileGroup): number {
  return group.files?.length ?? group.count ?? 0;
}

export function groupExtensions(group: FileGroup): string[] {
  const set = new Set(
    (group.files || []).map(f => {
      const ext = (f.extension || '').toLowerCase();
      return ext.startsWith('.') ? ext : ext ? `.${ext}` : '';
    }).filter(Boolean)
  );
  return Array.from(set).sort();
}

export function groupTotalSize(group: FileGroup): number {
  return (group.files || []).reduce((sum, f) => sum + (f.size || 0), 0);
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function groupRowKey(group: FileGroup): string {
  return group.id || `${group.basePath}::${group.name}`;
}

/** 搜索僅影響展示 */
export function filterFileGroups(groups: FileGroup[], searchText: string): FileGroup[] {
  const q = searchText.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter(g => {
    if (g.name.toLowerCase().includes(q)) return true;
    return (g.files || []).some(
      f =>
        f.name.toLowerCase().includes(q) ||
        (f.extension || '').toLowerCase().includes(q)
    );
  });
}
