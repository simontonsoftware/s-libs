import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgVitest } from './ng-vitest';

describe('NgVitest', () => {
  let component: NgVitest;
  let fixture: ComponentFixture<NgVitest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVitest],
    }).compileComponents();

    fixture = TestBed.createComponent(NgVitest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
