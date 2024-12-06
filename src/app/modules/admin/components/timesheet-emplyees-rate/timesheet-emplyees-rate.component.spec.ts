import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEmplyeesRateComponent } from './timesheet-emplyees-rate.component';

describe('TimesheetEmplyeesRateComponent', () => {
  let component: TimesheetEmplyeesRateComponent;
  let fixture: ComponentFixture<TimesheetEmplyeesRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimesheetEmplyeesRateComponent]
    });
    fixture = TestBed.createComponent(TimesheetEmplyeesRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
