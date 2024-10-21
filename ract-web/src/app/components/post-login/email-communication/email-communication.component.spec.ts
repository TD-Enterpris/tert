import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCommunicationComponent } from './email-communication.component';

describe('EmailCommunicationComponent', () => {
  let component: EmailCommunicationComponent;
  let fixture: ComponentFixture<EmailCommunicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailCommunicationComponent]
    });
    fixture = TestBed.createComponent(EmailCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
