import { TestBed } from '@angular/core/testing';

import { RxjsCoreService } from './rxjs-core.service';

describe('RxjsCoreService', () => {
  let service: RxjsCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RxjsCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
