import { combineReducers } from 'redux';

import auth from './modules/auth';
import users from './modules/users';
import form from './modules/form';
import nav from './modules/nav';

const rootReducer = combineReducers({
    [auth.constants.NAME]: auth.reducer,
    [users.constants.NAME]: users.reducer,
    [nav.constants.NAME]: nav.reducer,
    [form.constants.NAME]: form.reducer
});

export default rootReducer;