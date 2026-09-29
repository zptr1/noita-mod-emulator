// Apparently, returning an array from a function acts as a multi-value return on the Lua side
// So we need to convert the array to an object if we wanna return a table
export function arrayToLua<T>(array: T[]): Record<number, T> {
  const table: Record<number, T> = {};
  for (let idx = 0; idx < array.length; idx++) {
    table[idx] = array[idx];
  }

  return table;
}

// i should probably move img.ts to here, or to `lib`
