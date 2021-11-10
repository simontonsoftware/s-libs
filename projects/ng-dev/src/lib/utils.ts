export function buildErrorMessage({
  matchType,
  itemType,
  stringifiedUserInput,
  matches,
}: {
  matchType: string;
  itemType: string;
  stringifiedUserInput?: string;
  matches: unknown[];
}): string {
  let message = `Expected ${matchType} ${itemType}(s)`;
  if (stringifiedUserInput) {
    message += ` for criterion "${stringifiedUserInput}"`;
  }
  message += `, found ${matches.length}`;
  return message;
}
