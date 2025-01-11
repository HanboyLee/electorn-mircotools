import React from 'react';
import { Container, Box } from '@mui/material';
import CsvValidator from './CsvValidator';

const CsvValidation: React.FC = () => {
  return (
    <Container maxWidth={false}>
      <Box sx={{ p: 3, width: '100%' }}>
        <CsvValidator />
      </Box>
    </Container>
  );
};

export default CsvValidation;
