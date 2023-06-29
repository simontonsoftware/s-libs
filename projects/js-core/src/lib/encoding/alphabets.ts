/** A string containing all the numbers, in sort order: `0-9`. Good for use with {@linkcode Encoding}. */
export const NUMERIC_ALPHABET = '0123456789';

/** A string containing all the lower case letters, in sort order: `a-z`. Good for use with {@linkcode Encoding}. */
export const LOWER_CASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/** A string containing all the upper case letters, in sort order: `A-Z`. Good for use with {@linkcode Encoding}. */
export const UPPER_CASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** A string containing all the letters, in sort order: `A-Za-z`. Good for use with {@linkcode Encoding}. */
export const ALPHA_ALPHABET = `${UPPER_CASE_ALPHABET}${LOWER_CASE_ALPHABET}`;

/** A string containing all alphanumeric characters, in sort order. `0-9A-Za-z`. Good for use with {@linkcode Encoding}. */
export const ALPHA_NUMERIC_ALPHABET = `${NUMERIC_ALPHABET}${ALPHA_ALPHABET}`;

/** A string containing all [unreserved uri characters](https://en.wikipedia.org/wiki/URL_encoding#Unreserved_characters), in sort order: `-.0-9A-Z_a-z~`. Good for use with {@linkcode Encoding}. */
export const UNRESERVED_ALPHABET = `-.${NUMERIC_ALPHABET}${UPPER_CASE_ALPHABET}_${LOWER_CASE_ALPHABET}~`;
