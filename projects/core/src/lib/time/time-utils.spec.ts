import { convertTime, elapsedToString, TimeUnit } from './time-utils';

describe('time-utils', () => {
  describe('elapsedToString()', () => {
    it('allows non-cannonical values in the `units` array', () => {
      expect(
        elapsedToString(9999, [
          'hours',
          'minutes',
          'seconds',
          'millis',
          'micros',
          'nanos',
        ]),
      ).toBe('0 hours 0 minutes 9 seconds 999 millis 0 micros 0 nanos');
      expect(
        elapsedToString(15, ['wks', 'd'], { elapsedUnit: TimeUnit.Days }),
      ).toBe('2 wks 1 d');
    });

    it('honors the elapsedUnit argument', () => {
      expect(
        elapsedToString(1, [TimeUnit.Seconds], {
          elapsedUnit: TimeUnit.Minutes,
        }),
      ).toBe('60 s');
      expect(
        elapsedToString(1, [TimeUnit.Minutes], {
          elapsedUnit: TimeUnit.Hours,
        }),
      ).toBe('60 m');
      expect(
        elapsedToString(1, [TimeUnit.Hours], {
          elapsedUnit: TimeUnit.Days,
        }),
      ).toBe('24 h');

      // defaults to milliseconds
      expect(elapsedToString(1, [TimeUnit.Microseconds])).toBe('1000 μs');
    });

    it('honors the showLeadingZeros argument', () => {
      const units = [
        TimeUnit.Days,
        TimeUnit.Hours,
        TimeUnit.Minutes,
        TimeUnit.Seconds,
      ];
      expect(elapsedToString(1000, units, { showLeadingZeros: true })).toBe(
        '0 d 0 h 0 m 1 s',
      );
      expect(elapsedToString(1000, units, { showLeadingZeros: false })).toBe(
        '1 s',
      );

      // defaults to true
      expect(elapsedToString(1000, units)).toBe('0 d 0 h 0 m 1 s');
    });

    it('does not trim the least significant leading zero (production bug)', () => {
      expect(elapsedToString(0, ['d'], { showLeadingZeros: false })).toBe(
        '0 d',
      );
      expect(elapsedToString(0, ['d', 'm'], { showLeadingZeros: false })).toBe(
        '0 m',
      );
    });

    it('rounds appropriately', () => {
      expect(elapsedToString(499, ['s'])).toBe('0 s');
      expect(elapsedToString(500, ['s'])).toBe('1 s');
      expect(elapsedToString(1499, ['s'])).toBe('1 s');
      expect(elapsedToString(1500, ['s'])).toBe('2 s');

      expect(elapsedToString(59499, ['m', 's'])).toBe('0 m 59 s');
      expect(elapsedToString(59500, ['m', 's'])).toBe('1 m 0 s');
      expect(elapsedToString(60499, ['m', 's'])).toBe('1 m 0 s');
      expect(elapsedToString(60500, ['m', 's'])).toBe('1 m 1 s');
    });

    it('works when the conversion from the last unit to elapsedUnit cannot be represented exactly in binary (bug during dev)', () => {
      expect(
        elapsedToString(1, ['ms'], { elapsedUnit: TimeUnit.Seconds }),
      ).toBe('1000 ms');
    });
  });

  describe('convertTime()', () => {
    describe('nanoseconds', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'ns')).toBe(1);
        expect(convertTime(1, 'μs', 'ns')).toBe(1000);
        expect(convertTime(1, 'ms', 'ns')).toBe(1000 * 1000);
        expect(convertTime(1, 's', 'ns')).toBe(1000 * 1000 * 1000);
        expect(convertTime(1, 'm', 'ns')).toBe(60 * 1000 * 1000 * 1000);
        expect(convertTime(1, 'h', 'ns')).toBe(60 * 60 * 1000 * 1000 * 1000);
        expect(convertTime(1, 'd', 'ns')).toBe(
          24 * 60 * 60 * 1000 * 1000 * 1000,
        );
        expect(convertTime(1, 'w', 'ns')).toBe(
          7 * 24 * 60 * 60 * 1000 * 1000 * 1000,
        );
        expect(convertTime(1, 'y', 'ns')).toBe(
          365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
        );
        expect(convertTime(1, 'dec', 'ns')).toBe(
          10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
        );
        expect(convertTime(1, 'cent', 'ns')).toBe(
          10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
        );
        expect(convertTime(1, 'mil', 'ns')).toBe(
          10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000,
        );
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Microseconds,
          1000,
          TimeUnit.Nanoseconds,
          'ns',
          'Nanosecond',
          'Nanoseconds',
          'nanosecond',
          'nanoseconds',
          'nanos',
        );
      });
    });

    describe('microseconds', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'μs')).toBe(1 / 1000);
        expect(convertTime(1, 'μs', 'μs')).toBe(1);
        expect(convertTime(1, 'ms', 'μs')).toBe(1000);
        expect(convertTime(1, 's', 'μs')).toBe(1000 * 1000);
        expect(convertTime(1, 'm', 'μs')).toBe(60 * 1000 * 1000);
        expect(convertTime(1, 'h', 'μs')).toBe(60 * 60 * 1000 * 1000);
        expect(convertTime(1, 'd', 'μs')).toBe(24 * 60 * 60 * 1000 * 1000);
        expect(convertTime(1, 'w', 'μs')).toBe(7 * 24 * 60 * 60 * 1000 * 1000);
        expect(convertTime(1, 'y', 'μs')).toBe(
          365 * 24 * 60 * 60 * 1000 * 1000,
        );
        expect(convertTime(1, 'dec', 'μs')).toBe(
          10 * 365 * 24 * 60 * 60 * 1000 * 1000,
        );
        expect(convertTime(1, 'cent', 'μs')).toBe(
          10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000,
        );
        expect(convertTime(1, 'mil', 'μs')).toBe(
          10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000,
        );
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Milliseconds,
          1000,
          TimeUnit.Microseconds,
          'μs',
          'Microsecond',
          'Microseconds',
          'microsecond',
          'microseconds',
          'micros',
        );
      });
    });

    describe('milliseconds', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'ms')).toBe(1 / (1000 * 1000));
        expect(convertTime(1, 'μs', 'ms')).toBe(1 / 1000);
        expect(convertTime(1, 'ms', 'ms')).toBe(1);
        expect(convertTime(1, 's', 'ms')).toBe(1000);
        expect(convertTime(1, 'm', 'ms')).toBe(60 * 1000);
        expect(convertTime(1, 'h', 'ms')).toBe(60 * 60 * 1000);
        expect(convertTime(1, 'd', 'ms')).toBe(24 * 60 * 60 * 1000);
        expect(convertTime(1, 'w', 'ms')).toBe(7 * 24 * 60 * 60 * 1000);
        expect(convertTime(1, 'y', 'ms')).toBe(365 * 24 * 60 * 60 * 1000);
        expect(convertTime(1, 'dec', 'ms')).toBe(
          10 * 365 * 24 * 60 * 60 * 1000,
        );
        expect(convertTime(1, 'cent', 'ms')).toBe(
          10 * 10 * 365 * 24 * 60 * 60 * 1000,
        );
        expect(convertTime(1, 'mil', 'ms')).toBe(
          10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000,
        );
      });

      it('allows all the aliases', () => {
        const aliases = [
          TimeUnit.Milliseconds,
          'ms',
          'Millisecond',
          'Milliseconds',
          'millisecond',
          'milliseconds',
          'millis',
        ];
        for (const alias of aliases) {
          expect(convertTime(1, 's', alias)).toBe(1000);
          expect(convertTime(1000, alias, 's')).toBe(1);
        }
      });
    });

    describe('seconds', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 's')).toBe(1 / (1000 * 1000 * 1000));
        expect(convertTime(1, 'μs', 's')).toBe(1 / (1000 * 1000));
        expect(convertTime(1, 'ms', 's')).toBe(1 / 1000);
        expect(convertTime(1, 's', 's')).toBe(1);
        expect(convertTime(1, 'm', 's')).toBe(60);
        expect(convertTime(1, 'h', 's')).toBe(60 * 60);
        expect(convertTime(1, 'd', 's')).toBe(24 * 60 * 60);
        expect(convertTime(1, 'w', 's')).toBe(7 * 24 * 60 * 60);
        expect(convertTime(1, 'y', 's')).toBe(365 * 24 * 60 * 60);
        expect(convertTime(1, 'dec', 's')).toBe(10 * 365 * 24 * 60 * 60);
        expect(convertTime(1, 'cent', 's')).toBe(10 * 10 * 365 * 24 * 60 * 60);
        expect(convertTime(1, 'mil', 's')).toBe(
          10 * 10 * 10 * 365 * 24 * 60 * 60,
        );
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Minutes,
          60,
          TimeUnit.Seconds,
          's',
          'Second',
          'Seconds',
          'second',
          'seconds',
          'S',
          'sec',
          'sec',
          'secs',
        );
      });
    });

    describe('minutes', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'm')).toBe(1 / (60 * 1000 * 1000 * 1000));
        expect(convertTime(1, 'μs', 'm')).toBe(1 / (60 * 1000 * 1000));
        expect(convertTime(1, 'ms', 'm')).toBe(1 / (60 * 1000));
        expect(convertTime(1, 's', 'm')).toBe(1 / 60);
        expect(convertTime(1, 'm', 'm')).toBe(1);
        expect(convertTime(1, 'h', 'm')).toBe(60);
        expect(convertTime(1, 'd', 'm')).toBe(24 * 60);
        expect(convertTime(1, 'w', 'm')).toBe(7 * 24 * 60);
        expect(convertTime(1, 'y', 'm')).toBe(365 * 24 * 60);
        expect(convertTime(1, 'dec', 'm')).toBe(10 * 365 * 24 * 60);
        expect(convertTime(1, 'cent', 'm')).toBe(10 * 10 * 365 * 24 * 60);
        expect(convertTime(1, 'mil', 'm')).toBe(10 * 10 * 10 * 365 * 24 * 60);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Hours,
          60,
          TimeUnit.Minutes,
          'm',
          'Minute',
          'Minutes',
          'minute',
          'minutes',
          'M',
          'min',
          'mins',
        );
      });
    });

    describe('hours', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'h')).toBe(
          1 / (60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'h')).toBe(1 / (60 * 60 * 1000 * 1000));
        expect(convertTime(1, 'ms', 'h')).toBe(1 / (60 * 60 * 1000));
        expect(convertTime(1, 's', 'h')).toBe(1 / (60 * 60));
        expect(convertTime(1, 'm', 'h')).toBe(1 / 60);
        expect(convertTime(1, 'h', 'h')).toBe(1);
        expect(convertTime(1, 'd', 'h')).toBe(24);
        expect(convertTime(1, 'w', 'h')).toBe(7 * 24);
        expect(convertTime(1, 'y', 'h')).toBe(365 * 24);
        expect(convertTime(1, 'dec', 'h')).toBe(10 * 365 * 24);
        expect(convertTime(1, 'cent', 'h')).toBe(10 * 10 * 365 * 24);
        expect(convertTime(1, 'mil', 'h')).toBe(10 * 10 * 10 * 365 * 24);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Days,
          24,
          TimeUnit.Hours,
          'h',
          'Hour',
          'Hours',
          'hour',
          'hours',
          'H',
          'hr',
          'hrs',
        );
      });
    });

    describe('days', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'd')).toBe(
          1 / (24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'd')).toBe(
          1 / (24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'd')).toBe(1 / (24 * 60 * 60 * 1000));
        expect(convertTime(1, 's', 'd')).toBe(1 / (24 * 60 * 60));
        expect(convertTime(1, 'm', 'd')).toBe(1 / (24 * 60));
        expect(convertTime(1, 'h', 'd')).toBe(1 / 24);
        expect(convertTime(1, 'd', 'd')).toBe(1);
        expect(convertTime(1, 'w', 'd')).toBe(7);
        expect(convertTime(1, 'y', 'd')).toBe(365);
        expect(convertTime(1, 'dec', 'd')).toBe(10 * 365);
        expect(convertTime(1, 'cent', 'd')).toBe(10 * 10 * 365);
        expect(convertTime(1, 'mil', 'd')).toBe(10 * 10 * 10 * 365);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Weeks,
          7,
          TimeUnit.Days,
          'd',
          'Day',
          'Days',
          'day',
          'days',
          'D',
        );
      });
    });

    describe('weeks', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'w')).toBe(
          1 / (7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'w')).toBe(
          1 / (7 * 24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'w')).toBe(1 / (7 * 24 * 60 * 60 * 1000));
        expect(convertTime(1, 's', 'w')).toBe(1 / (7 * 24 * 60 * 60));
        expect(convertTime(1, 'm', 'w')).toBe(1 / (7 * 24 * 60));
        expect(convertTime(1, 'h', 'w')).toBe(1 / (7 * 24));
        expect(convertTime(1, 'd', 'w')).toBe(1 / 7);
        expect(convertTime(1, 'w', 'w')).toBe(1);
        expect(convertTime(1, 'y', 'w')).toBe(365 / 7);
        expect(convertTime(1, 'dec', 'w')).toBe((10 * 365) / 7);
        expect(convertTime(1, 'cent', 'w')).toBe((10 * 10 * 365) / 7);
        expect(convertTime(1, 'mil', 'w')).toBe((10 * 10 * 10 * 365) / 7);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Years,
          365 / 7,
          TimeUnit.Weeks,
          'w',
          'Week',
          'Weeks',
          'week',
          'weeks',
          'W',
          'wk',
          'wks',
        );
      });
    });

    describe('years', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'y')).toBe(
          1 / (365 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'y')).toBe(
          1 / (365 * 24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'y')).toBe(1 / (365 * 24 * 60 * 60 * 1000));
        expect(convertTime(1, 's', 'y')).toBe(1 / (365 * 24 * 60 * 60));
        expect(convertTime(1, 'm', 'y')).toBe(1 / (365 * 24 * 60));
        expect(convertTime(1, 'h', 'y')).toBe(1 / (365 * 24));
        expect(convertTime(1, 'd', 'y')).toBe(1 / 365);
        expect(convertTime(1, 'w', 'y')).toBe(7 / 365);
        expect(convertTime(1, 'y', 'y')).toBe(1);
        expect(convertTime(1, 'dec', 'y')).toBe(10);
        expect(convertTime(1, 'cent', 'y')).toBe(10 * 10);
        expect(convertTime(1, 'mil', 'y')).toBe(10 * 10 * 10);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Decades,
          10,
          TimeUnit.Years,
          'y',
          'Year',
          'Years',
          'year',
          'years',
          'Y',
          'yr',
          'yrs',
        );
      });
    });

    describe('decades', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'dec')).toBe(
          1 / (10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'dec')).toBe(
          1 / (10 * 365 * 24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'dec')).toBe(
          1 / (10 * 365 * 24 * 60 * 60 * 1000),
        );
        expect(convertTime(1, 's', 'dec')).toBe(1 / (10 * 365 * 24 * 60 * 60));
        expect(convertTime(1, 'm', 'dec')).toBe(1 / (10 * 365 * 24 * 60));
        expect(convertTime(1, 'h', 'dec')).toBe(1 / (10 * 365 * 24));
        expect(convertTime(1, 'd', 'dec')).toBe(1 / (10 * 365));
        expect(convertTime(1, 'w', 'dec')).toBe(7 / (10 * 365));
        expect(convertTime(1, 'y', 'dec')).toBe(1 / 10);
        expect(convertTime(1, 'dec', 'dec')).toBe(1);
        expect(convertTime(1, 'cent', 'dec')).toBe(10);
        expect(convertTime(1, 'mil', 'dec')).toBe(10 * 10);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Centuries,
          10,
          TimeUnit.Decades,
          'dec',
          'Decade',
          'Decades',
          'decade',
          'decades',
        );
      });
    });

    describe('centuries', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'cent')).toBe(
          1 / (10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'cent')).toBe(
          1 / (10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'cent')).toBe(
          1 / (10 * 10 * 365 * 24 * 60 * 60 * 1000),
        );
        expect(convertTime(1, 's', 'cent')).toBe(
          1 / (10 * 10 * 365 * 24 * 60 * 60),
        );
        expect(convertTime(1, 'm', 'cent')).toBe(1 / (10 * 10 * 365 * 24 * 60));
        expect(convertTime(1, 'h', 'cent')).toBe(1 / (10 * 10 * 365 * 24));
        expect(convertTime(1, 'd', 'cent')).toBe(1 / (10 * 10 * 365));
        expect(convertTime(1, 'w', 'cent')).toBe(7 / (10 * 10 * 365));
        expect(convertTime(1, 'y', 'cent')).toBe(1 / (10 * 10));
        expect(convertTime(1, 'dec', 'cent')).toBe(1 / 10);
        expect(convertTime(1, 'cent', 'cent')).toBe(1);
        expect(convertTime(1, 'mil', 'cent')).toBe(10);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Millennia,
          10,
          TimeUnit.Centuries,
          'cent',
          'Century',
          'Centuries',
          'century',
          'centuries',
        );
      });
    });

    describe('millenia', () => {
      it('works from all the units', () => {
        expect(convertTime(1, 'ns', 'mil')).toBe(
          1 / (10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        );
        expect(convertTime(1, 'μs', 'mil')).toBe(
          1 / (10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000 * 1000),
        );
        expect(convertTime(1, 'ms', 'mil')).toBe(
          1 / (10 * 10 * 10 * 365 * 24 * 60 * 60 * 1000),
        );
        expect(convertTime(1, 's', 'mil')).toBe(
          1 / (10 * 10 * 10 * 365 * 24 * 60 * 60),
        );
        expect(convertTime(1, 'm', 'mil')).toBe(
          1 / (10 * 10 * 10 * 365 * 24 * 60),
        );
        expect(convertTime(1, 'h', 'mil')).toBe(1 / (10 * 10 * 10 * 365 * 24));
        expect(convertTime(1, 'd', 'mil')).toBe(1 / (10 * 10 * 10 * 365));
        expect(convertTime(1, 'w', 'mil')).toBe(7 / (10 * 10 * 10 * 365));
        expect(convertTime(1, 'y', 'mil')).toBe(1 / (10 * 10 * 10));
        expect(convertTime(1, 'dec', 'mil')).toBe(1 / (10 * 10));
        expect(convertTime(1, 'cent', 'mil')).toBe(1 / 10);
        expect(convertTime(1, 'mil', 'mil')).toBe(1);
      });

      it('allows all the aliases', () => {
        testAliases(
          TimeUnit.Centuries,
          1 / 10,
          TimeUnit.Millennia,
          'mil',
          'Millennium',
          'Millennia',
          'millennium',
          'millennia',
        );
      });
    });
  });
});

function testAliases(
  otherUnit: TimeUnit,
  otherValue: number,
  ...aliases: string[]
): void {
  for (const alias of aliases) {
    expect(convertTime(1, otherUnit, alias)).toBe(otherValue);
    expect(convertTime(otherValue, alias, otherUnit)).toBe(1);
  }
}
