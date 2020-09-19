import { toString } from 'micro-dash';

/**
 * Converts a 2D array to a csv string. Values are converted using micro-dash's `toString()`.
 *
 * ```ts
 * toCsv([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]); // "a,b,c\nd,e,f\ng,h,i"
 * toCsv([
 *   ["a", "", "string"]
 *   [undefined, null],
 *   [true, false],
 *   [1, 2, 3],
 *   [{}, { hi: "there" }]
 * ]) // "a,,string\n,\ntrue,false\n1,2,3\n[object Object],[object Object]"
 * ```
 */
export function toCsv(content: any[][]): string {
  return content
    .map((row) => row.map((cell) => toCellString(cell)).join(','))
    .join('\n');
}

/** @hidden */
const specialCsvCharactersRegexp = /["|,|\n|\r]/;
/** @hidden */
const allDoubleQuotes = /"/g;

/** @hidden */
function toCellString(value: any): string {
  const str = toString(value);

  if (specialCsvCharactersRegexp.test(str)) {
    return `"${str.replace(allDoubleQuotes, `""`)}"`;
  } else {
    return str;
  }
}
