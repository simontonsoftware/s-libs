import { flowRight } from '@s-libs/micro-dash';

const increment = (x: number): number => x + 1;
flowRight(flowRight(), increment)(1);
