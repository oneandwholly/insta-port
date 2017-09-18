import React, { Component } from 'react';
import { connect } from 'react-redux';
import nav from '../../nav';

class Profile extends Component {
    componentWillMount() {
        this.props.setActive('profile');
    }
    render() {
        return (
            <div>Profile</div>
        );
    }
}

export default connect(null, { setActive: nav.actions.setActive })(Profile);