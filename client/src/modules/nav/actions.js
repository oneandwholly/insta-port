import * as n from './actionTypes';

export const setActive = (name) => {
    return (dispatch) => {
        dispatch({
            type: n.SET_ACTIVE,
            payload: name
        })
    }
}

export const hideTopNav = () => {
    return (dispatch) => {
        dispatch({
            type: n.HIDE_TOP
        })
    }
}

export const showTopNav = () => {
    return (dispatch) => {
        dispatch({
            type: n.SHOW_TOP
        })
    }
}

export const hideBottomNav = () => {
    return (dispatch) => {
        dispatch({
            type: n.HIDE_BOTTOM
        })
    }
}

export const showBottomNav = () => {
    return (dispatch) => {
        dispatch({
            type: n.SHOW_BOTTOM
        })
    }
}