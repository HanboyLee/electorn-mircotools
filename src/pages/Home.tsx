import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          歡迎使用 Metadata Desktop
        </Typography>
        <Typography variant="body1">
          這是一個用於管理圖片 metadata 的桌面應用程序。
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home;
