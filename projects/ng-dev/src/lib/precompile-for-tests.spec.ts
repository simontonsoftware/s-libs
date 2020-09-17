import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { precompileForTests } from './precompile-for-tests';

@Injectable({ providedIn: 'root' })
class ProvidedInRoot {
  counter = 0;
}

@Injectable()
class ProvidedInModule {
  counter = 0;
}

@Injectable()
class ProvidedInComponent {
  counter = 0;
}

@Pipe({ name: 'excited' })
class ExcitedPipe implements PipeTransform {
  transform(value: any): string {
    return value.toString() + '!';
  }
}

@Component({
  template:
    "{{ 'I exist' | excited }} Created {{ providedInComponent.counter }} time(s).",
  providers: [ProvidedInComponent],
})
class AComponent {
  constructor(public providedInComponent: ProvidedInComponent) {
    ++providedInComponent.counter;
  }
}

@NgModule({ imports: [BrowserModule] })
class SecondaryModule {}

@NgModule({
  imports: [BrowserModule, SecondaryModule],
  declarations: [AComponent, ExcitedPipe],
  providers: [ProvidedInModule],
})
class MainModule {}

describe('precompileForTests()', () => {
  // tslint:disable-next-line:deprecation
  precompileForTests([MainModule]);

  async function initComponent(): Promise<ComponentFixture<AComponent>> {
    TestBed.configureTestingModule({ imports: [MainModule] });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(AComponent);
    fixture.detectChanges();
    return fixture;
  }

  /////////

  it('allows components', async () => {
    const fixture = await initComponent();
    expect(fixture.nativeElement.textContent).toContain('I exist!');
  });

  it('allows declaring only a component', async () => {
    TestBed.configureTestingModule({ declarations: [AComponent, ExcitedPipe] });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(AComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('I exist!');
  });

  for (let i = 0; i < 3; ++i) {
    it(`allows clearing service state between tests, iteration ${i}`, async () => {
      const fixture = await initComponent();
      const providedInRoot = TestBed.inject(ProvidedInRoot);
      const providedInModule = TestBed.inject(ProvidedInModule);

      ++providedInRoot.counter;
      ++providedInModule.counter;

      expect(providedInRoot.counter).toBe(1);
      expect(providedInModule.counter).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('Created 1 time(s).');
    });
  }
});
