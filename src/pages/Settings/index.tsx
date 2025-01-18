import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Form, Input, Switch, Select, Button, message, Radio } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { ThemeType, themeOptions, getStoredTheme, setStoredTheme } from '../../themes';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsForm {
  // defaultImageDirectory: string;
  // defaultCsvDirectory: string;
  autoSave: boolean;
  language: string;
  theme: ThemeType;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm<SettingsForm>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初始化表單時載入已保存的主題
    form.setFieldsValue({
      theme: getStoredTheme(),
    });
  }, []);

  const onFinish = async (values: SettingsForm) => {
    setLoading(true);
    try {
      // 保存主題設置
      setStoredTheme(values.theme);
      // 重新載入頁面以應用新主題
      window.location.reload();

      console.log('保存設置:', values);
      message.success('設置已保存');
    } catch (error) {
      message.error('保存設置失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center" style={{ marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: 24 }} />
          <Title level={2} style={{ margin: 0 }}>
            系統設置
          </Title>
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            defaultImageDirectory: '',
            defaultCsvDirectory: '',
            autoSave: true,
            language: 'zh_TW',
            theme: getStoredTheme(),
          }}
        >
          {/* <Form.Item
              label="默認圖片目錄"
              name="defaultImageDirectory"
              rules={[{ required: true, message: '請輸入默認圖片目錄' }]}
            >
              <Input placeholder="請選擇默認圖片目錄" />
            </Form.Item>

            <Form.Item
              label="默認 CSV 目錄"
              name="defaultCsvDirectory"
              rules={[{ required: true, message: '請輸入默認 CSV 目錄' }]}
            >
              <Input placeholder="請選擇默認 CSV 目錄" />
            </Form.Item> */}

          {/* <Form.Item label="自動保存" name="autoSave" valuePropName="checked">
              <Switch />
            </Form.Item> */}

          <Form.Item label="界面語言" name="language">
            <Select>
              <Option value="zh_TW">繁體中文</Option>
              <Option value="en">English</Option>
              <Option value="ja">日本語</Option>
            </Select>
          </Form.Item>

          <Form.Item label="界面主題" name="theme">
            <Radio.Group optionType="button" buttonStyle="solid">
              {themeOptions.map(option => (
                <Radio.Button key={option.value} value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              保存設置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Title level={3}>關於</Title>
        <Text>
          Metadata Desktop App v1.0.0
          <br />
          一個用於管理圖片元數據的桌面應用程序
        </Text>
      </Card>
    </Space>
  );
};

export default Settings;
