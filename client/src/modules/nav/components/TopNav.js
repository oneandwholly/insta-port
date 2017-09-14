import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { selectTopNav } from '../selectors';
import styled from 'styled-components';

class TopNav extends Component {
    render() {
        if (this.props.visibility) {
            return (
                <ParentDiv>
                    <FixedDiv>
                    </FixedDiv>
                </ParentDiv>
            );
        }
        return <div></div>;
    }
}

/* Styled Components*/
const ParentDiv = styled.div`
    height: 44px;
    width: 100%;
`;

const FixedDiv = styled.div`
    position: fixed; 
    height: inherit;
    width: inherit;
    background-color: #fff;
    border-bottom: 1px double #e7e7e7;
`;

export default connect(
    createStructuredSelector({
        visibility: selectTopNav
    })
)(TopNav);