import {runInThisContext} from 'vm';

/**
 * A 2D Vector.
 */
export class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  public addValues(x: number, y: number) {
    this.x += x;
    this.y += y;
    return this;
  }

  public subtract(other: Vector) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  public multiplyScalar(amount: number) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  public dot(other: Vector) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Copy the values of another vector into this instance.
   */
  public copy(source: Vector) {
    this.x = source.x;
    this.y = source.y;
    return this;
  }

  /**
   * Returns a new vector that has the same dimensions of this one.
   */
  public clone() {
    return new Vector(this.x, this.y);
  }

  public clear() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
}
