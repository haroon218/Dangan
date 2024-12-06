import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetDetailHourlyComponent } from './timesheet-detail-hourly.component';

describe('TimesheetDetailHourlyComponent', () => {
  let component: TimesheetDetailHourlyComponent;
  let fixture: ComponentFixture<TimesheetDetailHourlyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimesheetDetailHourlyComponent]
    });
    fixture = TestBed.createComponent(TimesheetDetailHourlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
