import _ from 'lodash';
import { NAME } from './constants';
import { getByIdProp, getByUsernameProp } from './model';

export const selectAll = state => state[NAME];

export const selectById = _.flow(selectAll, getByIdProp);

export const selectByUsername = _.flow(selectAll, getByUsernameProp);