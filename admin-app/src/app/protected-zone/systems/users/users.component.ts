import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService } from 'primeng/api';
import { UsersService, User, CreateUserRequest, UpdateUserRequest } from '@app/shared/services/users.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';
import { PermissionDirective } from '@app/shared/directives/permission-directive.directive';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    TagModule,
    BadgeModule,
    PasswordModule,
    PermissionDirective
  ],
  template: `
    <div class="p-6">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div>
              <h1 class="text-2xl font-bold mb-1">User Management</h1>
              <p class="text-blue-100">Manage system users and their permissions</p>
            </div>
            <button
              pButton
              type="button"
              label="New User"
              icon="pi pi-plus"
              class="p-button-sm bg-white text-blue-600 hover:bg-blue-50"
              (click)="openCreateDialog()"
              appPermission
              [appFunction]="'SystemUser'"
              [appAction]="'Create'"
            ></button>
          </div>
        </ng-template>

        <div class="p-4">
          <!-- Search and Filter -->
          <div class="mb-4 flex flex-wrap justify-between items-center gap-">
            <div class="flex items-center gap-2 flex-grow">
              <span class="p-input-icon-left w-full block">
                <input
                  pInputText
                  type="text"
                  [formControl]="searchControl"
                  placeholder="Search users..."
                  class="w-full"
                />
              </span>
            </div>
            <div>
              <button
                pButton
                type="button"
                icon="pi pi-refresh"
                class="min-h-[42px] p-button-outlined h-full"
                (click)="loadUsers()"
                [loading]="loading()"
              ></button>
            </div>
          </div>

          <!-- Users Table -->
          <p-table
            [value]="filteredUsers()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            styleClass="p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="text-left">User Info</th>
                <th class="text-left">Contact</th>
                <th class="text-left">Status</th>
                <th class="text-center" appPermission [appFunction]="'SystemUser'" [appAction]="'Update'">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-user>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
                      >
                        {{ getInitials(user.firstName, user.lastName) }}
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="text-sm text-gray-500">{{ user.userName }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="text-gray-900">{{ user.email }}</div>
                    @if (user.phoneNumber) {
                      <div class="text-sm text-gray-500">{{ user.phoneNumber }}</div>
                    }
                  </div>
                </td>
                <td>
                  <p-tag value="Active" severity="success" class="text-xs" />
                </td>
                <td class="text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      pButton
                      type="button"
                      icon="pi pi-pencil"
                      class="p-button-rounded p-button-text p-button-sm"
                      pTooltip="Edit User"
                      (click)="editUser(user)"
                      appPermission
                      [appFunction]="'SystemUser'"
                      [appAction]="'Update'"
                    ></button>
                    <button
                      pButton
                      type="button"
                      icon="pi pi-shield"
                      class="p-button-rounded p-button-text p-button-sm"
                      pTooltip="Manage Permissions"
                      (click)="managePermissions(user)"
                      appPermission
                      [appFunction]="'SystemUser'"
                      [appAction]="'Update'"
                    ></button>
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-sm p-button-danger"
                      pTooltip="Delete User"
                      (click)="deleteUser(user)"
                      appPermission
                      [appFunction]="'SystemUser'"
                      [appAction]="'Delete'"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center py-8">
                  <div class="text-gray-500">
                    <i class="pi pi-users text-4xl mb-3 block"></i>
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>

      <!-- Create/Edit User Dialog -->
      <p-dialog
        [header]="isEditMode() ? 'Edit User' : 'Create New User'"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [(visible)]="showUserDialog"
        [style]="{ width: '500px' }"
      >
        <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input pInputText formControlName="firstName" placeholder="Enter first name" class="w-full" />
              <small
                class="text-red-500"
                *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched"
              >
                First name is required
              </small>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input pInputText formControlName="lastName" placeholder="Enter last name" class="w-full" />
              <small
                class="text-red-500"
                *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched"
              >
                Last name is required
              </small>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              pInputText
              formControlName="userName"
              placeholder="Enter username"
              class="w-full"
              [disabled]="isEditMode()"
            />
            <small class="text-red-500" *ngIf="userForm.get('userName')?.invalid && userForm.get('userName')?.touched">
              Username is required
            </small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              pInputText
              type="email"
              formControlName="email"
              placeholder="Enter email address"
              class="w-full"
              [disabled]="isEditMode()"
            />
            <small class="text-red-500" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              <ng-container *ngIf="userForm.get('email')?.errors?.['required']"> Email is required </ng-container>
              <ng-container *ngIf="userForm.get('email')?.errors?.['email']">
                Please enter a valid email address
              </ng-container>
            </small>
          </div>

          @if (!isEditMode()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <p-password
                formControlName="password"
                placeholder="Enter password"
                styleClass="w-full"
                inputStyleClass="w-full"
                [toggleMask]="true"
              />
              <small
                class="text-red-500"
                *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched"
              >
                Password is required
              </small>
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input pInputText formControlName="phoneNumber" placeholder="Enter phone number" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input pInputText type="date" formControlName="dob" class="w-full" />
          </div>
        </form>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button
              pButton
              type="button"
              label="Cancel"
              class=" min-h-[42px] p-button-text"
              (click)="hideDialog()"
            ></button>
            <button
              pButton
              type="submit"
              [label]="isEditMode() ? 'Update' : 'Create'"
              [loading]="saving()"
              [disabled]="userForm.invalid"
              (click)="saveUser()"
            ></button>
          </div>
        </ng-template>
      </p-dialog>

      <p-confirmDialog />
      <p-toast />
    </div>
  `
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  // Signals
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Form controls
  searchControl = new FormControl('', { nonNullable: true });
  showUserDialog = false;
  currentUserId = '';

  // Typed reactive form
  userForm = this.fb.group({
    userName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    firstName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    lastName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: this.fb.control('', { nonNullable: true }),
    dob: this.fb.control('', { nonNullable: true })
  });

  ngOnInit(): void {
    this.loadUsers();

    // Subscribe to search control changes
    this.searchControl.valueChanges.subscribe(() => {
      this.onSearch();
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
        this.filteredUsers.set(users);
      },
      error: (error: any) => {
        this.notificationService.showError('Failed to load users: ' + error.message);
      },
      complete: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    const searchTerm = this.searchControl.value.toLowerCase();
    if (!searchTerm) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.userName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    this.filteredUsers.set(filtered);
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.resetForm();
    this.userForm.get('userName')?.enable();
    this.userForm.get('email')?.enable();
    this.showUserDialog = true;
  }

  editUser(user: User): void {
    this.isEditMode.set(true);
    this.currentUserId = user.id;

    // Patch form with user data
    this.userForm.patchValue({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    });

    // Remove password requirement for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('userName')?.disable();
    this.userForm.get('email')?.disable();
    this.showUserDialog = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formData = this.userForm.getRawValue();

    if (this.isEditMode()) {
      // Handle update logic
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob
      };

      this.usersService.updateUser(this.currentUserId, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('User updated successfully');
          this.hideDialog();
          this.loadUsers();
        },
        error: (error: any) => {
          this.notificationService.showError('Failed to update user: ' + error.message);
        },
        complete: () => this.saving.set(false)
      });
    } else {
      // Handle create logic
      const createData: CreateUserRequest = formData;

      this.usersService.createUser(createData).subscribe({
        next: (user: User) => {
          this.notificationService.showSuccess('User created successfully');
          this.hideDialog();
          this.loadUsers();
        },
        error: (error: any) => {
          this.notificationService.showError('Failed to create user: ' + error.message);
        },
        complete: () => this.saving.set(false)
      });
    }
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('User deleted successfully');
            this.loadUsers();
          },
          error: (error: any) => {
            this.notificationService.showError('Failed to delete user: ' + error.message);
          }
        });
      }
    });
  }

  managePermissions(user: User): void {
    this.router.navigate(['/users', user.id, 'roles']);
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  private resetForm(): void {
    this.userForm.reset({
      userName: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dob: ''
    });

    // Reset password validation for create mode
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  hideDialog(): void {
    this.showUserDialog = false;
    this.resetForm();
    this.currentUserId = '';
  }
}
