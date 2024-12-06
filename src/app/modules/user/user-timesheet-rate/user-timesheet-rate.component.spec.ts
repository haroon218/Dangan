import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTimesheetRateComponent } from './user-timesheet-rate.component';

describe('UserTimesheetRateComponent', () => {
  let component: UserTimesheetRateComponent;
  let fixture: ComponentFixture<UserTimesheetRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserTimesheetRateComponent]
    });
    fixture = TestBed.createComponent(UserTimesheetRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
