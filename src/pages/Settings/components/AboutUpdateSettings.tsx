import React from 'react';
import { App, Button, Space, Typography, theme } from 'antd';
import { CloudDownloadOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { getSettingsIntro } from '@/utils/updateUx';
import UpdateProgressBlock from '@/components/UpdateFlow/UpdateProgressBlock';
import { runUpdateFlow } from '@/components/UpdateFlow/runUpdateFlow';

const { Text, Paragraph } = Typography;

/**
 * 设置页「关于与更新」：检查更新；有新版本时才显示「立即更新」
 */
const AboutUpdateSettings: React.FC = () => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const {
    currentVersion,
    platform,
    checkResult,
    checking,
    downloading,
    progress,
    canUpdate,
    lastError,
    checkForUpdates,
    downloadAndInstall,
    setLastError,
  } = useAppUpdate();

  const handleCheck = async () => {
    const result = await checkForUpdates();
    if (!result) {
      message.error('检查更新失败');
      return;
    }
    if (!result.success) {
      message.error(result.error || '检查更新失败，请稍后重试');
      return;
    }
    if (result.hasUpdate && result.downloadUrl) {
      message.info(`发现新版本 v${result.latestVersion}，可点击「立即更新」`);
    } else if (result.hasUpdate && !result.downloadUrl) {
      message.warning(result.error || '发现新版本，但暂无当前平台安装包');
    } else {
      message.success('当前已是最新版本');
    }
  };

  const handleUpdate = () => {
    if (!canUpdate) {
      message.warning('当前没有可安装的更新');
      return;
    }
    void runUpdateFlow({
      platform,
      downloadAndInstall,
      message,
      onError: err => setLastError(err),
      onSuccess: () => setLastError(null),
    });
  };

  const handleRetry = () => {
    void runUpdateFlow({
      platform,
      downloadAndInstall,
      message,
      confirmBefore: false,
      onError: err => setLastError(err),
      onSuccess: () => setLastError(null),
    });
  };

  return (
    <Wrap>
      <Space align="start" size={12} style={{ marginBottom: 16 }}>
        <InfoCircleOutlined style={{ fontSize: 20, marginTop: 2 }} />
        <div>
          <Text strong style={{ fontSize: 15 }}>
            关于与更新
          </Text>
          <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
            {getSettingsIntro()}
          </Paragraph>
        </div>
      </Space>

      <InfoRow>
        <Text type="secondary">当前版本</Text>
        <Text strong>v{currentVersion || '—'}</Text>
      </InfoRow>

      {checkResult?.success && checkResult.latestVersion && (
        <InfoRow>
          <Text type="secondary">最新版本</Text>
          <Text strong type={checkResult.hasUpdate ? 'warning' : 'success'}>
            v{checkResult.latestVersion}
            {checkResult.hasUpdate ? '（有可用更新）' : '（已是最新）'}
          </Text>
        </InfoRow>
      )}

      {canUpdate && checkResult?.releaseNotes && (
        <NotesBox style={{ background: token.colorFillAlter }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            更新说明
          </Text>
          <NotesText>{checkResult.releaseNotes.slice(0, 800)}</NotesText>
        </NotesBox>
      )}

      <div style={{ marginBottom: 16 }}>
        <UpdateProgressBlock
          downloading={downloading}
          progress={progress}
          lastError={lastError}
          onRetry={canUpdate ? handleRetry : undefined}
        />
      </div>

      <Space wrap>
        <Button
          icon={<ReloadOutlined />}
          loading={checking}
          onClick={handleCheck}
          disabled={downloading}
        >
          检查更新
        </Button>
        {canUpdate && (
          <Button
            type="primary"
            icon={<CloudDownloadOutlined />}
            loading={downloading}
            disabled={downloading}
            onClick={handleUpdate}
          >
            立即更新
          </Button>
        )}
      </Space>
    </Wrap>
  );
};

export default AboutUpdateSettings;

const Wrap = styled.div`
  padding-top: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  min-height: 28px;
`;

const NotesBox = styled.div`
  margin: 8px 0 16px;
  padding: 12px;
  border-radius: 8px;
  max-height: 160px;
  overflow: auto;
`;

const NotesText = styled.pre`
  margin: 8px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
`;
