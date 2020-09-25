import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RxjsCoreComponent } from './rxjs-core.component';

describe('RxjsCoreComponent', () => {
  let component: RxjsCoreComponent;
  let fixture: ComponentFixture<RxjsCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RxjsCoreComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RxjsCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
