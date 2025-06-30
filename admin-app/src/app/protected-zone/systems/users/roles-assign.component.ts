import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UsersService } from '@app/shared/services/users.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';

export interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-roles-assign',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    MultiSelectModule,
    ToastModule,
    ConfirmDialogModule
  ],
  template: `
    <div class="p-6">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div>
              <h1 class="text-2xl font-bold mb-1">User Role Management</h1>
              <p class="text-indigo-100">Manage roles for user: {{ userName() }}</p>
            </div>
            <button
              pButton
              type="button"
              label="Back to Users"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
              (click)="goBack()"
            ></button>
          </div>
        </ng-template>

        <div class="p-4">
          @if (loading()) {
            <div class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
              <p class="mt-2 text-gray-600">Loading user roles...</p>
            </div>
          } @else {
            <!-- Current Roles -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Current Roles</h3>
              @if (userRoles().length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (role of userRoles(); track role) {
                    <p-tag [value]="role" [severity]="getRoleSeverity(role)" class="text-sm" />
                  }
                </div>
              } @else {
                <p class="text-gray-500 italic">No roles assigned</p>
              }
            </div>

            <!-- Assign New Roles -->
            @if (authService.hasPermission('SystemUser', 'Update')) {
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Assign Roles</h3>
                <div class="flex gap-4 items-end">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Available Roles</label>
                    <p-multiSelect
                      [(ngModel)]="selectedRoles"
                      [options]="availableRoles()"
                      optionLabel="name"
                      optionValue="name"
                      placeholder="Select roles to assign"
                      class="w-full"
                      [filter]="true"
                    />
                  </div>
                  <button
                    pButton
                    type="button"
                    label="Assign Roles"
                    icon="pi pi-plus"
                    [disabled]="selectedRoles.length === 0"
                    [loading]="saving()"
                    (click)="assignRoles()"
                  ></button>
                </div>
              </div>
            }

            <!-- Role Management Table -->
            <div>
              <h3 class="text-lg font-semibold mb-3">Role Details</h3>
              <p-table [value]="roleDetails()" styleClass="p-datatable-striped">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    @if (authService.hasPermission('SystemUser', 'Update')) {
                      <th class="text-center">Actions</th>
                    }
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-role>
                  <tr>
                    <td>
                      <p-tag [value]="role.name" [severity]="getRoleSeverity(role.name)" class="font-medium" />
                    </td>
                    <td>{{ getRoleDescription(role.name) }}</td>
                    <td>
                      <p-tag value="Active" severity="success" class="text-xs" />
                    </td>
                    @if (authService.hasPermission('SystemUser', 'Update')) {
                      <td class="text-center">
                        <button
                          pButton
                          type="button"
                          icon="pi pi-trash"
                          class="p-button-text p-button-rounded p-button-sm p-button-danger"
                          pTooltip="Remove Role"
                          [disabled]="role.name === 'Admin' && isOnlyAdmin()"
                          (click)="removeRole(role.name)"
                        ></button>
                      </td>
                    }
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center py-8">
                      <div class="text-gray-500">
                        <i class="pi pi-users text-4xl mb-3 block"></i>
                        <p>No roles assigned to this user</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          }
        </div>
      </p-card>

      <p-confirmDialog />
      <p-toast />
    </div>
  `
})
export class RolesAssignComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly authService = inject(AuthService);

  // Signals
  userId = signal<string>('');
  userName = signal<string>('');
  userRoles = signal<string[]>([]);
  availableRoles = signal<Role[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  // Form data
  selectedRoles: string[] = [];

  // Computed
  roleDetails = signal<Role[]>([]);

  ngOnInit(): void {
    this.userId.set(this.route.snapshot.params['id']);
    this.loadUserData();
    this.loadAvailableRoles();
  }

  loadUserData(): void {
    this.loading.set(true);
    const userId = this.userId();

    Promise.all([this.usersService.getUserById(userId).toPromise(), this.usersService.getUserRoles(userId).toPromise()])
      .then(([user, roles]) => {
        if (user) {
          this.userName.set(`${user.firstName} ${user.lastName}`);
        }
        this.userRoles.set(roles || []);
        this.updateRoleDetails(roles || []);
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
        this.notificationService.showError('Failed to load user data');
        this.loading.set(false);
      });
  }

  loadAvailableRoles(): void {
    // Mock available roles - in real app, this would come from an API
    this.availableRoles.set([
      { id: 'Admin', name: 'Admin' },
      { id: 'Member', name: 'Member' },
      { id: 'Manager', name: 'Manager' },
      { id: 'Moderator', name: 'Moderator' }
    ]);
  }

  private updateRoleDetails(roles: string[]): void {
    const details = roles.map((roleName) => ({
      id: roleName,
      name: roleName
    }));
    this.roleDetails.set(details);
  }

  assignRoles(): void {
    this.saving.set(true);

    this.usersService.assignRolesToUser(this.userId(), this.selectedRoles).subscribe({
      next: () => {
        this.notificationService.showSuccess('Roles assigned successfully');
        this.selectedRoles = [];
        this.loadUserData();
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error assigning roles:', error);
        this.notificationService.showError('Failed to assign roles');
        this.saving.set(false);
      }
    });
  }

  removeRole(roleName: string): void {
    this.confirmationService.confirm({
      message: `Remove role "${roleName}" from this user?`,
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.removeRolesFromUser(this.userId(), [roleName]).subscribe({
          next: () => {
            this.notificationService.showSuccess('Role removed successfully');
            this.loadUserData();
          },
          error: (error) => {
            console.error('Error removing role:', error);
            this.notificationService.showError('Failed to remove role');
          }
        });
      }
    });
  }

  getRoleSeverity(roleName: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'moderator':
        return 'info';
      case 'member':
        return 'success';
      default:
        return 'info';
    }
  }

  getRoleDescription(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'Full system access and management';
      case 'manager':
        return 'Content and user management';
      case 'moderator':
        return 'Content moderation and review';
      case 'member':
        return 'Basic user access';
      default:
        return 'Standard user role';
    }
  }

  isOnlyAdmin(): boolean {
    const userRoles = this.userRoles();
    return userRoles.includes('Admin') && userRoles.length === 1;
  }

  goBack(): void {
    this.router.navigate(['/systems/users']);
  }
}
