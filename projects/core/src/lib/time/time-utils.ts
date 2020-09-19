import { last } from 'micro-dash';
import { mapAsKeys } from '../objects/map-as-keys';
import { roundToMultipleOf } from '../round-to-multiple-of';

/**
 * Defines the canonical string representation for each time unit. Many aliases
 * can also be used with the functions that deal with time units:
 *
 * - ns, Nanosecond, Nanoseconds, nanosecond, nanoseconds, nanos
 * - μs, Microsecond, Microseconds, microsecond, microseconds, micros
 * - ms, Millisecond, Milliseconds, millisecond, milliseconds, millis
 * - s, Second, Seconds, second, seconds, S, sec, sec, secs
 * - m, Minute, Minutes, minute, minutes, M, min, mins
 * - h, Hour, Hours, hour, hours, H, hr, hrs
 * - d, Day, Days, day, days, D
 * - w, Week, Weeks, week, weeks, W, wk, wks
 * - y, Year, Years, year, years, Y, yr, yrs
 * - dec, Decade, Decades, decade, decades
 * - cent, Century, Centuries, century, centuries
 * - mil, Millennium, Millennia, millennium, millennia
 */
export enum TimeUnit {
  Nanoseconds = 'ns',
  Microseconds = 'μs',
  Milliseconds = 'ms',
  Seconds = 's',
  Minutes = 'm',
  Hours = 'h',
  Days = 'd',
  Weeks = 'w',
  Years = 'y',
  Decades = 'dec',
  Centuries = 'cent',
  Millennia = 'mil',
}

/** @hidden */
const nanoConversions = {
  ...getNanoConversions(TimeUnit.Nanoseconds, 'Nanosecond', 1, {
    aliases: ['nanos'],
  }),
  ...getNanoConversions(TimeUnit.Microseconds, 'Microsecond', 1000, {
    aliases: ['micros'],
  }),
  ...getNanoConversions(TimeUnit.Milliseconds, 'Millisecond', 1000 * 1000, {
    aliases: ['millis'],
  }),
  ...getNanoConversions(TimeUnit.Seconds, 'Second', 1000 * 1000 * 1000, {
    aliases: ['S', 'sec', 'secs'],
  }),
  ...getNanoConversions(TimeUnit.Minutes, 'Minute', 60 * 1000 * 1000 * 1000, {
    aliases: ['M', 'min', 'mins'],
  }),
  ...getNanoConversions(TimeUnit.Hours, 'Hour', 60 * 60 * 1000 * 1000 * 1000, {
    aliases: ['H', 'hr', 'hrs'],
  }),
  ...getNanoConversions(
    TimeUnit.Days,
    'Day',
    24 * 60 * 60 * 1000 * 1000 * 1000,
    {
      aliases: ['D'],
    },
  ),
  ...getNanoConversions(
    TimeUnit.Weeks,
    'Week',
    7 * 24 * 60 * 60 * 1000 * 1000 * 1000,
    {
      aliases: ['W', 'wk', 'wks'],
    },
  ),
  ...getNanoConversions(
    TimeUnit.Years,
    'Year',
    365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
    {
      aliases: ['Y', 'yr', 'yrs'],
    },
  ),
  ...getNanoConversions(
    TimeUnit.Decades,
    'Decade',
    10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
  ),
  ...getNanoConversions(
    TimeUnit.Centuries,
    'Century',
    100 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
    { plural: 'Centuries' },
  ),
  ...getNanoConversions(
    TimeUnit.Millennia,
    'Millennium',
    1000 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
    { plural: 'Millennia' },
  ),
};

/**
 * Converts time between two units. Units can be any value described in the docs for [[TimeUnit]].
 *
 * ```ts
 * convertTime(1, 's', 'ms'); // 1000
 * convertTime(20, TimeUnit.Decades, TimeUnit.Centuries); // 2
 * ```
 */
export function convertTime(
  value: number,
  unit: string,
  targetUnit: string,
): number {
  return (value * nanoConversions[unit]) / nanoConversions[targetUnit];
}

/**
 * Constructs a string representation of an elapsed amount of time. The least significant unit will be rounded to the nearest whole number.
 *
 * ```ts
 * elapsedToString(2001, ["s", "ms"]); // "2 s 1 ms"
 * elapsedToString(15, ["wks", "d"], ( elapsedUnit: TimeUnit.Days }); // "2 wks 1 d"
 * elapsedToString(1, [TimeUnit.Microseconds]); // "1000 μs"
 * ```
 *
 * @param showLeadingZeros whether to include the most significant units in the string if they are zero.
 */
export function elapsedToString(
  elapsed: number,
  units: string[],
  { elapsedUnit = TimeUnit.Milliseconds, showLeadingZeros = true } = {},
): string {
  elapsed = roundToMultipleOf(
    convertTime(1, last(units), elapsedUnit),
    elapsed,
  );

  let showZeros = showLeadingZeros;
  const tokens: Array<number | string> = [];
  units.forEach((unit, i) => {
    const conversion = convertTime(1, elapsedUnit, unit);
    const value = Math.floor(elapsed * conversion);
    if (value > 0 || showZeros || i === units.length - 1) {
      tokens.push(value, unit);
      showZeros = true;
    }
    elapsed -= value / conversion;
  });
  return tokens.join(' ');
}

/** @hidden */
function getNanoConversions(
  unit: TimeUnit,
  singular: string,
  nanos: number,
  { aliases = [] as string[], plural = singular + 's' } = {},
): Record<string, number> {
  return mapAsKeys(
    [
      unit,
      singular,
      singular.toLowerCase(),
      plural,
      plural.toLowerCase(),
      ...aliases,
    ],
    () => nanos,
  );
}
