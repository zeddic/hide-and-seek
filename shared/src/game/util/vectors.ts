import {Vector} from './vector';

function add(v1: Vector, v2: Vector): Vector {
  return v1.clone().add(v2);
}

function subtract(v1: Vector, v2: Vector): Vector {
  return v1.clone().subtract(v2);
}

function multiplyScalar(v1: Vector, amount: number) {
  return v1.clone().multiplyScalar(amount);
}

export const vectors = {
  add,
  subtract,
  multiplyScalar,
};
