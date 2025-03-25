import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tooltip,
  Modal,
  Typography,
  Empty,
  message,
  Popconfirm,
} from 'antd';
import {
  FileZipOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ZipHistory } from '../../types/zip';
import { ZipIPC } from '../../constants/ipc';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { confirm } = Modal;

// 使用 styled-components 定義樣式
const Container = styled.div`
  padding: 20px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledTable = styled(Table)`
  margin-top: 16px;
`;

const StyledEmpty = styled(Empty)`
  margin: 40px 0;
`;

const FileNameCell = styled.div`
  display: flex;
  align-items: center;
`;

const FileIcon = styled(FileZipOutlined)`
  margin-right: 8px;
  font-size: 18px;
  color: #1890ff;
`;

const FileName = styled.span`
  font-weight: 500;
`;

const DetailContainer = styled.div`
  padding: 8px 0;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  strong {
    width: 100px;
    display: inline-block;
  }
`;

const DetailFiles = styled.div`
  margin-top: 16px;
`;

const FilesList = styled.ul`
  max-height: 200px;
  overflow-y: auto;
  padding-left: 20px;
  margin-top: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px 16px;
`;

const PackagingHistoryPage: React.FC = () => {
  // 狀態管理
  const [historyData, setHistoryData] = useState<ZipHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<ZipHistory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // 獲取歷史記錄
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const history = await window.electronAPI[ZipIPC.GET_PACKAGE_HISTORY]();
      setHistoryData(history || []);
    } catch (error) {
      console.error('獲取歷史記錄時出錯:', error);
      message.error('獲取歷史記錄時出錯');
    } finally {
      setLoading(false);
    }
  };

  // 組件掛載時獲取歷史記錄
  useEffect(() => {
    fetchHistory();
  }, []);

  // 打開文件所在目錄
  const openFileLocation = async (path: string) => {
    try {
      await window.electronAPI[ZipIPC.OPEN_ITEM](path, false);
    } catch (error) {
      console.error('打開文件位置時出錯:', error);
      message.error('打開文件位置時出錯');
    }
  };

  // 打開源目錄
  const openSourceDirectory = async (path: string) => {
    try {
      await window.electronAPI[ZipIPC.OPEN_ITEM](path, true);
    } catch (error) {
      console.error('打開源目錄時出錯:', error);
      message.error('打開源目錄時出錯');
    }
  };

  // 清空歷史記錄
  const handleClearHistory = () => {
    confirm({
      title: '確定要清空所有歷史記錄嗎？',
      icon: <ExclamationCircleOutlined />,
      content: '此操作不可恢復，但不會刪除實際的 ZIP 文件。',
      okText: '確定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const success = await window.electronAPI[ZipIPC.CLEAR_HISTORY]();
          if (success) {
            message.success('歷史記錄已清空');
            setHistoryData([]);
          } else {
            message.error('清空歷史記錄失敗');
          }
        } catch (error) {
          console.error('清空歷史記錄時出錯:', error);
          message.error('清空歷史記錄時出錯');
        }
      },
    });
  };

  // 顯示詳情
  const showDetail = (record: ZipHistory) => {
    setSelectedHistory(record);
    setShowDetailModal(true);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 表格列定義
  const columns = [
    {
      title: 'ZIP 文件',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ZipHistory) => (
        <FileNameCell>
          <FileIcon />
          <FileName>{text}</FileName>
        </FileNameCell>
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date: string) => <span>{formatDate(date)}</span>,
    },
    {
      title: '文件數量',
      dataIndex: 'fileCount',
      key: 'fileCount',
      width: 100,
      render: (count: number) => <span>{count} 個文件</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (record: ZipHistory) => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button type="text" icon={<InfoCircleOutlined />} onClick={() => showDetail(record)} />
          </Tooltip>
          <Tooltip title="打開文件位置">
            <Button
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={() => openFileLocation(record.outputPath)}
            />
          </Tooltip>
          <Tooltip title="打開源目錄">
            <Button
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={() => openSourceDirectory(record.sourceDirectory)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <StyledCard>
        <Header>
          <Title level={4}>打包歷史</Title>
          <Actions>
            <Button icon={<ReloadOutlined />} onClick={fetchHistory} disabled={loading}>
              刷新
            </Button>
            <Popconfirm
              title="確定要清空所有歷史記錄嗎？"
              description="此操作不可恢復，但不會刪除實際的 ZIP 文件。"
              onConfirm={handleClearHistory}
              okText="確定"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={loading || historyData.length === 0}
              >
                清空記錄
              </Button>
            </Popconfirm>
          </Actions>
        </Header>

        {historyData.length === 0 ? (
          <StyledEmpty description="暫無打包歷史記錄" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <StyledTable
            columns={columns}
            dataSource={historyData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </StyledCard>

      <Modal
        title="打包詳情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            關閉
          </Button>,
        ]}
        width={600}
      >
        {selectedHistory && (
          <DetailContainer>
            <DetailItem>
              <Text strong>ZIP 文件名:</Text>
              <Text>{selectedHistory.name}</Text>
            </DetailItem>
            <DetailItem>
              <Text strong>創建時間:</Text>
              <Text>{formatDate(selectedHistory.date)}</Text>
            </DetailItem>
            <DetailItem>
              <Text strong>文件數量:</Text>
              <Text>{selectedHistory.fileCount} 個文件</Text>
            </DetailItem>
            <DetailItem>
              <Text strong>輸出路徑:</Text>
              <Text>{selectedHistory.outputPath}</Text>
              <Button
                type="link"
                size="small"
                onClick={() => openFileLocation(selectedHistory.outputPath)}
              >
                打開位置
              </Button>
            </DetailItem>
            <DetailItem>
              <Text strong>源目錄:</Text>
              <Text>{selectedHistory.sourceDirectory}</Text>
              <Button
                type="link"
                size="small"
                onClick={() => openSourceDirectory(selectedHistory.sourceDirectory)}
              >
                打開目錄
              </Button>
            </DetailItem>
            <DetailFiles>
              <Text strong>包含的文件:</Text>
              <FilesList>
                {selectedHistory.originalFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </FilesList>
            </DetailFiles>
          </DetailContainer>
        )}
      </Modal>
    </Container>
  );
};

export default PackagingHistoryPage;
