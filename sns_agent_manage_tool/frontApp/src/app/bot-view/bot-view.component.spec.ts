import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotViewComponent } from './bot-view.component';

describe('BotViewComponent', () => {
  let component: BotViewComponent;
  let fixture: ComponentFixture<BotViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
