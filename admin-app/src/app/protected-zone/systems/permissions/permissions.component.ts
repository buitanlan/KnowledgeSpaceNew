import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PermissionsService } from '@app/shared/services/permissions.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';
import { PermissionDirective } from '@app/shared/directives/permission-directive.directive';

export interface Permission {
  functionId: string;
  functionName: string;
  commandId: string;
  commandName: string;
  roleId: string;
  roleName: string;
}

export interface Function {
  id: string;
  name: string;
  parentId?: string;
  url?: string;
  icon?: string;
  sortOrder?: number;
}

export interface Command {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
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
          <div class="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <div>
              <h1 class="text-2xl font-bold mb-1">Permission Management</h1>
              <p class="text-purple-100">Manage role-based permissions for system functions</p>
            </div>
            @if (authService.hasPermission('SystemPermission', 'Create')) {
              <button
                pButton
                type="button"
                label="Assign Permission"
                icon="pi pi-plus"
                class="p-button-sm bg-white text-purple-600 hover:bg-purple-50"
                (click)="openAssignDialog()"
              ></button>
            }
          </div>
        </ng-template>

        <div class="p-4">
          <!-- Filters -->
          <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role Filter</label>
              <p-dropdown
                [(ngModel)]="selectedRoleFilter"
                [options]="roleOptions()"
                optionLabel="name"
                optionValue="id"
                placeholder="All Roles"
                [showClear]="true"
                class="w-full"
                (onChange)="applyFilters()"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Function Filter</label>
              <p-dropdown
                [(ngModel)]="selectedFunctionFilter"
                [options]="functionOptions()"
                optionLabel="name"
                optionValue="id"
                placeholder="All Functions"
                [showClear]="true"
                class="w-full"
                (onChange)="applyFilters()"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Command Filter</label>
              <p-dropdown
                [(ngModel)]="selectedCommandFilter"
                [options]="commandOptions()"
                optionLabel="name"
                optionValue="id"
                placeholder="All Commands"
                [showClear]="true"
                class="w-full"
                (onChange)="applyFilters()"
              />
            </div>
          </div>

