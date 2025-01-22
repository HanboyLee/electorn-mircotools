import React from 'react'
import styled from 'styled-components'
import { Layout, Menu, Button, Avatar, Typography, theme } from 'antd';

type Props = {
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
const { Header } = Layout
const HeaderContainer = (props: Props) => {
    return (
        <StyledHeader style={props.style}>
            {props.children}
        </StyledHeader>
    )
}

export default HeaderContainer



const StyledHeader = styled(Header)`
  padding: 0;
`;