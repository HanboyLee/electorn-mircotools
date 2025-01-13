import React, { useState } from 'react';
import { Typography, Paper, Box, Container, Button, TextField, Alert } from '@mui/material';
import { FileIPC } from '../../constants/ipc';

interface Result {
  success: boolean;
  message: string;
}

const Home: React.FC = () => {
  const [testContent, setTestContent] = useState('');
  const [testFilePath, setTestFilePath] = useState('/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/image_analysis_2024-12-02.csv');
  const [result, setResult] = useState<Result | null>(null);
  
  console.log(window.electronAPI,FileIPC,'window.electronAPI;')
  const handleTestFileWrite = async () => {
    try {
      const api = window.electronAPI;
      await api[FileIPC.WRITE](testFilePath, testContent);
      setResult({ success: true, message: '文件寫入成功！' });
    } catch (error) {
      setResult({ success: false, message: `文件寫入失敗：${error.message}` });
    }
  };

  const handleTestFileRead = async () => {
    try {
      const api = window.electronAPI;
      const content = await api[FileIPC.READ](testFilePath);
      setTestContent(content);
      setResult({ success: true, message: '文件讀取成功！' });
    } catch (error) {
      setResult({ success: false, message: `文件讀取失敗：${error.message}` });
    }
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ p: 3, width: '100%' }}>
        <Paper sx={{ p: 4, maxWidth: '100%' }}>
          <Typography variant="h4" gutterBottom>
            API 測試面板
          </Typography>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="文件路徑"
              value={testFilePath}
              onChange={(e) => setTestFilePath(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="文件內容"
              multiline
              rows={4}
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              margin="normal"
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTestFileWrite}
              >
                測試寫入文件
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTestFileRead}
              >
                測試讀取文件
              </Button>
            </Box>

            {result && (
              <Alert 
                severity={result.success ? "success" : "error"}
                sx={{ mt: 2 }}
              >
                {result.message}
              </Alert>
            )}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              功能說明
            </Typography>
            <Typography variant="body1" gutterBottom>
              這是一個用於管理圖片 metadata 的桌面應用程序。
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              請使用左側菜單選擇所需功能：
            </Typography>
            <ul>
              <li>
                <Typography variant="body1">
                  CSV 驗證：檢查 CSV 文件格式是否符合要求
                </Typography>
              </li>
            </ul>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
