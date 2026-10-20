import { AbstractControl } from '@angular/forms';

interface LengthError {
  requiredLength: number;
  actualLength: number;
}

export function fieldError(control: AbstractControl): string | null {
  const errors = control.errors;
  if (!control.touched || !errors) {
    return null;
  }
  if (errors['required']) {
    return $localize`:@@shared.formErrors.required:This field is required`;
  }
  if (errors['maxlength']) {
    const { requiredLength } = errors['maxlength'] as LengthError;
    return $localize`:@@shared.formErrors.maxlength:Must be at most ${requiredLength}:max: characters`;
  }
  if (errors['minlength']) {
    const { requiredLength } = errors['minlength'] as LengthError;
    return $localize`:@@shared.formErrors.minlength:Must be at least ${requiredLength}:min: characters`;
  }
  if (errors['min']) {
    const { min } = errors['min'] as { min: number };
    return $localize`:@@shared.formErrors.min:Must be at least ${min}:min:`;
  }
  if (errors['max']) {
    const { max } = errors['max'] as { max: number };
    return $localize`:@@shared.formErrors.max:Must be at most ${max}:max:`;
  }
  if (errors['email']) {
    return $localize`:@@shared.formErrors.email:Enter a valid email address`;
  }
  return $localize`:@@shared.formErrors.invalid:Invalid value`;
}
