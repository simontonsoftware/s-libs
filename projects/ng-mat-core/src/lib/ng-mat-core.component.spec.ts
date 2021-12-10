import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMatCoreComponent } from './ng-mat-core.component';

describe('NgMatCoreComponent', () => {
  let component: NgMatCoreComponent;
  let fixture: ComponentFixture<NgMatCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgMatCoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgMatCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
