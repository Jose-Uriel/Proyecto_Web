import { TestBed } from '@angular/core/testing';

import { PaypalIntegrationService } from './paypal-integration.service';

describe('PaypalIntegrationService', () => {
  let service: PaypalIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaypalIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
