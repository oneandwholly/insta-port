//import { createSelector } from 'reselect';
import _ from 'lodash';
import { NAME } from './constants';
import { getHasTokenProp, getUserIdProp, getErrorProp } from './model';

export const selectAll = state => state[NAME];

export const selectHasToken = _.flow(selectAll, getHasTokenProp);

export const selectError = _.flow(selectAll, getErrorProp);

export const selectUserId = _.flow(selectAll, getUserIdProp);

// export const getCompleted = _.compose(filterCompleted, getAll);
//
// export const getActive = _.compose(filterActive, getAll);
//
// export const getCounts = createSelector(
//   getAll,
//   getCompleted,
//   getActive,
//   (allTodos, completedTodos, activeTodos) => ({
//     all: allTodos.length,
//     completed: completedTodos.length,
//     active: activeTodos.length
//   })
// );