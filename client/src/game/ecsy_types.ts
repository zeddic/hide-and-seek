import {createType, copyCopyable, cloneClonable} from 'ecsy';
import {Vector} from './util/vector';

export const ThreeTypes = {
  Vector3: createType({
    name: 'Vector',
    default: new Vector(0, 0),
    copy: copyCopyable,
    clone: cloneClonable,
  }),
};

export {Types} from 'ecsy';
