import * as p from './actionTypes';

const initialState = {
    byId: {}
};

export default (state = initialState, action) => {
    let newState, newById;
    switch(action.type) {
        case p.ADD:
            newById = { ...state.byId, [action.payload.id]: action.payload };
            newState = { ...state, byId: newById };
            return newState;
        default:
            return state; 
    }
}