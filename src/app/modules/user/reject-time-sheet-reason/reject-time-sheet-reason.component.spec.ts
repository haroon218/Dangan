import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectTimeSheetReasonComponent } from './reject-time-sheet-reason.component';

describe('RejectTimeSheetReasonComponent', () => {
  let component: RejectTimeSheetReasonComponent;
  let fixture: ComponentFixture<RejectTimeSheetReasonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RejectTimeSheetReasonComponent]
    });
    fixture = TestBed.createComponent(RejectTimeSheetReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
