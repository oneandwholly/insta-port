import React, { Component } from 'react';
import { connect } from 'react-redux';
import auth from '../../auth';
import nav from '../../nav';
import home from '../../home';
import { createStructuredSelector } from 'reselect';

class IndexRoute extends Component {
    render() {
        if (this.props.hasToken) {
            return <home.components.Home />
                
        }
        return <auth.components.LandingPage navActions={nav.actions}/>
    }
}

export default connect(
    createStructuredSelector({
        hasToken: auth.selectors.selectHasToken
    })
)(IndexRoute);