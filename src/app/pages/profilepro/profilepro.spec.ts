import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilepro } from './profilepro';

describe('Profilepro', () => {
  let component: Profilepro;
  let fixture: ComponentFixture<Profilepro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profilepro],
    }).compileComponents();

    fixture = TestBed.createComponent(Profilepro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
