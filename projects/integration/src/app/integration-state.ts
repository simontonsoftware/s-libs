export type City = 'San Francisco' | 'Nairobi' | 'Gulu';

export class IntegrationState {
  freeText = 'initial text';
  number = 42;
  chooseOne: City = 'Nairobi';
  chooseMany: City[] = ['Nairobi', 'Gulu'];
  checkMany: { [C in City]?: boolean } = { Nairobi: true, Gulu: true };
  datetime = '1980-11-04T10:30';
  date = '1980-11-04';
  month = '1980-11';
  week = '1980-W45';
  time = '10:30';
}
