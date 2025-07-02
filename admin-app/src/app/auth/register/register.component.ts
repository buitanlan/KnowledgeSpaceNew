import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
    RouterModule
  ]
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  // Typed reactive form
  registerForm = this.fb.group(
    {
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      dob: ['', Validators.required]
    },
    {
      validators: this.passwordMatchValidator
    }
  );

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  errorMessage(): string | null {
    if (this.registerForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      if (formValue.dob) {
        const utcDate = new Date(formValue.dob);
        formValue.dob = utcDate.toISOString();
      }
      this.authService.register(formValue as RegisterRequest).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registration successful!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', errorMsg);
          this.notificationService.showError(errorMsg);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
