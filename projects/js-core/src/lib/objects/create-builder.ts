/** @hidden */
let seq = 0;

/**
 * Creates a factory function for building objects of a given type. Commonly used to create test objects for use in specs.
 *
 * ```ts
 * interface Message {
 *   id: number;
 *   text: string;
 * }
 *
 * interface Options {
 *   cypherDistance: number;
 * }
 *
 * declare function shiftCharacters(text: string, distance: number): string;
 *
 * const buildMessage = createBuilder<Message, Options>(
 *   (seq) => ({ id: seq, text: `message ${seq}` }),
 *   (message, _seq, options) => {
 *     message.text = shiftCharacters(message.text, options.cypherDistance || 0);
 *   },
 * );
 *
 * buildMessage(); // { id: 1, text: "message 1" }
 * buildMessage({ text: "Hello world!" }); // { id: 2, text: "Hello world!" }
 * buildMessage({ text: "abc" }, { cypherDistance: 3 }); // { id: 3, text: "def" }
 * ```
 */
export function createBuilder<T, OptionsType = {}>(
  buildDefaults: (seq: number, options: Partial<OptionsType>) => T,
  afterBuild?: (obj: T, seq: number, options: Partial<OptionsType>) => void,
): (attributes?: Partial<T>, options?: Partial<OptionsType>) => T {
  return (attributes?: Partial<T>, options: Partial<OptionsType> = {}): T => {
    ++seq;
    const obj = Object.assign(buildDefaults(seq, options), attributes);
    if (afterBuild) {
      afterBuild(obj, seq, options);
    }
    return obj;
  };
}
