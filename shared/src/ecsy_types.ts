import {createType, copyCopyable, cloneClonable, Component} from 'ecsy';
import {Vector} from './util/vector';

/**
 * Custom ecsy schema types used in this game.
 */
export const CustomTypes = {
  Vector: createType({
    name: 'Vector',
    default: new Vector(0, 0),
    copy: copyCopyable,
    clone: cloneClonable,
  }),
};
