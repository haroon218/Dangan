import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { componentGuard } from './component.guard';

describe('componentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => componentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
