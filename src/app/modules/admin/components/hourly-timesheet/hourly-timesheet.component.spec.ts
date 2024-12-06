import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyTimesheetComponent } from './hourly-timesheet.component';

describe('HourlyTimesheetComponent', () => {
  let component: HourlyTimesheetComponent;
  let fixture: ComponentFixture<HourlyTimesheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HourlyTimesheetComponent]
    });
    fixture = TestBed.createComponent(HourlyTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
