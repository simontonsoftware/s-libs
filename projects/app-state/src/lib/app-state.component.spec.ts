import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStateComponent } from './app-state.component';

describe('AppStateComponent', () => {
  let component: AppStateComponent;
  let fixture: ComponentFixture<AppStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppStateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
