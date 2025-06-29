import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService, LoginRequest } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div class="w-full max-w-md">
        <p-card class="shadow-2xl border-0">
          <ng-template pTemplate="header">
            <div class="text-center py-6">
              <h1 class="text-3xl font-bold text-gray-800 mb-2">Knowledge Space</h1>
              <p class="text-gray-600">Admin Portal</p>
            </div>
          </ng-template>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
            @if (errorMessage()) {
              <p-message severity="error" [text]="errorMessage()" class="w-full" />
            }
            
            <div class="space-y-2">
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                pInputText
                id="username"
                name="username"
                [(ngModel)]="credentials.username"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                [disabled]="authService.loading()"
              />
            </div>
            
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <p-password
                [(ngModel)]="credentials.password"
                name="password"
                inputId="password"
                [feedback]="false"
                [toggleMask]="true"
                placeholder="Enter your password"
                styleClass="w-full"
                inputStyleClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [disabled]="authService.loading()"
                required
              />
            </div>
            
            <button
              pButton
              type="submit"
              label="Sign In"
              [loading]="authService.loading()"
              [disabled]="!loginForm.valid || authService.loading()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            ></button>
          </form>
          
          <ng-template pTemplate="footer">
            <div class="text-center text-sm text-gray-500 space-y-2">
              <p>Default Admin: <strong>admin</strong> / <strong>Admin&#64;123</strong></p>
              <p>Default User: <strong>user</strong> / <strong>User&#64;123</strong></p>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  readonly authService = inject(AuthService);

  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  errorMessage = signal<string>('');

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage.set('Please enter both username and password');
      return;
    }

    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage.set(error.error?.message || 'Invalid username or password');
      }
    });
  }
} 