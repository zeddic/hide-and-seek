export function inProd(): boolean {
  return process.env.NODE_ENV === 'production';
}
