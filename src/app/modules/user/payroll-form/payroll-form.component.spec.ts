import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollFormComponent } from './payroll-form.component';

describe('PayrollFormComponent', () => {
  let component: PayrollFormComponent;
  let fixture: ComponentFixture<PayrollFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollFormComponent]
    });
    fixture = TestBed.createComponent(PayrollFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
