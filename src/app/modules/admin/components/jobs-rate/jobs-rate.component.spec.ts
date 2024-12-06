import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsRateComponent } from './jobs-rate.component';

describe('JobsRateComponent', () => {
  let component: JobsRateComponent;
  let fixture: ComponentFixture<JobsRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobsRateComponent]
    });
    fixture = TestBed.createComponent(JobsRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
