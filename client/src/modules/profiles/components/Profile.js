import React, { Component } from 'react';
import { connect } from 'react-redux';
import nav from '../../nav';
import users from '../../users';
import auth from '../../auth';
import { createSelector } from 'reselect';

class Profile extends Component {
    componentWillMount() {
        this.props.setActive('profile');
        console.log(this.props.authUser, this.props.profileUser);
        if (!this.props.profileUser) {
            console.log('should fetch profile user')
        }
    }
    render() {
        console.log('rendering')
        console.log(this.props.authUser, this.props.profileUser);
        return (
            <div>Profile</div>
        );
    }
}

export default connect(createSelector(
    users.selectors.selectAll,
    auth.selectors.selectUserId,
    (state, ownProps) => ownProps.match.params.username,
    (users, authUserId, profileUsername) => {
        let authUser = null;
        let profileUser = null;
        
        if (authUserId) {
            authUser = users.byId[authUserId];
        }

        if (profileUsername) {
            profileUser = users.byId[users.byUsername[profileUsername]];
        }
        return { authUser, profileUser }
    }
), { setActive: nav.actions.setActive })(Profile);