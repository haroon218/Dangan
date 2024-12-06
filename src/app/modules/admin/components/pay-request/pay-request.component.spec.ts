import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayRequestComponent } from './pay-request.component';

describe('PayRequestComponent', () => {
  let component: PayRequestComponent;
  let fixture: ComponentFixture<PayRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayRequestComponent]
    });
    fixture = TestBed.createComponent(PayRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
