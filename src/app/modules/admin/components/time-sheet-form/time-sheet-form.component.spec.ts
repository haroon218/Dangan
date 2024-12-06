import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetFormComponent } from './time-sheet-form.component';

describe('TimeSheetFormComponent', () => {
  let component: TimeSheetFormComponent;
  let fixture: ComponentFixture<TimeSheetFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeSheetFormComponent]
    });
    fixture = TestBed.createComponent(TimeSheetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
