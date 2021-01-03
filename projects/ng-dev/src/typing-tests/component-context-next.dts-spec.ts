import {
  ComponentContextNext,
  ComponentContextNextInit,
} from '../lib/test-context';

class TestComponent {}

const ctx = new ComponentContextNext(TestComponent);
// $ExpectType ComponentFixture<unknown>
const fixture = ctx.fixture;
// $ExpectType (inputs: Partial<TestComponent>) => void
const assignInputs = ctx.assignInputs;
// $ExpectType TestComponent
const componentInstance = ctx.getComponentInstance();

interface CustomInit extends ComponentContextNextInit<TestComponent> {
  specialProperty: string;
}
const initedCtx = new ComponentContextNext<TestComponent, CustomInit>(
  TestComponent,
);
// $ExpectType { (test: () => void): void; (options: Partial<CustomInit>, test: () => void): void; }
const run = initedCtx.run;
