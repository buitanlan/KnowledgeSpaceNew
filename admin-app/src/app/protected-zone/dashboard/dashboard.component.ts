import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome to the Knowledge Space Admin Portal</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- User Management Card -->
        @if (authService.hasPermission('SystemUser', 'View')) {
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Users</h3>
                    <p class="text-sm text-gray-500">Manage system users</p>
                  </div>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-users"
                    class="p-button-text p-button-rounded p-button-lg text-blue-600"
                    (click)="navigate('/systems/users')"
                  ></button>
                </div>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-sm text-gray-600">Click to manage users and their permissions</p>
            </div>
          </p-card>
        }

        <!-- Role Management Card -->
        @if (authService.hasPermission('SystemRole', 'View')) {
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Roles</h3>
                    <p class="text-sm text-gray-500">Manage user roles</p>
                  </div>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-shield"
                    class="p-button-text p-button-rounded p-button-lg text-green-600"
                    (click)="navigate('/systems/roles')"
                  ></button>
                </div>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-sm text-gray-600">Create and manage system roles</p>
            </div>
          </p-card>
        }

        <!-- Function Management Card -->
        @if (authService.hasPermission('SystemFunction', 'View')) {
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Functions</h3>
                    <p class="text-sm text-gray-500">Manage system functions</p>
                  </div>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-sitemap"
                    class="p-button-text p-button-rounded p-button-lg text-purple-600"
                    (click)="navigate('/systems/functions')"
                  ></button>
                </div>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-sm text-gray-600">Configure system functions and hierarchy</p>
            </div>
          </p-card>
        }

        <!-- Permission Management Card -->
        @if (authService.hasPermission('SystemPermission', 'View')) {
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Permissions</h3>
                    <p class="text-sm text-gray-500">Manage permissions</p>
                  </div>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-key"
                    class="p-button-text p-button-rounded p-button-lg text-orange-600"
                    (click)="navigate('/systems/permissions')"
                  ></button>
                </div>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-sm text-gray-600">Assign and manage user permissions</p>
            </div>
          </p-card>
        }
      </div>

      <!-- System Information -->
      <div class="mt-8">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-6 pb-0">
              <h3 class="text-lg font-semibold text-gray-900">System Information</h3>
            </div>
          </ng-template>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <i class="pi pi-server text-3xl text-blue-500 mb-2"></i>
              <h4 class="font-semibold text-gray-900">Backend Server</h4>
              <p class="text-sm text-gray-600">Knowledge Space API</p>
            </div>
            <div class="text-center">
              <i class="pi pi-database text-3xl text-green-500 mb-2"></i>
              <h4 class="font-semibold text-gray-900">Database</h4>
              <p class="text-sm text-gray-600">SQL Server</p>
            </div>
            <div class="text-center">
              <i class="pi pi-shield text-3xl text-orange-500 mb-2"></i>
              <h4 class="font-semibold text-gray-900">Authentication</h4>
              <p class="text-sm text-gray-600">JWT Token Based</p>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  navigate(path: string): void {
    this.router.navigate([path]);
  }
} 