          <!-- Permissions Table -->
          <p-table
            [value]="filteredPermissions()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            styleClass="p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="text-left">Role</th>
                <th class="text-left">Function</th>
                <th class="text-left">Commands</th>
                @if (authService.hasPermission('SystemPermission', 'Delete')) {
                  <th class="text-center">Actions</th>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-group>
              <tr>
                <td>
                  <p-tag [value]="group.roleName" [severity]="getRoleSeverity(group.roleName)" class="font-medium" />
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    @if (group.functionIcon) {
                      <i [class]="'pi ' + group.functionIcon + ' text-gray-600'"></i>
                    }
                    <span class="font-medium">{{ group.functionName }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for (command of group.commands; track command.id) {
                      <p-tag [value]="command.name" severity="info" class="text-xs" />
                    }
                  </div>
                </td>
                @if (authService.hasPermission('SystemPermission', 'Delete')) {
                  <td class="text-center">
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-sm p-button-danger"
                      pTooltip="Remove Permission"
                      (click)="removePermission(group)"
                    ></button>
                  </td>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center py-8">
                  <div class="text-gray-500">
                    <i class="pi pi-shield text-4xl mb-3 block"></i>
                    <p>No permissions found</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>

      <!-- Assign Permission Dialog -->
      <p-dialog
        header="Assign Permission"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [(visible)]="showAssignDialog"
        [style]="{ width: '500px' }"
      >
        <form (ngSubmit)="assignPermission()" #permissionForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p-dropdown
              [(ngModel)]="assignFormData.roleId"
              name="roleId"
              [options]="roleOptions()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Role"
              required
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Function</label>
            <p-dropdown
              [(ngModel)]="assignFormData.functionId"
              name="functionId"
              [options]="functionOptions()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Function"
              required
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Commands</label>
            <p-multiSelect
              [(ngModel)]="assignFormData.commandIds"
              name="commandIds"
              [options]="commandOptions()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Commands"
              required
              class="w-full"
            />
          </div>
        </form>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button
              pButton
              type="button"
              label="Cancel"
              class="p-button-text"
              (click)="showAssignDialog = false"
            ></button>
            <button
              pButton
              type="button"
              label="Assign"
              [loading]="saving()"
              [disabled]="!permissionForm.valid"
              (click)="assignPermission()"
            ></button>
          </div>
        </ng-template>
      </p-dialog>

      <p-confirmDialog />
      <p-toast />
    </div>
  `
})
export class PermissionsComponent implements OnInit {
  private readonly permissionsService = inject(PermissionsService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly authService = inject(AuthService);

  // Signals
  permissions = signal<Permission[]>([]);
  filteredPermissions = signal<any[]>([]);
  functions = signal<Function[]>([]);
  commands = signal<Command[]>([]);
  roles = signal<Role[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  // Computed options
  roleOptions = signal<Role[]>([]);
  functionOptions = signal<Function[]>([]);
  commandOptions = signal<Command[]>([]);

  // Filters
  selectedRoleFilter: string | null = null;
  selectedFunctionFilter: string | null = null;
  selectedCommandFilter: string | null = null;

  // Form data
  showAssignDialog = false;
  assignFormData = {
    roleId: '',
    functionId: '',
    commandIds: [] as string[]
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load all data in parallel
    Promise.all([
      this.permissionsService.getPermissions().toPromise(),
      this.permissionsService.getFunctions().toPromise(),
      this.permissionsService.getCommands().toPromise(),
      this.permissionsService.getRoles().toPromise()
    ])
      .then(([permissions, functions, commands, roles]) => {
        this.permissions.set(permissions || []);
        this.functions.set(functions || []);
        this.commands.set(commands || []);
        this.roles.set(roles || []);

        this.roleOptions.set(roles || []);
        this.functionOptions.set(functions || []);
        this.commandOptions.set(commands || []);

        this.applyFilters();
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        this.notificationService.showError('Failed to load permissions data');
        this.loading.set(false);
      });
  }

  applyFilters(): void {
    let filtered = this.permissions();

    if (this.selectedRoleFilter) {
      filtered = filtered.filter((p) => p.roleId === this.selectedRoleFilter);
    }
    if (this.selectedFunctionFilter) {
      filtered = filtered.filter((p) => p.functionId === this.selectedFunctionFilter);
    }
    if (this.selectedCommandFilter) {
      filtered = filtered.filter((p) => p.commandId === this.selectedCommandFilter);
    }

    // Group by role and function
    const grouped = this.groupPermissions(filtered);
    this.filteredPermissions.set(grouped);
  }

  private groupPermissions(permissions: Permission[]): any[] {
    const groups = new Map();

    permissions.forEach((permission) => {
      const key = `${permission.roleId}_${permission.functionId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          roleId: permission.roleId,
          roleName: permission.roleName,
          functionId: permission.functionId,
          functionName: permission.functionName,
          commands: []
        });
      }

      groups.get(key).commands.push({
        id: permission.commandId,
        name: permission.commandName
      });
    });

    return Array.from(groups.values());
  }

  openAssignDialog(): void {
    this.assignFormData = {
      roleId: '',
      functionId: '',
      commandIds: []
    };
    this.showAssignDialog = true;
  }

  assignPermission(): void {
    this.saving.set(true);

    this.permissionsService
      .assignPermissions({
        roleId: this.assignFormData.roleId,
        functionId: this.assignFormData.functionId,
        commandIds: this.assignFormData.commandIds
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Permissions assigned successfully');
          this.showAssignDialog = false;
          this.loadData();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error assigning permissions:', error);
          this.notificationService.showError('Failed to assign permissions');
          this.saving.set(false);
        }
      });
  }

  removePermission(group: any): void {
    this.confirmationService.confirm({
      message: `Remove all permissions for "${group.roleName}" on "${group.functionName}"?`,
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.permissionsService.removePermissions(group.roleId, group.functionId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Permissions removed successfully');
            this.loadData();
          },
          error: (error) => {
            console.error('Error removing permissions:', error);
            this.notificationService.showError('Failed to remove permissions');
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
      case 'member':
        return 'info';
      default:
        return 'success';
    }
  }
}
