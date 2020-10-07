import { TestBed } from '@angular/core/testing';

import { NgAppStateService } from './ng-app-state.service';

describe('NgAppStateService', () => {
  let service: NgAppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgAppStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
