import { Component } from '@angular/core';
import { mapToObject } from '@s-libs/js-core';
import { forEach, padStart } from '@s-libs/micro-dash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { City, IntegrationState } from './integration-state';
import { IntegrationStore } from './integration-store';

@Component({
  selector: 's-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  cities: City[] = ['San Francisco', 'Nairobi', 'Gulu'];
  stateString$: Observable<string>;

  constructor(public store: IntegrationStore) {
    this.stateString$ = store.$.pipe(
      map((state) => JSON.stringify(state, null, 2)),
    );
  }

  chooseToCheck(): void {
    this.store('checkMany').set(
      mapToObject(this.store.state().chooseMany, (city) => [city, true]),
    );
  }

  checkToChoose(): void {
    const choices: City[] = [];
    forEach(this.store.state().checkMany, (selected, city) => {
      if (selected) {
        choices.push(city as any);
      }
    });
    this.store('chooseMany').set(choices);
  }

  propagateDatetime(): void {
    const time = this.dateFromDatetime().getTime();
    this.modDates('datetime', (dest) => {
      dest.setTime(time);
    });
  }

  propagateDate(): void {
    const source = this.dateFromDate();
    this.modDates('date', (dest) => {
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
      dest.setDate(source.getDate());
    });
  }

  propagateMonth(): void {
    const source = this.dateFromMonth();
    this.modDates('month', (dest) => {
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
    });
  }

  propagateWeek(): void {
    const source = this.dateFromWeek();
    this.modDates('week', (dest) => {
      const day = dest.getDay();
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
      dest.setDate(source.getDate() + day - 1);
    });
  }

  propagateTime(): void {
    const source = this.dateFromTime();
    this.modDates('time', (dest) => {
      dest.setHours(source.getHours());
      dest.setMinutes(source.getMinutes());
    });
  }

  private modDates(
    type: keyof IntegrationState,
    fn: (dest: Date) => void,
  ): void {
    this.store.mutateUsing((state) => {
      if (state[type] === '') {
        state.datetime =
          state.date =
          state.month =
          state.week =
          state.time =
            '';
      } else {
        this.modDateTime(state, fn);
        this.modDate(state, fn);
        this.modMonth(state, fn);
        this.modWeek(state, fn);
        this.modTime(state, fn);
      }
    });
  }

  private modDateTime(state: IntegrationState, fn: (dest: Date) => void): void {
    const d = dateParts(this.dateFromDatetime(), fn);
    state.datetime = `${d.y}-${d.M}-${d.d}T${d.h}:${d.m}`;
  }

  private modDate(state: IntegrationState, fn: (dest: Date) => void): void {
    const d = dateParts(this.dateFromDate(state), fn);
    state.date = `${d.y}-${d.M}-${d.d}`;
  }

  private modMonth(state: IntegrationState, fn: (dest: Date) => void): void {
    const d = dateParts(this.dateFromMonth(state), fn);
    state.month = `${d.y}-${d.M}`;
  }

  private modWeek(state: IntegrationState, fn: (dest: Date) => void): void {
    const dateObj = this.dateFromWeek(state);
    fn(dateObj);
    state.week = `${pad(getWeekYear(dateObj), 4)}-W${pad(getWeek(dateObj))}`;
  }

  private modTime(state: IntegrationState, fn: (dest: Date) => void): void {
    const d = dateParts(this.dateFromTime(state), fn);
    state.time = `${d.h}:${d.m}`;
  }

  private dateFromDatetime(state = this.store.state()): Date {
    return new Date(state.datetime || '2000-01-01T00:00');
  }

  private dateFromDate(state = this.store.state()): Date {
    return new Date((state.date || '2000-01-01') + 'T00:00');
  }

  private dateFromMonth(state = this.store.state()): Date {
    return new Date((state.month || '2000-01') + '-01T00:00');
  }

  private dateFromWeek(state = this.store.state()): Date {
    const [year, week] = (state.week || '2000-W01').split('-W').map(Number);
    return weekToDate(year, week);
  }

  private dateFromTime(state = this.store.state()): Date {
    return new Date('2000-01-01T' + (state.time || '00:00'));
  }
}

function dateParts(
  date: Date,
  fn: (dest: Date) => void,
): { d: string; h: string; y: string; M: string; m: string } {
  fn(date);
  return {
    y: pad(date.getFullYear(), 4),
    M: pad(date.getMonth() + 1),
    d: pad(date.getDate()),
    h: pad(date.getHours()),
    m: pad(date.getMinutes()),
  };
}

function pad(num: number, length = 2): string {
  return padStart(num.toString(), length, '0');
}

// Returns the ISO week of the date.
// Source: https://weeknumber.net/how-to/javascript
function getWeek(date: Date): number {
  date = new Date(date.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

// Returns the four-digit year corresponding to the ISO week of the date.
// Source: https://weeknumber.net/how-to/javascript
function getWeekYear(date: Date): number {
  date = new Date(date.getTime());
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  return date.getFullYear();
}

// https://stackoverflow.com/a/16591175/1836506
function weekToDate(year: number, week: number): Date {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  if (date.getDay() <= 4) {
    date.setDate(date.getDate() - date.getDay() + 1);
  } else {
    date.setDate(date.getDate() + 8 - date.getDay());
  }
  return date;
}
