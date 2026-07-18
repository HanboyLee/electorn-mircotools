import React from 'react';
import CsvValidator from './CsvValidator';
import styled from 'styled-components';

const CsvValidation: React.FC = () => {
  return (
    <Container>
      <CsvValidator />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
`;

export default CsvValidation;
