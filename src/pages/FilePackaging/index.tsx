import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Table,
  message,
  Space,
  Input,
  Tooltip,
  Progress,
  Modal,
  Typography,
  Checkbox,
  theme,
} from 'antd';
import {
  FolderOpenOutlined,
  FileZipOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FileGroup, ZipResult } from '../../types/zip';
import { FileIPC, ZipIPC } from '../../constants/ipc';
import styled from 'styled-components';
import { useSettingsStore } from '@/hooks/SettingsStore';

const { Title, Text } = Typography;
const { Search } = Input;

const FilePackagingPage: React.FC = () => {
  // 狀態管理
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [packagingProgress, setPackagingProgress] = useState<number>(0);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [packagingResults, setPackagingResults] = useState<ZipResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  // 選擇目錄
  const handleSelectDirectory = async () => {
    try {
      // 使用 FileIPC.SELECT_DIRECTORY 通道選擇目錄
      const directoryPath = await window.electronAPI[FileIPC.SELECT_DIRECTORY]();

      console.log('選擇的目錄路徑:', directoryPath);

      if (directoryPath) {
        // 設置選擇的目錄
        setSelectedDirectory(directoryPath);

        // 選擇目錄後掃描文件
        await scanDirectory(directoryPath);
      } else {
        console.log('用戶取消了選擇目錄');
      }
    } catch (error) {
      console.error('選擇目錄時出錯:', error);
      message.error('選擇目錄時出錯');
      setLoading(false);
    }
  };

  // 確認打包
  const handleConfirmPackage = () => {
    if (!selectedDirectory) {
      message.error('請先選擇目錄');
      return;
    }

    // 顯示確認對話框
    Modal.confirm({
      title: '確認打包路徑',
      content: (
        <div>
          <p>是否將已選擇的路徑為以名稱對應的打包為zip包，在已選擇的路徑下？</p>
          <p>
            <strong>選擇的路徑：</strong> {selectedDirectory}
          </p>
          <p>
            <strong>找到的文件組：</strong> {fileGroups.length} 個
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          // 開始打包
          setIsPackaging(true);
          message.loading('正在打包文件...', 0);

          // 掃描完成後自動開始打包
          await handleAutoPackage(selectedDirectory);

          message.destroy();
          message.success('打包完成');

          // 重新掃描目錄，更新文件組列表
          await scanDirectory(selectedDirectory);
        } catch (error) {
          console.error('打包時出錯:', error);
          message.destroy();
          message.error('打包時出錯');
        } finally {
          setIsPackaging(false);
        }
      },
      okText: '確認打包',
      cancelText: '取消',
    });
  };

  // 掃描目錄
  const scanDirectory = async (directoryPath: string) => {
    if (!directoryPath) {
      message.error('請選擇有效的目錄');
      return [];
    }

    try {
      setLoading(true);
      console.log('開始掃描目錄:', directoryPath);
      const groups = await window.electronAPI[ZipIPC.SCAN_DIRECTORY](directoryPath);
      console.log('掃描結果:', groups);

      // 確保設置文件組，即使是空數組
      setFileGroups(groups || []);

      if (groups && groups.length > 0) {
        message.success(`找到 ${groups.length} 個文件組`);
        return groups;
      } else {
        message.info('未找到可打包的文件組');
        return [];
      }
    } catch (error) {
      console.error('掃描目錄時出錯:', error);
      message.error('掃描目錄時出錯');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 重新掃描目錄
  const handleRescan = async () => {
    if (selectedDirectory) {
      await scanDirectory(selectedDirectory);
    } else {
      message.warning('請先選擇一個目錄');
    }
  };

  // 處理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 過濾文件組
  const filteredFileGroups = fileGroups.filter(group => {
    if (!searchText) return true;
    return (
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.files.some(file => file.name.toLowerCase().includes(searchText.toLowerCase()))
    );
  });



  // 創建 ZIP 文件
  const createZip = async (fileGroup: FileGroup) => {
    try {
      setIsPackaging(true);
      setPackagingProgress(0);

      // 模擬進度
      const timer = setInterval(() => {
        setPackagingProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await window.electronAPI[ZipIPC.CREATE_ZIP](fileGroup);

      clearInterval(timer);
      setPackagingProgress(100);

      if (result && result.success) {
        message.success(`成功創建 ZIP 文件: ${result.outputPath}`);
        return result;
      } else {
        message.error(`創建 ZIP 文件失敗: ${result?.message || '未知錯誤'}`);
        return null;
      }
    } catch (error) {
      console.error('創建 ZIP 文件時出錯:', error);
      message.error('創建 ZIP 文件時出錯');
      return null;
    } finally {
      setTimeout(() => {
        setIsPackaging(false);
        setPackagingProgress(0);
      }, 500);
    }
  };

  // 處理打包單個文件組
  const handlePackageSingle = async (fileGroup: FileGroup) => {
    const result = await createZip(fileGroup);
    if (result) {
      setPackagingResults([result]);
      setShowResults(true);
    }
  };



  // 自動打包所有文件組
  const handleAutoPackage = async (directoryPath: string) => {
    try {
      console.log('開始自動打包，使用已掃描的文件組');

      // 使用已經掃描到的文件組，而不是重新掃描
      if (!fileGroups || fileGroups.length === 0) {
        console.log('沒有文件組，重新掃描');
        const groups = await window.electronAPI[ZipIPC.SCAN_DIRECTORY](directoryPath);

        if (!groups || groups.length === 0) {
          message.info('未找到可打包的文件組');
          return;
        }

        setFileGroups(groups);
      }

      const results: ZipResult[] = [];

      for (const fileGroup of fileGroups) {
        console.log('正在打包文件組:', fileGroup.name);
        const result = await createZip(fileGroup);
        if (result) {
          results.push(result);
        }
      }

      if (results.length > 0) {
        setPackagingResults(results);
        setShowResults(true);
        message.success(`成功創建 ${results.length} 個 ZIP 文件`);
      } else {
        message.warning('沒有成功創建任何 ZIP 文件');
      }

      return results;
    } catch (error) {
      console.error('自動打包時出錯:', error);
      message.error('自動打包時出錯');
      throw error;
    }
  };

  // 打開文件所在目錄
  const openFileLocation = async (path: string) => {
    try {
      await window.electronAPI[ZipIPC.OPEN_ITEM](path, false);
    } catch (error) {
      console.error('打開文件位置時出錯:', error);
      message.error('打開文件位置時出錯');
    }
  };

  // 表格列定義
  const columns = [
    {
      title: '文件組名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '文件數量',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      render: (count: number) => <span>{count} 個文件</span>,
    },
    {
      title: '文件類型',
      key: 'fileTypes',
      width: 200,
      render: (record: FileGroup) => {
        const extensions = [...new Set(record.files.map(file => file.extension))];
        return (
          <FileTypes>
            {extensions.map(ext => (
              <FileType key={ext}>{ext}</FileType>
            ))}
          </FileTypes>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (record: FileGroup) => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                Modal.info({
                  title: `文件組 "${record.name}" 詳情`,
                  content: (
                    <div>
                      <p>文件數量: {record.count}</p>
                      <p>源目錄: {record.basePath}</p>
                      <FileList>
                        <p>文件列表:</p>
                        <ul>
                          {record.files.map((file, index) => (
                            <li key={index}>
                              {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </li>
                          ))}
                        </ul>
                      </FileList>
                    </div>
                  ),
                  width: 500,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="打包">
            <Button
              type="primary"
              icon={<FileZipOutlined />}
              onClick={() => handlePackageSingle(record)}
              disabled={isPackaging}
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
          <Title level={4}>文件打包</Title>
          <Actions>
            <Button
              type="primary"
              icon={<FolderOpenOutlined />}
              onClick={handleSelectDirectory}
              disabled={isPackaging || loading}
              loading={loading}
            >
              選擇目錄
            </Button>
            {selectedDirectory && (
              <>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRescan}
                  disabled={isPackaging || loading}
                  loading={loading}
                >
                  重新掃描
                </Button>
                <Button
                  type="primary"
                  icon={<FileZipOutlined />}
                  onClick={handleConfirmPackage}
                  disabled={isPackaging || loading}
                  loading={isPackaging}
                >
                  確認打包
                </Button>
              </>
            )}
          </Actions>
        </Header>

        {selectedDirectory && (
          <DirectoryInfo>
            <Text strong>當前目錄: </Text>
            <Text>{selectedDirectory}</Text>
          </DirectoryInfo>
        )}

        {selectedDirectory && (
          <SearchBar>
            <Search
              placeholder="搜索文件名或擴展名"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              disabled={isPackaging}
            />
            <Text type="secondary">
              找到 {filteredFileGroups.length} 個文件組，共 {fileGroups.length} 個
            </Text>
          </SearchBar>
        )}

        {isPackaging && (
          <ProgressContainer>
            <Progress percent={packagingProgress} status="active" />
            <Text type="secondary">正在創建 ZIP 文件，請稍候...</Text>
          </ProgressContainer>
        )}

        <StyledTable
          columns={columns}
          dataSource={filteredFileGroups}
          rowKey="name"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: selectedDirectory ? '未找到文件組' : '請選擇一個目錄' }}
        />
      </StyledCard>

      <Modal
        title="打包結果"
        open={showResults}
        onCancel={() => setShowResults(false)}
        footer={[
          <Button key="close" onClick={() => setShowResults(false)}>
            關閉
          </Button>,
        ]}
        width={600}
      >
        <ResultsList>
          {packagingResults.map((result, index) => (
            <ResultCard key={index}>
              <ResultHeader>
                <div>
                  <Text strong>{result.groupName}.zip</Text>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    包含 {result.fileCount} 個文件
                  </Text>
                </div>
                <Button type="link" onClick={() => openFileLocation(result.outputPath)}>
                  打開位置
                </Button>
              </ResultHeader>
              <ResultInfo>
                <p>輸出路徑: {result.outputPath}</p>
                <p>源目錄: {result.sourceDirectory}</p>
              </ResultInfo>
            </ResultCard>
          ))}
        </ResultsList>
      </Modal>
    </Container>
  );
};

export default FilePackagingPage;

// 使用 styled-components 定義樣式
const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

const StyledCard = styled(Card)`
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

const DirectoryInfo = styled.div`
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: ${props => props.theme.colorBgContainer};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.colorBorderSecondary};
`;

const SearchBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressContainer = styled.div`
  margin: 16px 0;
  text-align: center;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: ${props => props.theme.colorBgContainer};
  }
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ResultCard = styled(Card)`
  margin-bottom: 12px;
  border: 1px solid ${props => props.theme.colorBorderSecondary};
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ResultInfo = styled.div`
  p {
    margin: 4px 0;
  }
`;

const FileTypes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const FileType = styled.span`
  padding: 2px 6px;
  background-color: ${props => props.theme.colorPrimaryBg};
  color: ${props => props.theme.colorPrimaryText};
  border-radius: 4px;
  font-size: 12px;
`;

const FileList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;

  ul {
    padding-left: 20px;
    margin: 8px 0;
  }

  li {
    margin-bottom: 4px;
  }
`;
