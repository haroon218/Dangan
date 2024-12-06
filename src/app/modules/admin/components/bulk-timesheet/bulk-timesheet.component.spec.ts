import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTimesheetComponent } from './bulk-timesheet.component';

describe('BulkTimesheetComponent', () => {
  let component: BulkTimesheetComponent;
  let fixture: ComponentFixture<BulkTimesheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkTimesheetComponent]
    });
    fixture = TestBed.createComponent(BulkTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
