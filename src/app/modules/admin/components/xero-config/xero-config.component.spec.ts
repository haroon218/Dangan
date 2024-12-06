import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XeroConfigComponent } from './xero-config.component';

describe('XeroConfigComponent', () => {
  let component: XeroConfigComponent;
  let fixture: ComponentFixture<XeroConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XeroConfigComponent]
    });
    fixture = TestBed.createComponent(XeroConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
