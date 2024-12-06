import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedepartmentComponent } from './createdepartment.component';

describe('CreatedepartmentComponent', () => {
  let component: CreatedepartmentComponent;
  let fixture: ComponentFixture<CreatedepartmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreatedepartmentComponent]
    });
    fixture = TestBed.createComponent(CreatedepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
