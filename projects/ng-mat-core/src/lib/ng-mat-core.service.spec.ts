import { TestBed } from '@angular/core/testing';

import { NgMatCoreService } from './ng-mat-core.service';

describe('NgMatCoreService', () => {
  let service: NgMatCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgMatCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
