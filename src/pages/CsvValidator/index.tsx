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
  align-items: center;
  justify-content: center;
  /* height:100%; */
  height:100vh;
`;

export default CsvValidation;
