import { createBuilder } from './create-builder';

interface Message {
  id: number;
  text: string;
}

interface Options {
  cypherDistance: number;
}

const buildMessage = createBuilder<Message, Options>(
  (seq) => ({ id: seq, text: `message ${seq}` }),
  (message, _seq, options) => {
    message.text = shiftCharacters(message.text, options.cypherDistance || 0);
  },
);

describe('createBuilder()', () => {
  it('assigns the given attributes', () => {
    expect(buildMessage({ id: 1234567 }).id).toBe(1234567);
    expect(buildMessage({ text: 'Hello world!' }).text).toBe('Hello world!');
    expect(buildMessage({ id: 7, text: 'eight' })).toEqual({
      id: 7,
      text: 'eight',
    });
  });

  describe('buildDefaults argument', () => {
    it('is supplied seq and options', () => {
      const build = createBuilder<Message>((seq, options) => ({
        id: seq,
        text: JSON.stringify(options),
      }));

      expect(build().id + 1).toEqual(build().id);
      expect(build({}, { cypherDistance: 3 }).text).toEqual(
        `{"cypherDistance":3}`,
      );
    });
  });

  describe('afterBuild argument', () => {
    it('is not required', () => {
      const build = createBuilder<Message>(() => ({ id: 1, text: 'hi' }));
      expect(build()).toEqual({ id: 1, text: 'hi' });
    });

    it('is supplied the object to be returned, seq, and options', () => {
      const build = createBuilder<Message>(
        (seq) => ({ id: seq, text: 'hi' }),
        (obj, seq, options) => {
          obj.text = JSON.stringify({ origText: obj.text, seq, options });
        },
      );

      const built = build({ text: 'before' }, { opt1: true });

      expect(built.text).toEqual(
        `{"origText":"before","seq":${built.id},"options":{"opt1":true}}`,
      );
    });
  });

  describe('resulting builder', () => {
    it('has only optional parameters', () => {
      expect(() => buildMessage()).not.toThrow();
    });

    it('accepts partials for both parameters', () => {
      const build = createBuilder<
        { a: number; b: number },
        { o1: boolean; o2: boolean }
      >(() => ({ a: 1, b: 2 }));

      expect(() => build({}, {})).not.toThrow();
      expect(() => build({ a: 3 })).not.toThrow();
      expect(() => build({}, { o1: true })).not.toThrow();
    });
  });
});

function shiftCharacters(text: string, distance: number): string {
  return text.replace(/[a-z]/gi, (c) => {
    // tslint:disable:no-bitwise
    const code = c.charCodeAt(0);
    const a = code & 96;
    return String.fromCharCode(((code - a + distance + 129) % 26) - ~a);
  });
}
