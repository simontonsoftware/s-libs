import { browser, element, by, ElementFinder, Key, logging } from 'protractor';
import { AppPage } from './app.po';

const cities = ['San Francisco', 'Nairobi', 'Gulu'];

describe('integration App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry),
    );
  });

  async function clearValue(control: string | ElementFinder): Promise<void> {
    control = getControl(control);

    // https://github.com/angular/protractor/issues/4343#issuecomment-350106755
    await control.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await control.sendKeys(Key.BACK_SPACE);
    await control.clear();
  }

  function getControl(control: string | ElementFinder): ElementFinder {
    if (typeof control === 'string') {
      return getInput(control);
    } else {
      return control;
    }
  }

  function getInput(type: string): ElementFinder {
    let css = 'input';
    if (type) {
      css += `[type="${type}"]`;
    } else {
      css += ':not([type])';
    }
    return element(by.css(css));
  }

  describe('free text controls (and color)', () => {
    function textarea(): ElementFinder {
      return element(by.css('textarea'));
    }

    interface ExpectFreeTextOptions {
      isColor?: boolean;
    }

    async function testControl(
      control: string | ElementFinder,
      value: string,
      options?: ExpectFreeTextOptions,
    ): Promise<void> {
      await clearValue(control);
      await expectValue('');
      await getControl(control).sendKeys(value);
      await expectValue(value, options);
    }

    async function expectValue(
      value: string,
      { isColor = false }: ExpectFreeTextOptions = {},
    ): Promise<void> {
      const stripped = value.replace(/[\r\n]/g, '');
      expect(await getInput('').getAttribute('value')).toEqual(stripped);
      expect(await getInput('text').getAttribute('value')).toEqual(stripped);
      expect(await getInput('search').getAttribute('value')).toEqual(stripped);
      expect(await getInput('tel').getAttribute('value')).toEqual(stripped);
      expect(await getInput('password').getAttribute('value')).toEqual(
        stripped,
      );
      expect(await getInput('email').getAttribute('value')).toEqual(stripped);
      expect(await getInput('url').getAttribute('value')).toEqual(stripped);
      expect(await textarea().getAttribute('value')).toEqual(value);

      expect(await getInput('color').getAttribute('value')).toEqual(
        isColor ? value : '#000000',
      );
    }

    it('work', async () => {
      await expectValue('initial text');

      await testControl('', 'default input');
      await testControl('text', 'text input');
      await testControl('search', 'search input');
      await testControl('tel', 'tel input');
      await testControl('password', 'password input');
      await testControl('email', 'email@input.com');
      await testControl('url', 'http://www.input.com/url');
      await testControl('', '#123456', { isColor: true });
      await testControl(textarea(), 'textarea\nvalue');

      // https://stackoverflow.com/q/36402624/1836506
      browser.executeScript(`
        input = document.querySelector('input[type="color"]');
        input.value = '#654321';
        input.dispatchEvent(new Event('input'));
      `);
      await expectValue('#654321', { isColor: true });
    });
  });

  describe('number controls', () => {
    async function expectValue(value: string): Promise<void> {
      expect(await getInput('number').getAttribute('value')).toEqual(value);
      expect(await getInput('range').getAttribute('value')).toEqual(
        value || '50',
      );
    }

    it('work', async () => {
      await expectValue('42');

      await clearValue('number');
      await expectValue('');
      await getInput('number').sendKeys('75');
      await expectValue('75');

      await browser
        .actions()
        .dragAndDrop(getInput('range'), { x: -99, y: 0 })
        .perform();
      await expectValue('0');
    });
  });

  describe('choose one controls', () => {
    function getDropdown(): ElementFinder {
      return element(by.css('select:not([multiple])'));
    }

    function getRadio(value: string): ElementFinder {
      return element(by.css(`input[type="radio"][value="${value}"]`));
    }

    async function expectValue(value: string): Promise<void> {
      expect(await getDropdown().getAttribute('value')).toEqual(value);
      for (const city of cities) {
        expect(await getRadio(city).getAttribute('checked')).toEqual(
          city === value ? 'true' : null!,
        );
      }
    }

    it('work', async () => {
      await expectValue('Nairobi');

      await element(by.cssContainingText('option', 'San Francisco')).click();
      await expectValue('San Francisco');

      await getRadio('Gulu').click();
      await expectValue('Gulu');
    });
  });

  describe('choose many controls', () => {
    function getOption(value: string): ElementFinder {
      return element(by.cssContainingText('select[multiple] option', value));
    }

    function getCheck(value: string): ElementFinder {
      return element(by.css(`input[type="checkbox"][value="${value}"]`));
    }

    async function expectValues(values: string[]): Promise<void> {
      for (const city of cities) {
        const expected = values.includes(city) ? 'true' : null!;
        expect(await getOption(city).getAttribute('checked')).toEqual(expected);
        expect(await getCheck(city).getAttribute('checked')).toEqual(expected);
      }
    }

    it('work', async () => {
      await expectValues(['Nairobi', 'Gulu']);

      await getOption('Gulu').click();
      await element(by.cssContainingText('button', 'v')).click();
      await expectValues(['Nairobi']);

      await getCheck('Nairobi').click();
      await element(by.cssContainingText('button', '^')).click();
      await expectValues([]);
    });
  });

  describe('date and time controls', () => {
    async function testControl(
      type: string,
      keys: string,
      value: string,
      week: string,
    ): Promise<void> {
      await clearDate(type);
      await expectValue('', '');
      await getInput(type).sendKeys(keys);
      await propagate(type);
      await expectValue(value, week);
    }

    async function clearDate(type: string): Promise<void> {
      const control = getInput(type);
      await control.sendKeys(Key.BACK_SPACE);
      await propagate(type);
    }

    async function propagate(type: string): Promise<void> {
      await element(by.cssContainingText('button', type + ' flush')).click();
    }

    async function expectValue(datetime: string, week: string): Promise<void> {
      expect(await getInput('datetime-local').getAttribute('value')).toEqual(
        datetime,
      );
      expect(await getInput('date').getAttribute('value')).toEqual(
        datetime.substr(0, 10),
      );
      expect(await getInput('month').getAttribute('value')).toEqual(
        datetime.substr(0, 7),
      );
      expect(await getInput('week').getAttribute('value')).toEqual(week);
      expect(await getInput('time').getAttribute('value')).toEqual(
        datetime.substr(11),
      );
    }

    it('work', async () => {
      await expectValue('1980-11-04T10:30', '1980-W45');
      await testControl(
        'datetime-local',
        `06211975${Key.TAB}0426p`,
        '1975-06-21T16:26',
        '1975-W25',
      );
      await testControl('date', `07041776`, '1776-07-04T00:00', '1776-W27');
      await testControl(
        'month',
        `d${Key.TAB}1999`,
        '1999-12-01T00:00',
        '1999-W48',
      );
      await testControl('week', `412032`, '2032-10-09T00:00', '2032-W41');
      await testControl('time', `0844p`, '2000-01-01T20:44', '2000-W01');
    });
  });
});
