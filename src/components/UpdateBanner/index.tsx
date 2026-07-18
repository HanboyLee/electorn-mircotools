import React from 'react';
import { Alert, App, Button, Space, Typography } from 'antd';
import { CloudDownloadOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { getBannerIntro, UPDATE_DISMISS_DAYS } from '@/utils/updateUx';
import UpdateProgressBlock from '@/components/UpdateFlow/UpdateProgressBlock';
import { runUpdateFlow } from '@/components/UpdateFlow/runUpdateFlow';

const { Text } = Typography;

/**
 * 全局更新横幅：仅在有可下载的新版本时展示（可稍后 N 天）
 */
const UpdateBanner: React.FC = () => {
  const { message } = App.useApp();
  const {
    bannerVisible,
    checkResult,
    downloading,
    progress,
    canUpdate,
    lastError,
    platform,
    currentVersion,
    downloadAndInstall,
    dismissBanner,
    setLastError,
  } = useAppUpdate();

  if (!bannerVisible || !canUpdate || !checkResult?.hasUpdate) {
    return null;
  }

  const latest = checkResult.latestVersion ?? '';
  const intro = getBannerIntro(currentVersion || checkResult.currentVersion, latest);

  const handleUpdate = () => {
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
    <BannerWrap role="status" aria-live="polite">
      <Alert
        type="info"
        showIcon
        banner
        message={
          <BannerRow>
            <Space direction="vertical" size={6} style={{ flex: 1, minWidth: 0 }}>
              <Text strong>
                有新版本 v{latest}
                {checkResult.currentVersion ? `（当前 v${checkResult.currentVersion}）` : ''}
              </Text>
              {!downloading && !lastError && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {intro}
                </Text>
              )}
              <UpdateProgressBlock
                compact
                downloading={downloading}
                progress={progress}
                lastError={lastError}
                onRetry={handleRetry}
              />
            </Space>
            <Space wrap>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                loading={downloading}
                disabled={downloading}
                onClick={handleUpdate}
                aria-label="立即更新"
              >
                立即更新
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={dismissBanner}
                disabled={downloading}
                aria-label="稍后提醒"
                title={`${UPDATE_DISMISS_DAYS} 天内不再自动提醒此版本`}
              >
                稍后
              </Button>
            </Space>
          </BannerRow>
        }
      />
    </BannerWrap>
  );
};

export default UpdateBanner;

const BannerWrap = styled.div`
  margin-bottom: 12px;

  .ant-alert {
    border-radius: 8px;
  }
`;

const BannerRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;
