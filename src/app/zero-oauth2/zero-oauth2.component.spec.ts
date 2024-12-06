import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroOauth2Component } from './zero-oauth2.component';

describe('ZeroOauth2Component', () => {
  let component: ZeroOauth2Component;
  let fixture: ComponentFixture<ZeroOauth2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZeroOauth2Component]
    });
    fixture = TestBed.createComponent(ZeroOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
