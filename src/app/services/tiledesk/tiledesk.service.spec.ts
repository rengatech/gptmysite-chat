import { TestBed } from '@angular/core/testing';

import { GPTMysiteService } from './GPTMysite.service';

describe('GPTMysiteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GPTMysiteService = TestBed.get(GPTMysiteService);
    expect(service).toBeTruthy();
  });
});
