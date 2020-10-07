import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgAppStateComponent } from './ng-app-state.component';

describe('NgAppStateComponent', () => {
  let component: NgAppStateComponent;
  let fixture: ComponentFixture<NgAppStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgAppStateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgAppStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
