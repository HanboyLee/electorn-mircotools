import React from 'react';
import { Form, Select, Radio, Divider } from 'antd';
import { themeOptions } from '../../../themes';

const { Option } = Select;

const BasicSettings: React.FC = () => {
  return (
    <>
      <Divider orientation="left">基本設置</Divider>

      <Form.Item label="界面語言" name="language">
        <Select>
          <Option value="zh_TW">繁體中文</Option>
          <Option value="zh_CN">简体中文</Option>
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
    </>
  );
};

export default BasicSettings;
