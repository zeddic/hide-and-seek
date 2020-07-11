import {Region} from './region';

export function isRegionWithin(haystack: Region, needle: Region) {
  return (
    needle.left >= haystack.left &&
    needle.right <= haystack.right &&
    needle.top >= haystack.top &&
    needle.bottom <= haystack.bottom
  );
}

export function regionWidth(r: Region) {
  return r.right - r.left;
}

export function regionHeight(r: Region) {
  return r.bottom - r.top;
}

export function regionMidX(r: Region) {
  return r.left + (r.right - r.left) / 2;
}

export function regionMidY(r: Region) {
  return r.top + (r.bottom - r.top) / 2;
}
