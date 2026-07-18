import React from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Space, theme } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  PictureOutlined,
  SettingOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface FunctionButton {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const FunctionButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const functionButtons: FunctionButton[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '系統調試',
      path: '/',
    },
    {
      key: 'csv',
      icon: <FileTextOutlined />,
      label: '元數據寫入',
      path: '/csv-validation',
    },
    {
      key: 'image',
      icon: <PictureOutlined />,
      label: 'LLM 圖片分析',
      path: '/image-analyze',
    },
    {
      key: 'packaging',
      icon: <FileZipOutlined />,
      label: '文件打包',
      path: '/file-packaging',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設置',
      path: '/settings',
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <ButtonContainer>
      <Space size={8}>
        {functionButtons.map((button) => (
          <Tooltip key={button.key} title={button.label} placement="bottom">
            <StyledButton
              type="text"
              icon={button.icon}
              onClick={() => handleNavigate(button.path)}
              active={location.pathname === button.path}
              themecolor={token.colorPrimary}
              hoverbg={token.colorBgTextHover}
            />
          </Tooltip>
        ))}
      </Space>
    </ButtonContainer>
  );
};

export default FunctionButtons;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
`;

interface StyledButtonProps {
  active: boolean;
  themecolor: string;
  hoverbg: string;
}

const StyledButton = styled(Button)<StyledButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.3s;
  
  color: ${props => props.active ? props.themecolor : 'inherit'};
  background-color: ${props => props.active ? props.hoverbg : 'transparent'};
  
  &:hover {
    color: ${props => props.themecolor};
    background-color: ${props => props.hoverbg};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;
