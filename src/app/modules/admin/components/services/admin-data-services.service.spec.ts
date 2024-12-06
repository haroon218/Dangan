import { TestBed } from '@angular/core/testing';

import { AdminDataServicesService } from './admin-data-services.service';

describe('AdminDataServicesService', () => {
  let service: AdminDataServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminDataServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
