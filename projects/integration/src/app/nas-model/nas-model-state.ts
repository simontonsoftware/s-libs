export type City = 'Gulu' | 'Nairobi' | 'San Francisco';

export class NasModelState {
  freeText = 'initial text';
  number = 42;
  chooseOne: City = 'Nairobi';
  chooseMany: City[] = ['Nairobi', 'Gulu'];
  checkMany: Partial<Record<City, boolean>> = { Nairobi: true, Gulu: true };
  datetime = '1980-11-04T10:30';
  date = '1980-11-04';
  month = '1980-11';
  week = '1980-W45';
  time = '10:30';

  disabled = false;
}
