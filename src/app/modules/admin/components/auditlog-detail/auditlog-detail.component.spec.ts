import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditlogDetailComponent } from './auditlog-detail.component';

describe('AuditlogDetailComponent', () => {
  let component: AuditlogDetailComponent;
  let fixture: ComponentFixture<AuditlogDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditlogDetailComponent]
    });
    fixture = TestBed.createComponent(AuditlogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
