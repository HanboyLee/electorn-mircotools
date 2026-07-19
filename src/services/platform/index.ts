/**
 * 跨业务平台能力出口
 * - 文件读写 / 选目录
 * - 网络连通检测
 * - 应用更新
 * 外部请通过本 index 引用，勿直连内部实现文件。
 */
export * from './fileService';
export * from './networkService';
export * from './updateService';
export * from './updateVersion';
