import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Space, Tooltip, Typography, theme } from 'antd';
import { EditOutlined, InfoCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSettingsStore } from '@/hooks/SettingsStore';
import { initialSettings } from '@/hooks/SettingsStore/index';

const { TextArea } = Input;
const { Text } = Typography;

export interface PromptEditorProps {
  /** 分析進行中：只讀，不可編輯 */
  readOnly?: boolean;
}

/**
 * 分析提示詞 UI（摺疊 / 展開）
 * - 內容與「恢復默認」一律讀寫 `settings.analysisPrompt` / `initialSettings.analysisPrompt`
 * - **禁止**在本組件或設計改版中修改預設提示詞字串本身
 */
const PromptEditor: React.FC<PromptEditorProps> = ({ readOnly = false }) => {
  const { settings, updateSettings } = useSettingsStore();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { token } = theme.useToken();

  const currentPrompt = settings.analysisPrompt || initialSettings.analysisPrompt || '';

  useEffect(() => {
    setTempPrompt(currentPrompt);
  }, [currentPrompt]);

  const handleEdit = () => {
    if (readOnly) return;
    setExpanded(true);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateSettings({ analysisPrompt: tempPrompt });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setTempPrompt(currentPrompt);
    setIsEditing(false);
  };

  const handleReset = async () => {
    // 恢復為 Settings 中既有預設字串，不改動 initialSettings 定義
    setTempPrompt(initialSettings.analysisPrompt);
    if (!isEditing) {
      await updateSettings({ analysisPrompt: initialSettings.analysisPrompt });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const summary = currentPrompt.replace(/\s+/g, ' ').trim();

  return (
    <Card style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
      <Header>
        <Space size={6}>
          <Text strong>分析提示詞</Text>
          <Tooltip title="這個提示詞將用於指導 AI 如何分析圖片並生成結果（預設內容不因本頁改版而變更）">
            <InfoCircleOutlined style={{ color: token.colorPrimary }} />
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 12 }}>
            指導 AI 如何生成結果
          </Text>
        </Space>
        <Button
          type="link"
          size="small"
          onClick={() => {
            if (isEditing) return;
            setExpanded(v => !v);
          }}
          disabled={isEditing}
        >
          {expanded ? '收起' : '展開編輯'}
        </Button>
      </Header>

      {showSuccess && (
        <Alert
          message="提示詞已更新"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 12 }}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {!expanded && (
        <Summary title={summary} style={{ background: token.colorFillAlter, borderColor: token.colorBorder }}>
          <Text type="secondary" ellipsis>
            {summary}
          </Text>
        </Summary>
      )}

      {expanded && (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {isEditing && !readOnly ? (
            <>
              <TextArea
                value={tempPrompt}
                onChange={e => setTempPrompt(e.target.value)}
                autoSize={{ minRows: 4, maxRows: 10 }}
                placeholder="請輸入提示詞"
              />
              <Space wrap>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  保存
                </Button>
                <Button icon={<UndoOutlined />} onClick={handleCancel}>
                  取消
                </Button>
                <Button type="link" onClick={handleReset}>
                  恢復默認
                </Button>
              </Space>
            </>
          ) : (
            <>
              <ReadonlyBox style={{ background: token.colorFillAlter, borderColor: token.colorBorder }}>
                <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{currentPrompt}</Text>
              </ReadonlyBox>
              <Space wrap>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  disabled={readOnly}
                >
                  編輯提示詞
                </Button>
                <Button type="link" onClick={handleReset} disabled={readOnly}>
                  恢復默認
                </Button>
              </Space>
              {readOnly && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  分析進行中，提示詞暫時不可修改
                </Text>
              )}
            </>
          )}
        </Space>
      )}
    </Card>
  );
};

export default PromptEditor;

const Card = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const Summary = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 8px 10px;
  overflow: hidden;
`;

const ReadonlyBox = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
  max-height: 160px;
  overflow: auto;
`;
