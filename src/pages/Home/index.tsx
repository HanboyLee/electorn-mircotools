import React from 'react';
import { Typography, Paper, Box, Container } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth={false}>
      <Box sx={{ p: 3, width: '100%' }}>
        <Paper sx={{ p: 4, maxWidth: '100%' }}>
          <Typography variant="h4" gutterBottom>
            歡迎使用 Metadata Desktop
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
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
