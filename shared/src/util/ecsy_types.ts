import {createType, copyCopyable, cloneClonable, Component} from 'ecsy';
import {Vector} from './vector';

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

type AllowedKeys<T> = Exclude<keyof T, keyof Component<any>>;

/**
 * A utility type to aid the construction of ecsy components.
 *
 * ecsy components must be parameterized with a type that
 * describes what the component constructor accepts. This is
 * supposed to be a type that matches the schema definition, and
 * ecsy will copy over all properties from this object
 * that match the schema keys.
 *
 * This parameterized type will generate a type by inspecting
 * the component class and acceptng any property that is defined in
 * the class but not the base Component class.
 *
 * Example use:
 *
 * class Position extends Component<PropsOf<Position>> {
 *   x: number;
 *   y: number;
 *
 *   static schema = { ommitted }
 * }
 *
 * In this case, PropsOf<Position> would be equivalent to:
 *
 * interface PositionProps {
 *   x?: number;
 *   y?: number;
 * }
 *
 * NOTE: You cannot simply use `class Position extends Component<Position>`
 * as this would cause the `attributes` parameter of
 * `entity.addComponent(Position, attributes)` to expect attributes for
 * all `clone`, `copy`, etc parameters in the base component class.
 */
export type PropsOf<Comp> = {
  [Key in AllowedKeys<Comp>]?: Comp[Key];
};
