import { flow } from '@s-libs/micro-dash';

const increment = (x: number) => x + 1;
flow(increment, flow())(1);
