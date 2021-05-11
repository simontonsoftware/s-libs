import { ComponentContext } from '../lib/component-context';

class TestComponent {}

const ctx = new ComponentContext(TestComponent);
// $ExpectType ComponentFixture<unknown>
const fixture = ctx.fixture;
// $ExpectType (inputs: Partial<TestComponent>) => void
const assignInputs = ctx.assignInputs;
// $ExpectType TestComponent
const componentInstance = ctx.getComponentInstance();
