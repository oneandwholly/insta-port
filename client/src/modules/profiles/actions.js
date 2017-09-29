import axios from 'axios';
import * as p from './actionTypes';
import users from '../users';

export const fetchProfile = (username) => {
    return (dispatch, getState) => {
        //if state.user has this username, add the user to the profiles state,
        //else fetch User and then add it to the profiles state,
        dispatch(getUser(username))
            .then(() => {
                console.log('then')
            });
        //fetch Photos
    }
}

export const getUser = (username) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const allUsersByUsername = users.selectors.selectByUsername(getState());
            if (allUsersByUsername[username]) {
                console.log('add profile')
                resolve();
            } else {
                console.log('fetch user and then add')
                resolve();
            }
        });
    }
}