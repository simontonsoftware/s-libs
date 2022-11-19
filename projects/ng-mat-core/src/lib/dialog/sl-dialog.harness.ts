import {
  BaseHarnessFilters,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
} from '@angular/cdk/testing';
import { MatLegacyButtonHarness as MatButtonHarness } from '@angular/material/legacy-button/testing';
import { MatLegacyDialogHarness as MatDialogHarness } from '@angular/material/legacy-dialog/testing';
import { DialogButtonColor } from './dialog.component';

interface SlDialogHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
}

/**
 * Harness for interacting with a dialog opened via {@link SlDialogService.open}.
 */
export class SlDialogHarness extends ContentContainerComponentHarness {
  static hostSelector = 'sl-dialog';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a SlDialogHarness that meets certain criteria.
   */
  static with(
    options: SlDialogHarnessFilters,
  ): HarnessPredicate<SlDialogHarness> {
    return new HarnessPredicate(SlDialogHarness, options).addOption(
      'title',
      options.title,
      async (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
    );
  }

  #getContent = this.locatorFor('mat-dialog-content');

  async getTitle(): Promise<string> {
    const title = await this.locatorFor('[mat-dialog-title]')();
    return title.text();
  }

  /**
   * Get the text displayed in the content of the dialog. Note this includes text from both the `text` and `component` options of {@link SlDialogService.open}.
   */
  async getContentText(): Promise<string> {
    const content = await this.#getContent();
    return content.text();
  }

  /**
   * Return the text of all the buttons.
   */
  async getButtonText(): Promise<string[]> {
    const buttons = await this.#getButtons();
    return Promise.all(buttons.map(async (button) => button.getText()));
  }

  /**
   * Return the text of all the buttons. Note that "default" corresponds to when you explicitly specify that color for the button, and is **not** the color of a button when you don't specify a color (see {@link DialogButton.color}).
   */
  async getButtonColors(): Promise<DialogButtonColor[]> {
    const buttons = await this.#getButtons();
    return Promise.all(
      buttons.map(async (button) => {
        const host = await button.host();
        if (await host.hasClass('mat-primary')) {
          return 'primary';
        } else if (await host.hasClass('mat-accent')) {
          return 'accent';
        } else if (await host.hasClass('mat-warn')) {
          return 'warn';
        } else {
          return 'default';
        }
      }),
    );
  }

  async clickButton(text: string): Promise<void> {
    const button = await this.#getButton(text);
    await button.click();
  }

  /**
   * Closes the dialog by pressing escape.
   */
  async close(): Promise<void> {
    const rootLoader =
      await this.documentRootLocatorFactory().rootHarnessLoader();
    const dialog = await rootLoader.getHarness(MatDialogHarness);
    await dialog.close();
  }

  async #getButton(text: string): Promise<MatButtonHarness> {
    const footer = await this.#getFooter();
    return footer.getHarness(MatButtonHarness.with({ text }));
  }

  async #getButtons(): Promise<MatButtonHarness[]> {
    const footer = await this.#getFooter();
    return footer.getAllHarnesses(MatButtonHarness);
  }

  async #getFooter(): Promise<HarnessLoader> {
    return this.getChildLoader('mat-dialog-actions');
  }
}
