export function nth<T>(array: ReadonlyArray<T>, index: number): T {
  if (index < 0) {
    index = array.length + index;
  }
  return array[index];
}
