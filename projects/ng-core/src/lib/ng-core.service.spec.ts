import { TestBed } from '@angular/core/testing';

import { NgCoreService } from './ng-core.service';

describe('NgCoreService', () => {
  let service: NgCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
