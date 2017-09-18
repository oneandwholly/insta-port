import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectBottomNav } from '../selectors';
import styled from 'styled-components';
import BottomNavItem from './BottomNavItem';
import auth from '../../auth';
import users from '../../users';

import home_icon  from '../../../assets/icons/home-o.png';
import explore_icon  from '../../../assets/icons/search-o.png';
import create_icon  from '../../../assets/icons/camera-o.png';
import activity_icon  from '../../../assets/icons/heart-o.png';
import profile_icon  from '../../../assets/icons/user-o.png';

import home_icon_active  from '../../../assets/icons/home.png';
import explore_icon_active  from '../../../assets/icons/search.png';
import create_icon_active  from '../../../assets/icons/camera.png';
import activity_icon_active  from '../../../assets/icons/heart.png';
import profile_icon_active  from '../../../assets/icons/user.png';

class BottomNav extends Component {
    render() {
        if (this.props.visibility) {
            return (
                <ParentDiv>
                    <FixedDiv>
                        <BottomNavItem name='home' path='/' icon={home_icon} activeIcon={home_icon_active} />
                        <BottomNavItem name='explore' path='/' icon={explore_icon} activeIcon={explore_icon_active} />
                        <BottomNavItem name='create' path='/create/post' icon={create_icon} activeIcon={create_icon_active} />
                        <BottomNavItem name='activity' path='/' icon={activity_icon} activeIcon={activity_icon_active} />
                        <BottomNavItem name='profile' path={`/${this.props.authUsername}`} icon={profile_icon} activeIcon={profile_icon_active} />
                    </FixedDiv>
                </ParentDiv>
            );
        }
        return <div></div>
    }
}

/* Styled Components*/
const ParentDiv = styled.div`
    height: 44px;
    width: 100%;
`;

const FixedDiv = styled.div`
    position: fixed; 
    bottom: 0; 
    height: inherit;
    width: inherit;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    border-top: 1px double #e7e7e7;
`;

export default connect(
    createSelector(
        selectBottomNav,
        auth.selectors.selectUserId,
        users.selectors.selectById,
        (visibility, authUserId, usersById) => {
            let authUsername = '';
            if (authUserId) {
                authUsername = usersById[authUserId].username;
            }
            return { visibility, authUsername };
        }
    )
)(BottomNav);