export class InnerState {
  left?: InnerState;
  right?: InnerState;

  constructor(public state = 0) {}
}

export class TestState {
  counter = 0;
  nested = new InnerState();
  optional?: InnerState;
  array?: number[];
}
