import React, { useCallback, useMemo, useReducer, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { CsvUpload } from './components/CsvUpload';
import { FileIPC, MetadataIPC } from '../../constants/ipc';
import {
  createMetadataWriteSession,
  type MetadataWriteSession,
} from './logic/metadataWriteSession';
import type { CsvRowRecord } from './logic/metadataWriteLogic';

const { Title, Text, Paragraph } = Typography;

function createIpcSession(): MetadataWriteSession {
  return createMetadataWriteSession({
    selectDirectory: () => window.electronAPI[FileIPC.SELECT_DIRECTORY](),
    validateImageDirectory: (dir: string) =>
      window.electronAPI[FileIPC.VALIDATE_IMAGE_DIRECTORY](dir),
    writeMetadata: (dir, rows) => window.electronAPI[MetadataIPC.METADATA_WRITE](dir, rows),
  });
}

const CsvValidator: React.FC = () => {
  const { token } = theme.useToken();
  const [session] = useState(() => createIpcSession());
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const refresh = useCallback(() => bump(), []);

  const state = session.getState();
  const ready = session.getReady();
  const stats = session.getMatchStats();

  const handleSelectDirectory = async () => {
    await session.selectImageDirectory();
    refresh();
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const onUploadError = (error: Error) => {
    setUploadError(error.message);
    session.clearCsv();
    refresh();
  };

  const onUploadSuccess = (data: CsvRowRecord[], headers: string[], fileName?: string) => {
    setUploadError(null);
    session.applyCsvData(data, headers, fileName || 'upload.csv');
    refresh();
  };

  const handleRemoveCsv = () => {
    setUploadError(null);
    session.clearCsv();
    refresh();
  };

  const handleStartWrite = async () => {
    if (!ready.canStartWrite) return;
    // startWrite sets processing=true synchronously before the IPC await;
    // refresh immediately so loading/disabled/「寫入中…」paint mid-write.
    const writePromise = session.startWrite();
    refresh();
    await writePromise;
    refresh();
  };

  const handleReset = () => {
    setUploadError(null);
    session.reset();
    refresh();
  };

  const previewRows = useMemo(() => {
    const dirSet = new Set(state.directoryImages);
    return state.csvData.slice(0, 50).map((row, index) => {
      const filename = String(row.Filename ?? '');
      const matched = dirSet.has(filename);
      return {
        key: `${index}-${filename}`,
        status: matched ? 'matched' : 'missing',
        Filename: filename,
        Title: row.Title,
        Description: row.Description,
        Keywords: row.Keywords,
      };
    });
  }, [state.csvData, state.directoryImages]);

  const isEmpty = !state.imageDirectory && state.csvData.length === 0 && !state.writeSummary;

  const readyHint = ready.canStartWrite
    ? `就緒：將寫入 ${ready.matchedCount} 條匹配項${
        ready.missingCount > 0 ? `（跳過 ${ready.missingCount} 條缺失）` : ''
      }`
    : ready.reasons[0] || '尚未就緒';

  return (
    <PageRoot>
      <ScrollArea>
        <PageHeader>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              元數據寫入圖片
            </Title>
            <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              從 CSV 批量寫入 Title / Description / Keywords 到對應圖片文件（ExifTool）。
            </Paragraph>
          </div>
        </PageHeader>

        <Collapse
          bordered={false}
          style={{
            marginBottom: 16,
            background: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
          }}
          items={[
            {
              key: 'format',
              label: (
                <span>
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  CSV 格式要求
                </span>
              ),
              children: (
                <div>
                  <Text type="secondary">必需欄位：</Text>
                  <CodeLine>Filename,Title,Description,Keywords</CodeLine>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: token.colorTextSecondary }}>
                    <li>CSV 必須使用逗號 (,) 作為分隔符</li>
                    <li>欄位名稱必須與上述一致</li>
                    <li>Filename 必須與圖片文件名完全匹配</li>
                    <li>Keywords 中的關鍵詞請用逗號分隔</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />

        {isEmpty && (
          <EmptyCard>
            <FolderOpenOutlined style={{ fontSize: 36, color: token.colorPrimary }} />
            <Title level={5} style={{ marginTop: 12 }}>
              從選擇圖片目錄開始
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 360 }}>
              選擇包含圖片的文件夾後，再上傳對應的 CSV。系統會校驗文件名是否匹配，再批量寫入元數據。
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<FolderOpenOutlined />}
              onClick={handleSelectDirectory}
              disabled={state.processing}
            >
              選擇圖片目錄
            </Button>
          </EmptyCard>
        )}

        {!isEmpty && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={15}>
              <Card
                size="small"
                title="圖片目錄"
                extra={
                  state.imageDirectory && state.directoryImages.length > 0 ? (
                    <Tag color="success">已就緒</Tag>
                  ) : state.directoryError ? (
                    <Tag color="error">異常</Tag>
                  ) : (
                    <Tag>未選擇</Tag>
                  )
                }
              >
                <DirRow>
                  <PathBox title={state.imageDirectory || undefined}>
                    {state.imageDirectory || '尚未選擇目錄'}
                  </PathBox>
                  <Button
                    icon={<FolderOpenOutlined />}
                    onClick={handleSelectDirectory}
                    disabled={state.processing}
                  >
                    {state.imageDirectory ? '更換' : '選擇'}
                  </Button>
                </DirRow>
                {state.imageDirectory && (
                  <MetaLine>
                    媒體文件 <Text strong>{state.directoryImages.length}</Text>
                    <Text type="secondary"> · 支持 jpg / jpeg / png</Text>
                  </MetaLine>
                )}
                {state.directoryError && (
                  <Alert
                    type="error"
                    showIcon
                    message={state.directoryError}
                    style={{ marginTop: 12 }}
                  />
                )}
              </Card>

              <Card size="small" title="CSV 文件" style={{ marginTop: 12 }}>
                <CsvUpload
                  onUpload={(data, headers, fileName) => {
                    onUploadSuccess(data as CsvRowRecord[], headers, fileName);
                  }}
                  onError={onUploadError}
                  onProgress={() => {}}
                  progress={state.csvData.length > 0 ? 100 : 0}
                  onRemove={handleRemoveCsv}
                  selectedFileName={state.csvFileName}
                  disabled={state.processing}
                />
                {uploadError && (
                  <Alert
                    type="error"
                    showIcon
                    message="CSV 上傳失敗"
                    description={uploadError}
                    style={{ marginTop: 12 }}
                  />
                )}
                {state.contentErrors.length > 0 && (
                  <Alert
                    type="error"
                    showIcon
                    style={{ marginTop: 12 }}
                    message="CSV 內容校驗未通過"
                    description={
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {state.contentErrors.slice(0, 8).map((e, i) => (
                          <li key={i}>{e.message}</li>
                        ))}
                        {state.contentErrors.length > 8 && (
                          <li>…另有 {state.contentErrors.length - 8} 條</li>
                        )}
                      </ul>
                    }
                  />
                )}
              </Card>

              {state.csvData.length > 0 && state.contentErrors.length === 0 && (
                <Card
                  size="small"
                  title="數據預覽"
                  style={{ marginTop: 12 }}
                  extra={
                    stats.missing > 0 ? (
                      <Tag color="warning">{stats.missing} 條缺失</Tag>
                    ) : (
                      <Tag color="success">全部匹配</Tag>
                    )
                  }
                >
                  <Table
                    size="small"
                    pagination={false}
                    scroll={{ x: true, y: 220 }}
                    dataSource={previewRows}
                    columns={[
                      {
                        title: '狀態',
                        dataIndex: 'status',
                        width: 80,
                        render: (s: string) =>
                          s === 'matched' ? (
                            <Tag color="success">匹配</Tag>
                          ) : (
                            <Tag color="warning">缺失</Tag>
                          ),
                      },
                      { title: 'Filename', dataIndex: 'Filename', ellipsis: true },
                      { title: 'Title', dataIndex: 'Title', ellipsis: true },
                      { title: 'Description', dataIndex: 'Description', ellipsis: true },
                      { title: 'Keywords', dataIndex: 'Keywords', ellipsis: true },
                    ]}
                  />
                  {stats.missing > 0 && (
                    <Alert
                      type="warning"
                      showIcon
                      style={{ marginTop: 12 }}
                      message="部分 Filename 在目錄中找不到，寫入時將跳過"
                      description={stats.missingFilenames.slice(0, 12).join('、')}
                    />
                  )}
                </Card>
              )}

              {state.writeSummary && (
                <Card size="small" title="寫入結果" style={{ marginTop: 12 }}>
                  <ResultHero>
                    {state.writeSummary.failed === 0 ? (
                      <CheckCircleOutlined style={{ fontSize: 40, color: token.colorSuccess }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: 40, color: token.colorWarning }} />
                    )}
                    <Title level={5} style={{ margin: '8px 0 4px' }}>
                      {state.writeSummary.failed === 0
                        ? '寫入完成'
                        : '寫入完成（部分失敗）'}
                    </Title>
                    <Text type="secondary">
                      成功 {state.writeSummary.success} · 失敗 {state.writeSummary.failed} · 跳過{' '}
                      {state.writeSummary.skipped}
                    </Text>
                  </ResultHero>
                  <Row gutter={12} style={{ marginTop: 16 }}>
                    <Col span={8}>
                      <Statistic title="成功" value={state.writeSummary.success} valueStyle={{ color: token.colorSuccess }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="失敗" value={state.writeSummary.failed} valueStyle={{ color: token.colorError }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="跳過" value={state.writeSummary.skipped} valueStyle={{ color: token.colorWarning }} />
                    </Col>
                  </Row>
                  {state.writeSummary.failures.length > 0 && (
                    <Table
                      size="small"
                      style={{ marginTop: 16 }}
                      pagination={false}
                      dataSource={state.writeSummary.failures.map((f, i) => ({
                        key: i,
                        ...f,
                      }))}
                      columns={[
                        { title: 'Filename', dataIndex: 'filename', ellipsis: true },
                        { title: '原因', dataIndex: 'error', ellipsis: true },
                      ]}
                    />
                  )}
                </Card>
              )}

              {state.writeError && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginTop: 12 }}
                  message="寫入失敗"
                  description={state.writeError}
                />
              )}
            </Col>

            <Col xs={24} lg={9}>
              <Card size="small" title="匹配統計">
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <StatBox>
                      <Text type="secondary">目錄媒體</Text>
                      <StatValue>{stats.directoryCount}</StatValue>
                    </StatBox>
                  </Col>
                  <Col span={12}>
                    <StatBox>
                      <Text type="secondary">CSV 行數</Text>
                      <StatValue>{stats.csvRows}</StatValue>
                    </StatBox>
                  </Col>
                  <Col span={12}>
                    <StatBox>
                      <Text type="secondary">可匹配</Text>
                      <StatValue style={{ color: token.colorSuccess }}>{stats.matched}</StatValue>
                    </StatBox>
                  </Col>
                  <Col span={12}>
                    <StatBox>
                      <Text type="secondary">缺失</Text>
                      <StatValue style={{ color: stats.missing ? token.colorWarning : undefined }}>
                        {stats.missing}
                      </StatValue>
                    </StatBox>
                  </Col>
                </Row>
              </Card>

              <Card size="small" title="就緒檢查" style={{ marginTop: 12 }}>
                <CheckList>
                  <li>
                    <CheckDot $on={!!state.imageDirectory && state.directoryImages.length > 0} />
                    {state.imageDirectory && state.directoryImages.length > 0
                      ? `已選擇圖片目錄（${state.directoryImages.length} 個媒體）`
                      : '尚未選擇有效圖片目錄'}
                  </li>
                  <li>
                    <CheckDot
                      $on={state.csvData.length > 0 && state.contentErrors.length === 0}
                    />
                    {state.csvData.length > 0 && state.contentErrors.length === 0
                      ? `CSV 合法（${state.csvData.length} 行）`
                      : '尚未上傳合法 CSV'}
                  </li>
                  <li>
                    <CheckDot
                      $on={stats.matched > 0}
                      $warn={stats.missing > 0 && stats.matched > 0}
                    />
                    {stats.matched > 0
                      ? stats.missing > 0
                        ? `可寫入 ${stats.matched} 條（跳過 ${stats.missing} 缺失）`
                        : `可寫入 ${stats.matched} 條`
                      : '沒有可匹配的寫入行'}
                  </li>
                </CheckList>
              </Card>

              <Card size="small" title="寫入說明" style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  將使用 ExifTool 原地寫入元數據。建議先備份目錄。主操作僅在就緒後可點；寫入過程中不可重複提交。
                </Text>
              </Card>
            </Col>
          </Row>
        )}
      </ScrollArea>

      <ActionBar $border={token.colorBorderSecondary} $bg={token.colorBgElevated}>
        <ActionHint type="secondary">{readyHint}</ActionHint>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={state.processing}>
            重置
          </Button>
          <Tooltip title={ready.canStartWrite ? undefined : ready.reasons.join('；')}>
            <Button
              type="primary"
              size="large"
              onClick={handleStartWrite}
              loading={state.processing}
              disabled={!ready.canStartWrite}
            >
              {state.processing ? '寫入中…' : '開始寫入元數據'}
            </Button>
          </Tooltip>
        </Space>
      </ActionBar>
    </PageRoot>
  );
};

