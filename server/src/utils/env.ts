/**
 * Returns true if currently in a production environment.
 */
export function inProd(): boolean {
  return process.env.NODE_ENV === 'production';
}
