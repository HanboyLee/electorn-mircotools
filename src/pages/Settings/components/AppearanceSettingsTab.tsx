import React, { useEffect, useMemo, useState } from 'react';
import { Form, Select, App, theme } from 'antd';
import { isEqual } from 'lodash';
import styled from 'styled-components';
import { useSettingsStore } from '@/hooks/SettingsStore';
import type { ThemeType } from '@/themes';
import ThemePreviewCards from './ThemePreviewCards';
import TabSaveBar from './TabSaveBar';

const { Option } = Select;

export interface AppearanceSettingsTabProps {
  onDirtyChange?: (dirty: boolean) => void;
}

type AppearanceValues = {
  language: string;
  theme: ThemeType;
};

function pickAppearance(settings: { language?: string; theme?: string }): AppearanceValues {
  return {
    language: settings.language || 'zh_TW',
    theme: (settings.theme as ThemeType) || 'light',
  };
}

const AppearanceSettingsTab: React.FC<AppearanceSettingsTabProps> = ({ onDirtyChange }) => {
  const [form] = Form.useForm<AppearanceValues>();
  const { settings, updateSettings } = useSettingsStore();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const synced = useMemo(
    () => pickAppearance(settings),
    // only re-sync when appearance fields change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.language, settings.theme]
  );
  const watched = Form.useWatch([], form) as AppearanceValues | undefined;

  const dirty = useMemo(() => {
    if (!watched) return false;
    return !isEqual(
      {
        language: watched.language ?? synced.language,
        theme: watched.theme ?? synced.theme,
      },
      synced
    );
  }, [watched, synced]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    form.setFieldsValue(synced);
  }, [form, synced]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await updateSettings({
        language: values.language,
        theme: values.theme,
      });
      message.success('外觀設置已保存');
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      console.error('保存外觀設置失敗:', error);
      message.error('保存外觀設置失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(synced);
  };

  return (
    <Wrap>
      <SectionDesc style={{ color: token.colorTextSecondary }}>
        調整界面語言與主題風格。
      </SectionDesc>
      <Card style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}>
        <Form form={form} layout="vertical" initialValues={synced}>
          <Form.Item label="界面語言" name="language">
            <Select>
              <Option value="zh_TW">繁體中文</Option>
              <Option value="zh_CN">简体中文</Option>
              <Option value="en">English</Option>
              <Option value="ja">日本語</Option>
            </Select>
          </Form.Item>

          <Form.Item label="界面主題" name="theme" style={{ marginBottom: 0 }}>
            <ThemePreviewCards />
          </Form.Item>
        </Form>
      </Card>

      <TabSaveBar dirty={dirty} loading={loading} onSave={handleSave} onReset={handleReset} />
    </Wrap>
  );
};

export default AppearanceSettingsTab;

const Wrap = styled.div`
  max-width: 720px;
`;

const SectionDesc = styled.p`
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 14px;
`;

const Card = styled.div`
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;
