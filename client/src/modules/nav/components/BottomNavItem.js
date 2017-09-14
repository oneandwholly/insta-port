import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectActive } from '../selectors';
import { createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

class BottomNavItem extends Component {
    render() {
        let renderIcon = this.props.icon;

        if (this.props.name === this.props.active) {
            renderIcon = this.props.activeIcon;
        }
        return (
            <StyledLink to={this.props.path}>
                <IconImg alt='' src={renderIcon} />
            </StyledLink>
        );
    }
}

/* Styled Components */
const StyledLink = styled(Link)`
    display: flex;
    flex-direction: column; 
    justify-content: center;
`;

const IconImg = styled.img`
    height: 26px;
    width: 30px;
`;

export default connect(
    createStructuredSelector({
        active: selectActive
    })
)(BottomNavItem);
