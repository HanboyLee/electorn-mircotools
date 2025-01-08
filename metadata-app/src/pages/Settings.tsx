import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          設置
        </Typography>
        <Typography variant="body1">
          在這裡可以管理應用程序的設置。
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;
