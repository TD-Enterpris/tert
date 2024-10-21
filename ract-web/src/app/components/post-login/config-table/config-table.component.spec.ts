import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigTableComponent } from './config-table.component';

describe('ConfigTableComponent', () => {
  let component: ConfigTableComponent;
  let fixture: ComponentFixture<ConfigTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigTableComponent]
    });
    fixture = TestBed.createComponent(ConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
