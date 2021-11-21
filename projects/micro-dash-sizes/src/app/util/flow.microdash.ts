import { flow } from '@s-libs/micro-dash';

const increment = (x: number): number => x + 1;
flow(increment, flow())(1);
