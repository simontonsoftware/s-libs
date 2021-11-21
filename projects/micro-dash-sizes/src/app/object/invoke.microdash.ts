import { invoke } from '@s-libs/micro-dash';

invoke(
  {
    a(val: any): void {
      console.log(val);
    },
  },
  ['hi'],
);
