import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentconfigComponent } from './departmentconfig.component';

describe('DepartmentconfigComponent', () => {
  let component: DepartmentconfigComponent;
  let fixture: ComponentFixture<DepartmentconfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DepartmentconfigComponent]
    });
    fixture = TestBed.createComponent(DepartmentconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
