import { TestBed } from '@angular/core/testing';

import { NgDevService } from './ng-dev.service';

describe('NgDevService', () => {
  let service: NgDevService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgDevService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
