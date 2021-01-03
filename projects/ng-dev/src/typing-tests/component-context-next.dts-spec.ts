import { ComponentContextNext } from '../lib/test-context';

class TestComponent {}

const ctx = new ComponentContextNext(TestComponent);
// $ExpectType ComponentFixture<unknown>
const fixture = ctx.fixture;
// $ExpectType (inputs: Partial<TestComponent>) => void
const assignInputs = ctx.assignInputs;
// $ExpectType TestComponent
const componentInstance = ctx.getComponentInstance();
