import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTabComponent } from './document-tab.component';

describe('DocumentTabComponent', () => {
  let component: DocumentTabComponent;
  let fixture: ComponentFixture<DocumentTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentTabComponent]
    });
    fixture = TestBed.createComponent(DocumentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
