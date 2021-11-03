import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NasModelComponent } from './nas-model.component';

describe('NasModelComponent', () => {
  let component: NasModelComponent;
  let fixture: ComponentFixture<NasModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NasModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NasModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
