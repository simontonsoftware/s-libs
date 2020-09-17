import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDevComponent } from './ng-dev.component';

describe('NgDevComponent', () => {
  let component: NgDevComponent;
  let fixture: ComponentFixture<NgDevComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgDevComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
