import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcheckComponent } from './healthcheck.component';

describe('HealthcheckComponent', () => {
  let component: HealthcheckComponent;
  let fixture: ComponentFixture<HealthcheckComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HealthcheckComponent]
    });
    fixture = TestBed.createComponent(HealthcheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
