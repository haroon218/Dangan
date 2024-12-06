import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetDetailComponent } from './time-sheet-detail.component';

describe('TimeSheetDetailComponent', () => {
  let component: TimeSheetDetailComponent;
  let fixture: ComponentFixture<TimeSheetDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeSheetDetailComponent]
    });
    fixture = TestBed.createComponent(TimeSheetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
