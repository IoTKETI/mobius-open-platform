import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministorComponent } from './administor.component';

describe('AdministorComponent', () => {
  let component: AdministorComponent;
  let fixture: ComponentFixture<AdministorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