export default CsvValidator;

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - 56px);
  position: relative;
`;

const ScrollArea = styled.div`
  flex: 1;
  padding-bottom: 80px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CodeLine = styled.code`
  display: block;
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.04);
  color: #1668dc;
`;

const EmptyCard = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const DirRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: stretch;
`;

const PathBox = styled.div`
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaLine = styled.div`
  margin-top: 10px;
  font-size: 12px;
`;

const StatBox = styled.div`
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
`;

const CheckList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.4;
  }
`;

const CheckDot = styled.span<{ $on?: boolean; $warn?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  border: 1.5px solid
    ${p => (p.$on ? (p.$warn ? '#d97706' : '#16a34a') : 'rgba(0,0,0,0.15)')};
  background: ${p =>
    p.$on ? (p.$warn ? '#fffbeb' : '#16a34a') : '#fff'};
  position: relative;

  &::after {
    content: ${p => (p.$on ? (p.$warn ? '"!"' : '"✓"') : '""')};
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 10px;
    color: ${p => (p.$warn ? '#d97706' : '#fff')};
    font-weight: 700;
  }
`;

const ResultHero = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const ActionBar = styled.div<{ $border: string; $bg: string }>`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  padding: 12px 4px;
  margin-top: auto;
  background: ${p => p.$bg};
  border-top: 1px solid ${p => p.$border};
`;

const ActionHint = styled(Text)`
  flex: 1;
  min-width: 0;
  font-size: 12px;
`;
