import styled from 'styled-components';
import { Input } from 'antd';

export const Password = styled(Input.Password)`
  .ant-input-group-addon {
    padding: 0;
    &>[type="button"] {
      height: auto;
    }
  }
`;
