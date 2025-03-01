import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, Space, Tooltip, Alert, theme } from 'antd';
import { EditOutlined, SaveOutlined, UndoOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/hooks/SettingsStore';
import { initialSettings } from '@/hooks/SettingsStore/index';

const { TextArea } = Input;
const { Title, Text } = Typography;

const PromptEditor: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { token } = theme.useToken();

  // 初始化提示詞
  useEffect(() => {
    setTempPrompt(settings.analysisPrompt || initialSettings.analysisPrompt);
  }, [settings.analysisPrompt]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateSettings({ analysisPrompt: tempPrompt });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setTempPrompt(settings.analysisPrompt || initialSettings.analysisPrompt);
    setIsEditing(false);
  };

  const handleReset = async () => {
    setTempPrompt(initialSettings.analysisPrompt);
    if (!isEditing) {
      await updateSettings({ analysisPrompt: initialSettings.analysisPrompt });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>分析提示詞設置</Title>
          <Tooltip title="這個提示詞將用於指導 AI 如何分析圖片並生成結果">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      }
      size="small"
    >
      {showSuccess && (
        <Alert
          message="提示詞已更新"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {isEditing ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            value={tempPrompt}
            onChange={(e) => setTempPrompt(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder="請輸入提示詞"
            style={{ color: 'inherit' }}
          />
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              確認修改
            </Button>
            <Button icon={<UndoOutlined />} onClick={handleCancel}>
              取消
            </Button>
            <Button type="link" onClick={handleReset}>
              恢復默認
            </Button>
          </Space>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ 
            padding: '8px 12px', 
            background: token.colorBgElevated, 
            borderRadius: '4px',
            border: `1px solid ${token.colorBorder}`,
            minHeight: '60px',
            color: token.colorText
          }}>
            <Text style={{ color: token.colorText }}>{settings.analysisPrompt || initialSettings.analysisPrompt}</Text>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              編輯提示詞
            </Button>
            <Button type="link" onClick={handleReset}>
              恢復默認
            </Button>
          </Space>
        </Space>
      )}
    </Card>
  );
};

export default PromptEditor;
