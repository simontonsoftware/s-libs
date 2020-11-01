import { debounce } from '@s-libs/micro-dash';

debounce(() => {})();
debounce((value: number) => {
  console.log(value);
}, 1)(1);
