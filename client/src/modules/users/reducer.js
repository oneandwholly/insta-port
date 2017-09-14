import * as u from './actionTypes';

const initialState = {
  byId: { }
};

export default (state = initialState, action) => {
    let newState, newById, newUser;
    switch(action.type) {
        case u.ADD:
            newUser = action.payload;
            newById = { ...state.byId, [newUser.id]: newUser };
            newState = { ...state, byId: newById };
            return newState;
        default:
            return state;
    }
}