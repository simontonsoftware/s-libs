import {
  BaseHarnessFilters,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
} from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { DialogButtonColor } from './dialog.component';

interface SlDialogHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
}

export class SlDialogHarness extends ContentContainerComponentHarness {
  static hostSelector = 'sl-dialog';

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

  async getContentText(): Promise<string> {
    const content = await this.#getContent();
    return content.text();
  }

  async getButtonText(): Promise<string[]> {
    const buttons = await this.#getButtons();
    return Promise.all(buttons.map(async (button) => button.getText()));
  }

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
