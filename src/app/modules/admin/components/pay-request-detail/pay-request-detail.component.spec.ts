import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayRequestDetailComponent } from './pay-request-detail.component';

describe('PayRequestDetailComponent', () => {
  let component: PayRequestDetailComponent;
  let fixture: ComponentFixture<PayRequestDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayRequestDetailComponent]
    });
    fixture = TestBed.createComponent(PayRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
