import {
  BaseHarnessFilters,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
} from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { DialogButtonColor } from './dialog.component';

interface DialogComponentHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
}

export class DialogComponentHarness extends ContentContainerComponentHarness {
  static hostSelector = 'sl-dialog';

  private getContent = this.locatorFor('mat-dialog-content');

  static with(
    options: DialogComponentHarnessFilters,
  ): HarnessPredicate<DialogComponentHarness> {
    return new HarnessPredicate(DialogComponentHarness, options).addOption(
      'title',
      options.title,
      async (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
    );
  }

  async getTitle(): Promise<string> {
    const title = await this.locatorFor('[mat-dialog-title]')();
    return title.text();
  }

  async getContentText(): Promise<string> {
    const content = await this.getContent();
    return content.text();
  }

  async getButtonText(): Promise<string[]> {
    const buttons = await this.getButtons();
    return Promise.all(buttons.map(async (button) => button.getText()));
  }

  async getButtonColors(): Promise<DialogButtonColor[]> {
    const buttons = await this.getButtons();
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

  async getButtonCssValue(text: string, property: string): Promise<string> {
    const button = await this.getButton(text);
    const buttonHost = await button.host();
    return buttonHost.getCssValue(property);
  }

  async clickButton(text: string): Promise<void> {
    const button = await this.getButton(text);
    await button.click();
  }

  async getContentScroll(): Promise<number> {
    const content = await this.getContent();
    const scrollTop = await content.getCssValue('scrollTop');
    return +scrollTop;
  }

  async close(): Promise<void> {
    const rootLoader =
      await this.documentRootLocatorFactory().rootHarnessLoader();
    const dialog = await rootLoader.getHarness(MatDialogHarness);
    await dialog.close();
  }

  private async getButton(text: string): Promise<MatButtonHarness> {
    const footer = await this.getFooter();
    return footer.getHarness(MatButtonHarness.with({ text }));
  }

  private async getButtons(): Promise<MatButtonHarness[]> {
    const footer = await this.getFooter();
    return footer.getAllHarnesses(MatButtonHarness);
  }

  private async getFooter(): Promise<HarnessLoader> {
    return this.getChildLoader('mat-dialog-actions');
  }
}
