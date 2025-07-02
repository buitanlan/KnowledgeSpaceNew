import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { RolesService } from '@app/shared/services/roles.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';
import { PermissionDirective } from '@app/shared/directives/permission-directive.directive';

export interface Role {
  id: string;
  name: string;
  normalizedName?: string;
  concurrencyStamp?: string;
}

// Type-safe form interface
interface RoleFormData {
  name: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    PermissionDirective
  ],
  template: `
    <div class="p-6">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <div>
              <h1 class="text-2xl font-bold mb-1">Role Management</h1>
              <p class="text-orange-100">Manage system roles and their permissions</p>
            </div>
            <button
              pButton
              type="button"
              label="New Role"
              icon="pi pi-plus"
              class="p-button-sm bg-white text-orange-600 hover:bg-orange-50"
              (click)="openCreateDialog()"
              appPermission
              [appFunction]="'SystemRole'"
              [appAction]="'Create'"
            ></button>
          </div>
        </ng-template>

        <div class="p-4">
          <!-- Roles Table -->
          <p-table
            [value]="roles()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            styleClass="p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="text-left">Role Name</th>
                <th class="text-left">Role ID</th>
                <th class="text-left">Status</th>
                <th class="text-left">Description</th>
                <th class="text-center" appPermission [appFunction]="'SystemRole'" [appAction]="'Update'">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-role>
              <tr>
                <td>
                  <p-tag [value]="role.name" [severity]="getRoleSeverity(role.name)" class="font-medium" />
                </td>
                <td>
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ role.id }}</code>
                </td>
                <td>
                  <p-tag value="Active" severity="success" class="text-xs" />
                </td>
                <td>
                  <span class="text-gray-700">{{ getRoleDescription(role.name) }}</span>
                </td>
                <td class="text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      pButton
                      type="button"
                      icon="pi pi-pencil"
                      class="p-button-text p-button-rounded p-button-sm"
                      pTooltip="Edit"
                      (click)="editRole(role)"
                      [disabled]="role.name === 'Admin'"
                      appPermission
                      [appFunction]="'SystemRole'"
                      [appAction]="'Update'"
                    ></button>
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-text p-button-rounded p-button-sm p-button-danger"
                      pTooltip="Delete"
                      (click)="deleteRole(role.id, role.name)"
                      [disabled]="role.name === 'Admin' || isSystemRole(role.name)"
                      appPermission
                      [appFunction]="'SystemRole'"
                      [appAction]="'Delete'"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center py-8">
                  <div class="text-gray-500">
                    <i class="pi pi-shield text-4xl mb-3 block"></i>
                    <p>No roles found</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>

      <!-- Create/Edit Role Dialog -->
      <p-dialog
        [header]="isEditMode() ? 'Edit Role' : 'Create New Role'"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [(visible)]="showRoleDialog"
        [style]="{ width: '400px' }"
      >
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
            <input pInputText formControlName="name" placeholder="e.g., Manager, Moderator" class="w-full" />
            @if (roleForm.get('name')?.invalid && roleForm.get('name')?.touched) {
              <small class="text-red-500">Role name is required</small>
            }
            <small class="text-gray-500">Enter a descriptive role name</small>
          </div>
        </form>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button pButton type="button" label="Cancel" class="p-button-text" (click)="hideDialog()"></button>
            <button
              pButton
              type="submit"
              [label]="isEditMode() ? 'Update' : 'Create'"
              [loading]="saving()"
              [disabled]="roleForm.invalid"
              (click)="saveRole()"
            ></button>
          </div>
        </ng-template>
      </p-dialog>

      <p-confirmDialog />
      <p-toast />
    </div>
  `
})
export class RolesComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  // Signals
  roles = signal<Role[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Dialog state
  showRoleDialog = false;
  currentRoleId = '';

  // Typed reactive form
  roleForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.notificationService.showError('Failed to load roles');
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.resetForm();
    this.showRoleDialog = true;
  }

  editRole(role: Role): void {
    this.isEditMode.set(true);
    this.currentRoleId = role.id;

    this.roleForm.patchValue({
      name: role.name
    });

    this.showRoleDialog = true;
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formData = this.roleForm.getRawValue();

    if (this.isEditMode()) {
      this.rolesService.updateRole(this.currentRoleId, formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Role updated successfully');
          this.hideDialog();
          this.loadRoles();
        },
        error: (error) => {
          this.notificationService.showError('Failed to update role: ' + error.message);
        },
        complete: () => this.saving.set(false)
      });
    } else {
      this.rolesService.createRole(formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Role created successfully');
          this.hideDialog();
          this.loadRoles();
        },
        error: (error) => {
          this.notificationService.showError('Failed to create role: ' + error.message);
        },
        complete: () => this.saving.set(false)
      });
    }
  }

  deleteRole(roleId: string, roleName: string): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete role "${roleName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rolesService.deleteRole(roleId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Role deleted successfully');
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error deleting role:', error);
            this.notificationService.showError('Failed to delete role');
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
        return 'Full system access and management capabilities';
      case 'manager':
        return 'Content and user management permissions';
      case 'moderator':
        return 'Content moderation and review permissions';
      case 'member':
        return 'Standard user access and basic permissions';
      default:
        return 'Custom role with specific permissions';
    }
  }

  isSystemRole(roleName: string): boolean {
    const systemRoles = ['admin', 'member'];
    return systemRoles.includes(roleName.toLowerCase());
  }

  private resetForm(): void {
    this.roleForm.reset({
      name: ''
    });
  }

  hideDialog(): void {
    this.showRoleDialog = false;
    this.resetForm();
    this.currentRoleId = '';
  }
}
