import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeListComponent } from './ae-list.component';

describe('AeListComponent', () => {
  let component: AeListComponent;
  let fixture: ComponentFixture<AeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
