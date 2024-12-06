import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetDetailRateComponent } from './timesheet-detail-rate.component';

describe('TimesheetDetailRateComponent', () => {
  let component: TimesheetDetailRateComponent;
  let fixture: ComponentFixture<TimesheetDetailRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimesheetDetailRateComponent]
    });
    fixture = TestBed.createComponent(TimesheetDetailRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
