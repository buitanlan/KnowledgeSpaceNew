import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-protected-zone',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarModule, ButtonModule, MenuModule, ToastModule, AvatarModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <button
              pButton
              type="button"
              icon="pi pi-bars"
              class="p-button-text p-button-rounded"
              (click)="sidebarVisible.set(true)"
            ></button>
            <h1 class="text-xl font-semibold text-gray-800">Knowledge Space Admin</h1>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ authService.userInfo()?.username || 'Admin' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ authService.userInfo()?.email || 'admin@example.com' }}
              </div>
            </div>
            <p-avatar [label]="getInitials()" styleClass="bg-blue-500 text-white" shape="circle" />
            <button
              pButton
              type="button"
              icon="pi pi-sign-out"
              class="p-button-text p-button-rounded"
              pTooltip="Logout"
              (click)="logout()"
            ></button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200 hidden lg:block">
          <nav class="mt-6">
            <div class="px-6 mb-6">
              <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h2>
            </div>

            <div class="space-y-1">
              <!-- Dashboard -->
              <a
                class="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                (click)="navigate('/dashboard')"
              >
                <i class="pi pi-chart-line mr-3 text-gray-400"></i>
                Dashboard
              </a>

              <!-- System Management -->
              @if (
                authService.hasPermission('SystemUser', 'View') ||
                authService.hasPermission('SystemRole', 'View') ||
                authService.hasPermission('SystemFunction', 'View') ||
                authService.hasPermission('SystemPermission', 'View')
              ) {
                <div class="px-6 py-2">
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
                </div>

                @if (authService.hasPermission('SystemUser', 'View')) {
                  <a
                    class="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                    (click)="navigate('/systems/users')"
                  >
                    <i class="pi pi-users mr-3 text-gray-400"></i>
                    User Management
                  </a>
                }

                @if (authService.hasPermission('SystemRole', 'View')) {
                  <a
                    class="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                    (click)="navigate('/systems/roles')"
                  >
                    <i class="pi pi-shield mr-3 text-gray-400"></i>
                    Role Management
                  </a>
                }

                @if (authService.hasPermission('SystemFunction', 'View')) {
                  <a
                    class="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                    (click)="navigate('/systems/functions')"
                  >
                    <i class="pi pi-sitemap mr-3 text-gray-400"></i>
                    Function Management
                  </a>
                }

                @if (authService.hasPermission('SystemPermission', 'View')) {
                  <a
                    class="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                    (click)="navigate('/systems/permissions')"
                  >
                    <i class="pi pi-key mr-3 text-gray-400"></i>
                    Permission Management
                  </a>
                }
              }
            </div>
          </nav>
        </aside>

        <!-- Content Area -->
        <main class="flex-1 lg:ml-0">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Sidebar -->
      <p-sidebar [(visible)]="sidebarVisible" position="left" [modal]="true" styleClass="w-64">
        <ng-template pTemplate="header">
          <h2 class="text-lg font-semibold">Navigation</h2>
        </ng-template>

        <div class="space-y-1">
          <!-- Dashboard -->
          <a
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer rounded"
            (click)="navigate('/dashboard')"
          >
            <i class="pi pi-chart-line mr-3 text-gray-400"></i>
            Dashboard
          </a>

          <!-- System Management -->
          @if (
            authService.hasPermission('SystemUser', 'View') ||
            authService.hasPermission('SystemRole', 'View') ||
            authService.hasPermission('SystemFunction', 'View') ||
            authService.hasPermission('SystemPermission', 'View')
          ) {
            <div class="px-4 py-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
            </div>

            @if (authService.hasPermission('SystemUser', 'View')) {
              <a
                class="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer rounded"
                (click)="navigate('/systems/users')"
              >
                <i class="pi pi-users mr-3 text-gray-400"></i>
                User Management
              </a>
            }

            @if (authService.hasPermission('SystemRole', 'View')) {
              <a
                class="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer rounded"
                (click)="navigate('/systems/roles')"
              >
                <i class="pi pi-shield mr-3 text-gray-400"></i>
                Role Management
              </a>
            }

            @if (authService.hasPermission('SystemFunction', 'View')) {
              <a
                class="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer rounded"
                (click)="navigate('/systems/functions')"
              >
                <i class="pi pi-sitemap mr-3 text-gray-400"></i>
                Function Management
              </a>
            }

            @if (authService.hasPermission('SystemPermission', 'View')) {
              <a
                class="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer rounded"
                (click)="navigate('/systems/permissions')"
              >
                <i class="pi pi-key mr-3 text-gray-400"></i>
                Permission Management
              </a>
            }
          }
        </div>
      </p-sidebar>

      <p-toast />
    </div>
  `
})
export class ProtectedZoneComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  sidebarVisible = signal<boolean>(false);

  navigate(path: string): void {
    this.sidebarVisible.set(false);
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.showInfo('You have been logged out');
  }

  getInitials(): string {
    const userInfo = this.authService.userInfo();
    if (userInfo?.username) {
      return userInfo.username.substring(0, 2).toUpperCase();
    }
    return 'AD';
  }
}
