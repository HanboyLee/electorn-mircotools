import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Empty,
  Input,
  Modal,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from 'antd';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  FileZipOutlined,
  FolderOpenOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { FileGroup, ZipResult } from '@/types/zip';
import { FileIPC, ZipIPC } from '@/constants/ipc';
import {
  filterFileGroups,
  formatBytes,
  groupExtensions,
  groupFileCount,
  groupRowKey,
  groupTotalSize,
  type GroupRowStatus,
} from './logic/groupUtils';

const { Title, Text } = Typography;

const SCAN_HINT = '.ai / .eps / .jpg / .png';

const FilePackagingPage: React.FC = () => {
  const { token } = theme.useToken();

  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isPackaging, setIsPackaging] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    current: string | null;
  } | null>(null);
  const [rowStatus, setRowStatus] = useState<Record<string, GroupRowStatus>>({});
  const [packagingResults, setPackagingResults] = useState<ZipResult[]>([]);

  const filteredGroups = useMemo(
    () => filterFileGroups(fileGroups, searchText),
    [fileGroups, searchText]
  );

  const successCount = useMemo(
    () => packagingResults.filter(r => r.success).length,
    [packagingResults]
  );
  const failCount = packagingResults.length - successCount;

  const canPackAll = !!selectedDirectory && fileGroups.length > 0 && !isPackaging && !loading;

  const scanDirectory = useCallback(async (directoryPath: string): Promise<FileGroup[]> => {
    if (!directoryPath) {
      message.error('請選擇有效的目錄');
      return [];
    }
    try {
      setLoading(true);
      const groups = await window.electronAPI[ZipIPC.SCAN_DIRECTORY](directoryPath);
      const list = (groups || []).map(g => ({
        ...g,
        count: groupFileCount(g),
      }));
      setFileGroups(list);
      setRowStatus({});
      setPackagingResults([]);
      setProgress(null);
      if (list.length > 0) {
        message.success(`找到 ${list.length} 個文件組`);
      } else {
        message.info('未找到可打包的文件組');
      }
      return list;
    } catch (error) {
      console.error('掃描目錄時出錯:', error);
      message.error('掃描目錄時出錯');
      setFileGroups([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectDirectory = async () => {
    if (isPackaging) return;
    try {
      const directoryPath = await window.electronAPI[FileIPC.SELECT_DIRECTORY]();
      if (!directoryPath) return;
      setSelectedDirectory(directoryPath);
      setSearchText('');
      await scanDirectory(directoryPath);
    } catch (error) {
      console.error('選擇目錄時出錯:', error);
      message.error('選擇目錄時出錯');
    }
  };

  const handleOpenDirectory = async () => {
    if (!selectedDirectory) {
      message.warning('請先選擇目錄');
      return;
    }
    try {
      const ok = await window.electronAPI[ZipIPC.OPEN_ITEM](selectedDirectory, true);
      if (!ok) {
        message.error('無法打開打包目錄');
      }
    } catch (error) {
      console.error('打開打包目錄時出錯:', error);
      message.error('打開打包目錄時出錯');
    }
  };

  const packAllGroups = async (groups: FileGroup[]) => {
    const total = groups.length;
    if (total === 0) {
      message.info('沒有可打包的文件組');
      return;
    }

    setIsPackaging(true);
    setPackagingResults([]);
    setProgress({ done: 0, total, current: groups[0]?.name ?? null });

    const initialStatus: Record<string, GroupRowStatus> = {};
    groups.forEach(g => {
      initialStatus[groupRowKey(g)] = 'pending';
    });
    setRowStatus(initialStatus);

    const results: ZipResult[] = [];
    let done = 0;

    try {
      for (const group of groups) {
        const key = groupRowKey(group);
        setRowStatus(prev => ({ ...prev, [key]: 'running' }));
        setProgress({ done, total, current: group.name });

        try {
          const result = await window.electronAPI[ZipIPC.CREATE_ZIP](group);
          if (result?.success) {
            results.push(result);
            setRowStatus(prev => ({ ...prev, [key]: 'ok' }));
          } else {
            results.push(
              result || {
                success: false,
                message: '創建 ZIP 失敗',
                groupName: group.name,
                sourceDirectory: group.basePath,
              }
            );
            setRowStatus(prev => ({ ...prev, [key]: 'fail' }));
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          results.push({
            success: false,
            message: msg,
            groupName: group.name,
            sourceDirectory: group.basePath,
          });
          setRowStatus(prev => ({ ...prev, [key]: 'fail' }));
        }

        done += 1;
        setProgress({ done, total, current: group.name });
        setPackagingResults([...results]);
      }

      const ok = results.filter(r => r.success).length;
      const fail = results.length - ok;
      message.success(`打包完成：成功 ${ok}，失敗 ${fail}`);
    } finally {
      setIsPackaging(false);
      setProgress(prev => (prev ? { ...prev, current: null } : null));
    }
  };

  const handlePackAll = () => {
    if (!canPackAll) {
      if (!selectedDirectory) message.error('請先選擇目錄');
      else if (fileGroups.length === 0) message.warning('沒有可打包的文件組');
      return;
    }

    // 使用掃描快照，避免過程中狀態被改寫
    const snapshot = [...fileGroups];

    Modal.confirm({
      title: '確認全部打包',
      content: (
        <div>
          <p>
            將在下列目錄為 <strong>全部 {snapshot.length} 個</strong>文件組各生成一個 ZIP。
            同名 ZIP 可能被覆蓋。
          </p>
          <p style={{ wordBreak: 'break-all' }}>
            <strong>工作目錄：</strong>
            {selectedDirectory}
          </p>
        </div>
      ),
      okText: '開始打包',
      cancelText: '取消',
      onOk: () => packAllGroups(snapshot),
    });
  };

  const statusTag = (status: GroupRowStatus | undefined) => {
    switch (status) {
      case 'pending':
        return <Tag>排隊</Tag>;
      case 'running':
        return <Tag color="processing">打包中</Tag>;
      case 'ok':
        return <Tag color="success">成功</Tag>;
      case 'fail':
        return <Tag color="error">失敗</Tag>;
      default:
        return <Tag>待打包</Tag>;
    }
  };

  const columns: ColumnsType<FileGroup> = [
    {
      title: '組名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '擴展名',
      key: 'exts',
      width: 200,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {groupExtensions(record).map(ext => (
            <Tag key={ext} style={{ marginInlineEnd: 0 }}>
              {ext}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '文件數',
      key: 'count',
      width: 88,
      render: (_, record) => groupFileCount(record),
    },
    {
      title: '大小',
      key: 'size',
      width: 100,
      render: (_, record) => formatBytes(groupTotalSize(record)),
    },
    {
      title: '狀態',
      key: 'status',
      width: 96,
      render: (_, record) => statusTag(rowStatus[groupRowKey(record)]),
    },
  ];

  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  const showWorkspace = !!selectedDirectory;
  const showNoMatch = showWorkspace && !loading && fileGroups.length === 0;

  return (
    <PageRoot>
      <ScrollArea>
        <PageHeader>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              文件打包
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              掃描同名多格式文件並打包為 ZIP，輸出到源目錄。
            </Text>
            <Rule style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
              規則：同名 · {SCAN_HINT} → {'{組名}'}.zip
            </Rule>
          </div>
        </PageHeader>

        {!showWorkspace && (
          <CardPanel style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={8}>
                  <Text strong style={{ fontSize: 16 }}>
                    開始文件打包
                  </Text>
                  <Text type="secondary">
                    選擇包含同名多格式素材的文件夾（例如 design.ai + design.jpg）。系統會按基本名分組並生成
                    ZIP。
                  </Text>
                </Space>
              }
            >
              <Button
                type="primary"
                icon={<FolderOpenOutlined />}
                onClick={handleSelectDirectory}
                loading={loading}
              >
                選擇目錄
              </Button>
            </Empty>
          </CardPanel>
        )}

        {showWorkspace && (
          <>
            <CardPanel
              style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}
            >
              <SectionTitle>工作目錄</SectionTitle>
              <DirRow>
                <Tooltip title={selectedDirectory}>
                  <PathText ellipsis>{selectedDirectory}</PathText>
                </Tooltip>
                <Space wrap>
                  <Button
                    icon={<FolderOpenOutlined />}
                    onClick={handleSelectDirectory}
                    disabled={isPackaging}
                    loading={loading}
                  >
                    選擇目錄
                  </Button>
                  <Tooltip title={selectedDirectory ? '在系統中打開此目錄（ZIP 輸出位置）' : '請先選擇目錄'}>
                    <Button
                      type="primary"
                      icon={<FolderOpenOutlined />}
                      onClick={handleOpenDirectory}
                      disabled={!selectedDirectory}
                    >
                      打開打包目錄
                    </Button>
                  </Tooltip>
                </Space>
              </DirRow>
              <Space size={[8, 8]} wrap style={{ marginTop: 10 }}>
                <Tag color="blue">{fileGroups.length} 個文件組</Tag>
                <Tag>{SCAN_HINT}</Tag>
              </Space>
            </CardPanel>

            {showNoMatch && (
              <CardPanel
                style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}
              >
                <Empty
                  description={
                    <Space direction="vertical" size={8}>
                      <Text strong>未找到可打包的文件組</Text>
                      <Text type="secondary">
                        目錄內需存在同名且擴展名為 {SCAN_HINT} 的文件。可再點「選擇目錄」更換或重選同一路徑。
                      </Text>
                    </Space>
                  }
                >
                  <Button type="primary" icon={<FolderOpenOutlined />} onClick={handleSelectDirectory}>
                    選擇目錄
                  </Button>
                </Empty>
              </CardPanel>
            )}

            {!showNoMatch && (
              <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                <Col xs={24} lg={15}>
                  <CardPanel
                    style={{
                      borderColor: token.colorBorderSecondary,
                      background: token.colorBgContainer,
                    }}
                  >
                    <SectionTitle>
                      文件組{' '}
                      <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                        · {filteredGroups.length}
                        {searchText.trim() ? ` / ${fileGroups.length}` : ''} 組
                      </Text>
                    </SectionTitle>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="搜索組名或擴展名…"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      disabled={isPackaging}
                      style={{ marginBottom: 12, maxWidth: 360 }}
                    />
                    <Table
                      size="small"
                      rowKey={groupRowKey}
                      columns={columns}
                      dataSource={filteredGroups}
                      loading={loading}
                      pagination={
                        filteredGroups.length > 20
                          ? { pageSize: 20, showSizeChanger: false }
                          : false
                      }
                      locale={{ emptyText: '無符合搜索的文件組' }}
                      scroll={{ x: 640 }}
                    />
                    {searchText.trim() && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        搜索只過濾展示；全部打包仍針對掃描到的全部 {fileGroups.length} 組
                      </Text>
                    )}
                  </CardPanel>
                </Col>
                <Col xs={24} lg={9}>
                  <CardPanel
                    style={{
                      borderColor: token.colorBorderSecondary,
                      background: token.colorBgContainer,
                      height: '100%',
                    }}
                  >
                    <SectionTitle>就緒檢查</SectionTitle>
                    <ReadyList>
                      <ReadyItem>
                        <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        <Text>已選擇目錄</Text>
                      </ReadyItem>
                      <ReadyItem>
                        {fileGroups.length > 0 ? (
                          <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        ) : (
                          <ExclamationCircleFilled style={{ color: token.colorWarning }} />
                        )}
                        <Text type={fileGroups.length > 0 ? undefined : 'secondary'}>
                          {fileGroups.length > 0
                            ? `可打包 ${fileGroups.length} 個文件組`
                            : '尚無可打包文件組'}
                        </Text>
                      </ReadyItem>
                      <ReadyItem>
                        {!isPackaging ? (
                          <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        ) : (
                          <ExclamationCircleFilled style={{ color: token.colorPrimary }} />
                        )}
                        <Text type={isPackaging ? 'secondary' : undefined}>
                          {isPackaging ? '打包進行中…' : '系統空閒，可開始打包'}
                        </Text>
                      </ReadyItem>
                    </ReadyList>

                    {(isPackaging || (progress && progress.total > 0)) && progress && (
                      <div style={{ marginTop: 14 }}>
                        <ProgressLabel>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {isPackaging
                              ? `正在打包 ${progress.done}/${progress.total}${
                                  progress.current ? ` · ${progress.current}` : ''
                                }`
                              : `已完成 ${progress.done}/${progress.total}`}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {progressPercent}%
                          </Text>
                        </ProgressLabel>
                        <Progress
                          percent={progressPercent}
                          status={isPackaging ? 'active' : 'normal'}
                          showInfo={false}
                        />
                      </div>
                    )}
                  </CardPanel>
                </Col>
              </Row>
            )}

            {packagingResults.length > 0 && (
              <CardPanel
                style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}
              >
                <SectionTitle>
                  打包結果{' '}
                  <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                    · ZIP 已寫入上方「工作目錄」，請用「打開打包目錄」查看
                  </Text>
                </SectionTitle>
                <Row gutter={12} style={{ marginBottom: 12 }}>
                  <Col span={6}>
                    <StatBox style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        合計
                      </Text>
                      <StatNum>{packagingResults.length}</StatNum>
                    </StatBox>
                  </Col>
                  <Col span={6}>
                    <StatBox style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        成功
                      </Text>
                      <StatNum style={{ color: token.colorSuccess }}>{successCount}</StatNum>
                    </StatBox>
                  </Col>
                  <Col span={6}>
                    <StatBox style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        失敗
                      </Text>
                      <StatNum style={{ color: token.colorError }}>{failCount}</StatNum>
                    </StatBox>
                  </Col>
                  <Col span={6}>
                    <StatBox style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        成功率
                      </Text>
                      <StatNum>
                        {packagingResults.length
                          ? Math.round((successCount / packagingResults.length) * 100)
                          : 0}
                        %
                      </StatNum>
                    </StatBox>
                  </Col>
                </Row>

                {failCount > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 12 }}
                    message="部分組打包失敗，可檢查文件是否被佔用後再次「全部打包」。"
                  />
                )}

                <ResultList>
                  {packagingResults.map((r, idx) => (
                    <ResultRow key={`${r.groupName || idx}-${idx}`}>
                      <div>
                        <Text strong>{r.groupName ? `${r.groupName}.zip` : 'ZIP'}</Text>
                        <Tag
                          color={r.success ? 'success' : 'error'}
                          style={{ marginLeft: 8 }}
                        >
                          {r.success ? '成功' : '失敗'}
                        </Tag>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {r.success
                              ? `包含 ${r.fileCount ?? '—'} 個文件`
                              : r.message || '打包失敗'}
                          </Text>
                        </div>
                      </div>
                    </ResultRow>
                  ))}
                </ResultList>
              </CardPanel>
            )}
          </>
        )}
      </ScrollArea>

      <ActionBar
        style={{
          borderColor: token.colorBorderSecondary,
          background: token.colorBgContainer,
        }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          {fileGroups.length > 0
            ? `將一次打包全部 ${fileGroups.length} 個文件組（無單組 / 無勾選）`
            : selectedDirectory
              ? '暫無可打包文件組'
              : '請先選擇工作目錄'}
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<FileZipOutlined />}
          loading={isPackaging}
          disabled={!canPackAll && !isPackaging}
          onClick={handlePackAll}
        >
          {isPackaging
            ? '打包中…'
            : fileGroups.length > 0
              ? `全部打包 (${fileGroups.length})`
              : '全部打包'}
        </Button>
      </ActionBar>
    </PageRoot>
  );
};

export default FilePackagingPage;

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  position: relative;
  padding-bottom: 72px;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 16px;
`;

const Rule = styled.div`
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: inherit;
  opacity: 0.85;
  border: 1px solid transparent;
  padding: 4px 10px;
  border-radius: 999px;
`;

const CardPanel = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const DirRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const PathText = styled(Text)`
  flex: 1;
  min-width: 180px;
  word-break: break-all;
`;

const ReadyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReadyItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 8px;
`;

const StatBox = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px 12px;
`;

const StatNum = styled.div`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 2px;
`;

const ResultList = styled.div`
  max-height: 280px;
  overflow: auto;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 10;
  margin: 0 -4px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
`;
