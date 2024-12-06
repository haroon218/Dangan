import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveChangeComponent } from './save-change.component';

describe('SaveChangeComponent', () => {
  let component: SaveChangeComponent;
  let fixture: ComponentFixture<SaveChangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaveChangeComponent]
    });
    fixture = TestBed.createComponent(SaveChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
