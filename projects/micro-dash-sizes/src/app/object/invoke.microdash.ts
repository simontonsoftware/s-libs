import { invoke } from '@s-libs/micro-dash';
invoke({ a: (val: any) => console.log(val) }, ['hi']);
