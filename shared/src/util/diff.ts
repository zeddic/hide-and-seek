import _ from 'lodash';

/**
 * Returns true if two objects have deep object equality.
 */
export function isDeepEqual(a: {}, b: {}): boolean {
  // just proxy to lodash until we need something custom.
  return _.isEqual(a, b);
}
