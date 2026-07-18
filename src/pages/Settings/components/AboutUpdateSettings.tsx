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
 * 設置頁「關於與更新」：檢查更新；有新版本時才顯示「立即更新」。
 * 本 Tab 無表單保存欄。
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
    // 頁內已展示版本與更新按鈕，不開全局頂部橫幅（避免重複）
    const result = await checkForUpdates({ showBanner: false });
    if (!result) {
      message.error('檢查更新失敗');
      return;
    }
    if (!result.success) {
      message.error(result.error || '檢查更新失敗，請稍後重試');
      return;
    }
    if (result.hasUpdate && result.downloadUrl) {
      message.info(`發現新版本 v${result.latestVersion}，可點擊「立即更新」`);
    } else if (result.hasUpdate && !result.downloadUrl) {
      message.warning(result.error || '發現新版本，但暫無當前平台安裝包');
    } else {
      message.success('當前已是最新版本');
    }
  };

  const handleUpdate = () => {
    if (!canUpdate) {
      message.warning('當前沒有可安裝的更新');
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
        <InfoCircleOutlined style={{ fontSize: 20, marginTop: 2, color: token.colorPrimary }} />
        <div>
          <Text strong style={{ fontSize: 15 }}>
            關於與更新
          </Text>
          <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
            {getSettingsIntro()}
          </Paragraph>
        </div>
      </Space>

      <InfoRow>
        <Text type="secondary">當前版本</Text>
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
            更新說明
          </Text>
          <NotesText>{checkResult.releaseNotes.slice(0, 4000)}</NotesText>
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
          檢查更新
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
