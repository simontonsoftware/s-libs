import {
  ComponentHarness,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessQuery,
} from '@angular/cdk/testing';

/**
 * Provides some shorthand utilities that component harnesses may want.
 */
export class ComponentHarnessSuperclass extends ContentContainerComponentHarness {
  /**
   * @return whether the given {@link HarnessQuery} matches a component under this component's root element
   */
  protected async hasHarness<T extends ComponentHarness>(
    predicate: HarnessQuery<T>,
  ): Promise<boolean> {
    const all = await this.getAllHarnesses(predicate);
    return all.length > 0;
  }

  /**
   * Searches for an instance of the component corresponding to the given harness type under the document root element, and returns a {@link ComponentHarness} for that instance. If multiple matching components are found, a harness for the first one is returned. If no matching component is found, an error is thrown.
   */
  protected async getTopLevelHarness<T extends ComponentHarness>(
    predicate: HarnessQuery<T>,
  ): Promise<T> {
    const loader = await this.getTopLevelLoader();
    return loader.getHarness(predicate);
  }

  /**
   * Searches for all instances of the component corresponding to the given harness type under the document root element, and returns a list {@link ComponentHarness} for each instance.
   */
  protected async getAllTopLevelHarnesses<T extends ComponentHarness>(
    predicate: HarnessQuery<T>,
  ): Promise<T[]> {
    const loader = await this.getTopLevelLoader();
    return loader.getAllHarnesses(predicate);
  }

  /**
   * Gets a {@link HarnessLoader} for the document root element. This loader can be used for elements that a component creates outside its own root element (e.g. by appending to document.body).
   */
  protected async getTopLevelLoader(): Promise<HarnessLoader> {
    return this.documentRootLocatorFactory().rootHarnessLoader();
  }
}
