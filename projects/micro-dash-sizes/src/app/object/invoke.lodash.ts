import invoke from 'lodash-es/invoke';

invoke(
  {
    a(val: any): void {
      console.log(val);
    },
  },
  ['hi'],
);
