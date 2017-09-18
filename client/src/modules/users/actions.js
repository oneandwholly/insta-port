import auth from '../auth';
import axios from 'axios';
import * as u from './actionTypes';

export const addUser = (user) => {
    return (dispatch) => {
        dispatch({
            type: u.ADD,
            payload: user
        });
    }
}

export const fetchUserWithToken = () => {
    return (dispatch) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { authorization: token }
        };
        return axios.get(`${window.location.protocol}//${window.location.host}/api/auth/token`, config)
            .then((res) => {
                const user = res.data;
                dispatch(addUser(user));
                dispatch(auth.actions.setUserId(user.id));
            });
        }
    }