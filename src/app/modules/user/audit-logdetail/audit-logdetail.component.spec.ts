import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogdetailComponent } from './audit-logdetail.component';

describe('AuditLogdetailComponent', () => {
  let component: AuditLogdetailComponent;
  let fixture: ComponentFixture<AuditLogdetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditLogdetailComponent]
    });
    fixture = TestBed.createComponent(AuditLogdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
