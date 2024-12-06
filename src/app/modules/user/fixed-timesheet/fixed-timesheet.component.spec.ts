import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedTimesheetComponent } from './fixed-timesheet.component';

describe('FixedTimesheetComponent', () => {
  let component: FixedTimesheetComponent;
  let fixture: ComponentFixture<FixedTimesheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedTimesheetComponent]
    });
    fixture = TestBed.createComponent(FixedTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
