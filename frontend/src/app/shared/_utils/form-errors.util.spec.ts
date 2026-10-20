import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { fieldError } from './form-errors.util';

describe('fieldError', () => {
  function touchedControl(value: string | number, validators: ValidatorFn[]): FormControl<string | number> {
    const control = new FormControl<string | number>(value, { nonNullable: true, validators });
    control.markAsTouched();
    return control;
  }

  it('shows nothing before the control is touched', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });

    expect(control.invalid).toBe(true);
    expect(fieldError(control)).toBeNull();
  });

  it('shows nothing for a valid touched control', () => {
    expect(fieldError(touchedControl('Printer jam', [Validators.required]))).toBeNull();
  });

  it.each([
    { validator: 'required', value: '', validators: [Validators.required], message: 'This field is required' },
    {
      validator: 'maxlength',
      value: 'abcdef',
      validators: [Validators.maxLength(5)],
      message: 'Must be at most 5 characters',
    },
    {
      validator: 'minlength',
      value: 'ab',
      validators: [Validators.minLength(3)],
      message: 'Must be at least 3 characters',
    },
    { validator: 'min', value: 0, validators: [Validators.min(1)], message: 'Must be at least 1' },
    { validator: 'max', value: 11, validators: [Validators.max(10)], message: 'Must be at most 10' },
    {
      validator: 'email',
      value: 'not-an-email',
      validators: [Validators.email],
      message: 'Enter a valid email address',
    },
  ])('shows a message for $validator', ({ value, validators, message }) => {
    expect(fieldError(touchedControl(value, validators))).toBe(message);
  });
});
