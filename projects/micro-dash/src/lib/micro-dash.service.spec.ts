import { TestBed } from '@angular/core/testing';

import { MicroDashService } from './micro-dash.service';

describe('MicroDashService', () => {
  let service: MicroDashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicroDashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
