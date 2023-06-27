export const NUMERIC = '0123456789';
export const LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
export const UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const ALPHA = `${UPPER_CASE}${LOWER_CASE}`;
export const ALPHA_NUMERIC = `${NUMERIC}${ALPHA}`;
export const UNRESERVED = `-.${NUMERIC}${UPPER_CASE}_${LOWER_CASE}~`;
