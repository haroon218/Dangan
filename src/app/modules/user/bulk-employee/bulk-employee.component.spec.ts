import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEmployeeComponent } from './bulk-employee.component';

describe('BulkEmployeeComponent', () => {
  let component: BulkEmployeeComponent;
  let fixture: ComponentFixture<BulkEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkEmployeeComponent]
    });
    fixture = TestBed.createComponent(BulkEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
