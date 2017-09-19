import * as u from './actionTypes';

const initialState = {
  byId: { },
  byUsername: { }
};

export default (state = initialState, action) => {
    let newState, newById, newByUsername, newUser;
    switch(action.type) {
        case u.ADD:
            newUser = action.payload;
            newById = { ...state.byId, [newUser.id]: newUser };
            newByUsername = { ...state.byUsername, [newUser.username]: newUser.id };
            newState = { ...state, byId: newById, byUsername: newByUsername };
            return newState;
        default:
            return state;
    }
}