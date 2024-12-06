import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigdepartmentComponent } from './configdepartment.component';

describe('ConfigdepartmentComponent', () => {
  let component: ConfigdepartmentComponent;
  let fixture: ComponentFixture<ConfigdepartmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigdepartmentComponent]
    });
    fixture = TestBed.createComponent(ConfigdepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
