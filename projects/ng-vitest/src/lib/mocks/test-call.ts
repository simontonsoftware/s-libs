import {
  Mock,
  MockParameters,
  MockProcedureContext,
  MockResult,
  MockReturnType,
  MockSettledResult,
} from '@vitest/spy';
import { Func } from '../interfaces';

/**
 * Collects all the information about a single call to a vitest mock into a single object.
 */
export class TestCall<F extends Func> {
  constructor(
    private mock: Mock<F>,
    private index: number,
  ) {}

  /**
   * See {@linkcode Mock.mock.calls}
   */
  getArgs(): MockParameters<F> {
    return this.mock.mock.calls[this.index];
  }

  /**
   * See {@linkcode Mock.mock.instances}
   */
  getInstance(): MockProcedureContext<F> {
    return this.mock.mock.instances[this.index];
  }

  /**
   * See {@linkcode Mock.mock.contexts}
   */
  getContext(): MockProcedureContext<F> {
    return this.mock.mock.contexts[this.index];
  }

  /**
   * See {@linkcode Mock.mock.invocationCallOrder}
   */
  getInvocationCallOrder(): number {
    return this.mock.mock.invocationCallOrder[this.index];
  }

  /**
   * See {@linkcode Mock.mock.results}
   */
  getResult(): MockResult<MockReturnType<F>> {
    return this.mock.mock.results[this.index];
  }

  /**
   * See {@linkcode Mock.mock.settledResults}
   */
  getSettledResult(): MockSettledResult<Awaited<MockReturnType<F>>> {
    return this.mock.mock.settledResults[this.index];
  }
}
