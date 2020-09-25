import { FormControlSuperclass } from '../public-api';

class TestSubclass extends FormControlSuperclass<Date> {
  handleIncomingValue(_value: Date): void {}
}

const obj = new TestSubclass(null as any);

// $ExpectType (value: Date) => void
const emitOutgoingValue = obj.emitOutgoingValue;
// $ExpectType (value: Date) => void
const writeValue = obj.writeValue;
// $ExpectType (fn: (value: Date) => void) => void
const registerOnChange = obj.registerOnChange;

console.log(emitOutgoingValue, writeValue, registerOnChange);
