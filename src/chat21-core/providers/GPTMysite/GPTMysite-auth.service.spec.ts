import { TestBed } from '@angular/core/testing';

import { GPTMysiteAuthService } from './GPTMysite-auth.service';

describe('GPTMysiteAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GPTMysiteAuthService = TestBed.get(GPTMysiteAuthService);
    expect(service).toBeTruthy();
  });
});
