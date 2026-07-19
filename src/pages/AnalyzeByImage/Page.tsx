import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Modal,
  Row,
  Space,
  Typography,
  message,
  theme,
} from 'antd';
import {
  DownloadOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AnalysisResults } from './components/AnalysisResults';
import PromptEditor from './components/PromptEditor';
import { ImageQueue } from './components/ImageQueue';
import { ReadyChecklist } from './components/ReadyChecklist';
import { analyzeImageWithProvider } from './services/imageAnalysis';
import { exportToCsv } from './utils/csv';
import { useSettingsStore } from '@/hooks/SettingsStore';
import { getAnalyzeBlockReason, getApiReadyStatus } from './logic/apiReady';
import { mergeQueueItems, type QueueItem } from './logic/queueItem';
import type { AnalysisResult } from './types';

const { Title, Text } = Typography;

export default function Page() {
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [items, setItems] = useState<QueueItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, AnalysisResult | null>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    current: string | null;
  } | null>(null);

  const api = useMemo(() => getApiReadyStatus(settings), [settings]);
  const successCount = useMemo(
    () => Object.values(results).filter(r => r != null).length,
    [results]
  );

  const canRun = api.ready && items.length > 0 && !analyzing;

  const handleAddFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(f.name));
    if (!imageFiles.length) {
      message.warning('未找到可分析的圖片文件');
      return;
    }
    setItems(prev => {
      const { next, skippedNames } = mergeQueueItems(prev, imageFiles);
      if (skippedNames.length) {
        const sample = skippedNames.slice(0, 3).join('、');
        message.warning(
          skippedNames.length === 1
            ? `文件「${sample}」已在隊列中，已跳過`
            : `${skippedNames.length} 個重複文件已跳過（如 ${sample}）`
        );
      }
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleClear = () => {
    Modal.confirm({
      title: '清除隊列？',
      content: '將清空已選圖片與分析結果，此操作不可復原。',
      okText: '清除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setItems([]);
        setResults({});
        setErrors({});
        setProgress(null);
      },
    });
  };

  const handleAnalyze = async () => {
    const block = getAnalyzeBlockReason(settings);
    if (block) {
      message.error(block);
      navigate('/settings');
      return;
    }
    if (items.length === 0) {
      message.warning('請先選擇圖片');
      return;
    }

    setAnalyzing(true);
    setResults({});
    setErrors({});
    setItems(prev => prev.map(i => ({ ...i, status: 'pending' as const })));

    const total = items.length;
    let done = 0;
    setProgress({ done: 0, total, current: items[0]?.file.name ?? null });

    // 使用快照，避免循環中 items 被改寫
    const snapshot = [...items];

    for (const item of snapshot) {
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'running' as const } : i))
      );
      setProgress({ done, total, current: item.file.name });

      try {
        const result = await analyzeImageWithProvider(item.file, settings);
        setResults(prev => ({ ...prev, [item.file.name]: result }));
        setErrors(prev => ({ ...prev, [item.file.name]: undefined }));
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'ok' as const } : i))
        );
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        setResults(prev => ({ ...prev, [item.file.name]: null }));
        setErrors(prev => ({ ...prev, [item.file.name]: msg }));
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'fail' as const } : i))
        );
      }

      done += 1;
      setProgress({ done, total, current: item.file.name });
    }

    setAnalyzing(false);
    setProgress(prev => (prev ? { ...prev, current: null } : null));
    message.success('本輪分析已完成');
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(results);
      message.success('CSV 導出成功');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      message.error(msg);
    }
  };

  return (
    <PageRoot>
      <ScrollArea>
        <PageHeader>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              LLM 圖片分析
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              批量分析圖片，生成標題、描述與關鍵詞，並可導出 CSV 供後續元數據寫入使用。
            </Text>
          </div>
          <Space wrap>
            {api.ready ? (
              <Badge
                status="success"
                text={
                  api.provider === 'openai'
                    ? 'OpenAI · 已配置'
                    : `OpenRouter · 已配置${api.model ? ` · ${api.model}` : ''}`
                }
              />
            ) : (
              <Badge status="warning" text="API 未就緒" />
            )}
          </Space>
        </PageHeader>

        {!api.ready && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="尚未配置可用的 API"
            description={
              <Space direction="vertical" size={8}>
                <Text>{api.reason}</Text>
                <Button
                  type="primary"
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/settings')}
                >
                  前往設置
                </Button>
              </Space>
            }
          />
        )}

        {/* 提示詞：僅改 UI 摺疊，預設內容來自 Settings，不在此改寫 */}
        <PromptEditor readOnly={analyzing} />

        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} lg={15}>
            <ImageQueue
              items={items}
              analyzing={analyzing}
              onAddFiles={handleAddFiles}
              onRemove={handleRemove}
            />
          </Col>
          <Col xs={24} lg={9}>
            <ReadyChecklist
              api={api}
              imageCount={items.length}
              analyzing={analyzing}
              progress={progress}
            />
          </Col>
        </Row>

        <AnalysisResults items={items} results={results} errors={errors} />
      </ScrollArea>

      <ActionBar style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
        <Space>
          <Button onClick={handleClear} disabled={items.length === 0 || analyzing}>
            清除隊列
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
            disabled={successCount === 0 || analyzing}
          >
            導出 CSV
          </Button>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          loading={analyzing}
          disabled={!canRun && !analyzing}
          onClick={handleAnalyze}
        >
          {analyzing ? '分析中…' : '開始分析'}
        </Button>
      </ActionBar>
    </PageRoot>
  );
}

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
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
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
