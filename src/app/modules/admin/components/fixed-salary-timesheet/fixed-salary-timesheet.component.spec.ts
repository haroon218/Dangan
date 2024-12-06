import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedSalaryTimesheetComponent } from './fixed-salary-timesheet.component';

describe('FixedSalaryTimesheetComponent', () => {
  let component: FixedSalaryTimesheetComponent;
  let fixture: ComponentFixture<FixedSalaryTimesheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedSalaryTimesheetComponent]
    });
    fixture = TestBed.createComponent(FixedSalaryTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
