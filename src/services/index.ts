/**
 * src/services 总出口
 *
 * 约定：所有业务与平台能力均经本 index（或各域 index）导出。
 * 目录约定详见仓库根目录 AGENTS.md「src/services 目录约定」。
 */

// 共享底座
export * from './_shared';

// 跨业务平台能力
export * from './platform';

// 业务域
export * from './file-packaging';
export * from './csv-validator';
