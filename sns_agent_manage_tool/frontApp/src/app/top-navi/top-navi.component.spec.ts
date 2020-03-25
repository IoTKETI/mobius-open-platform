import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNaviComponent } from './top-navi.component';

describe('TopNaviComponent', () => {
  let component: TopNaviComponent;
  let fixture: ComponentFixture<TopNaviComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopNaviComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNaviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
