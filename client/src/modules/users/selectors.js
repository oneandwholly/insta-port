import _ from 'lodash';
import { NAME } from './constants';
import { getByIdProp } from './model';

export const selectAll = state => state[NAME];

export const selectById = _.flow(selectAll, getByIdProp);