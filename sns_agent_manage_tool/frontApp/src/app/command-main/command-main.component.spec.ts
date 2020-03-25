import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandMainComponent } from './command-main.component';

describe('CommandMainComponent', () => {
  let component: CommandMainComponent;
  let fixture: ComponentFixture<CommandMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommandMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
