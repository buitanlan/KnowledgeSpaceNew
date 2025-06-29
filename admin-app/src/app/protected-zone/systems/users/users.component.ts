import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ConfirmationService } from 'primeng/api';
import { UsersService } from '@app/shared/services/users.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob?: Date;
}

export interface CreateUserRequest {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    TagModule,
    BadgeModule
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
            @if (authService.hasPermission('SystemUser', 'Create')) {
              <button
                pButton
                type="button"
                label="New User"
                icon="pi pi-plus"
                class="p-button-sm bg-white text-blue-600 hover:bg-blue-50"
                (click)="openCreateDialog()"
              ></button>
            }
          </div>
        </ng-template>

        <div class="p-4">
          <!-- Search and Filter -->
          <div class="mb-4 flex gap-4 items-center">
            <div class="flex-1">
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="onSearch()"
                  placeholder="Search users..."
                  class="w-full"
                />
              </span>
            </div>
            <button
              pButton
              type="button"
              icon="pi pi-refresh"
              class="p-button-outlined"
              (click)="loadUsers()"
              [loading]="loading()"
            ></button>
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
                @if (authService.hasPermission('SystemUser', 'Update') || authService.hasPermission('SystemUser', 'Delete')) {
                  <th class="text-center">Actions</th>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-user>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
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
                  <p-tag
                    value="Active"
                    severity="success"
                    class="text-xs"
                  />
                </td>
                @if (authService.hasPermission('SystemUser', 'Update') || authService.hasPermission('SystemUser', 'Delete')) {
                  <td class="text-center">
                    <div class="flex justify-center gap-2">
                      @if (authService.hasPermission('SystemUser', 'Update')) {
                        <button
                          pButton
                          type="button"
                          icon="pi pi-pencil"
                          class="p-button-rounded p-button-text p-button-sm"
                          pTooltip="Edit User"
                          (click)="editUser(user)"
                        ></button>
                        <button
                          pButton
                          type="button"
                          icon="pi pi-shield"
                          class="p-button-rounded p-button-text p-button-sm"
                          pTooltip="Manage Permissions"
                          (click)="managePermissions(user)"
                        ></button>
                      }
                      @if (authService.hasPermission('SystemUser', 'Delete')) {
                        <button
                          pButton
                          type="button"
                          icon="pi pi-trash"
                          class="p-button-rounded p-button-text p-button-sm p-button-danger"
                          pTooltip="Delete User"
                          (click)="deleteUser(user)"
                        ></button>
                      }
                    </div>
                  </td>
                }
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
        <form (ngSubmit)="saveUser()" #userForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                pInputText
                [(ngModel)]="userFormData.firstName"
                name="firstName"
                required
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                pInputText
                [(ngModel)]="userFormData.lastName"
                name="lastName"
                required
                class="w-full"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              pInputText
              [(ngModel)]="userFormData.userName"
              name="userName"
              required
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              pInputText
              type="email"
              [(ngModel)]="userFormData.email"
              name="email"
              required
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              pInputText
              [(ngModel)]="userFormData.phoneNumber"
              name="phoneNumber"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              pInputText
              type="date"
              [(ngModel)]="userFormData.dob"
              name="dob"
              required
              class="w-full"
            />
          </div>

          @if (!isEditMode()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                pInputText
                type="password"
                [(ngModel)]="userFormData.password"
                name="password"
                placeholder="Leave empty for default password (User@123)"
                class="w-full"
              />
                                <small class="text-gray-500">Default password: User&#64;123</small>
            </div>
          }
        </form>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button
              pButton
              type="button"
              label="Cancel"
              class="p-button-text"
              (click)="showUserDialog = false"
            ></button>
            <button
              pButton
              type="button"
              [label]="isEditMode() ? 'Update' : 'Create'"
              [loading]="saving()"
              [disabled]="!userForm.valid"
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
  readonly authService = inject(AuthService);

  // Signals
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Form data
  searchTerm = '';
  showUserDialog = false;
  currentUserId = '';

  userFormData: CreateUserRequest = {
    userName: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dob: ''
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.showError('Failed to load users');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(user =>
      user.userName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.resetForm();
    this.showUserDialog = true;
  }

  editUser(user: User): void {
    this.isEditMode.set(true);
    this.currentUserId = user.id;
    this.userFormData = {
      userName: user.userName,
      password: '',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    };
    this.showUserDialog = true;
  }

  saveUser(): void {
    this.saving.set(true);

    if (this.isEditMode()) {
      this.usersService.updateUser(this.currentUserId, this.userFormData).subscribe({
        next: () => {
          this.notificationService.showSuccess('User updated successfully');
          this.showUserDialog = false;
          this.loadUsers();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.notificationService.showError('Failed to update user');
          this.saving.set(false);
        }
      });
    } else {
      this.usersService.createUser(this.userFormData).subscribe({
        next: () => {
          this.notificationService.showSuccess('User created successfully');
          this.showUserDialog = false;
          this.loadUsers();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.notificationService.showError('Failed to create user');
          this.saving.set(false);
        }
      });
    }
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.userName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('User deleted successfully');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.notificationService.showError('Failed to delete user');
          }
        });
      }
    });
  }

  managePermissions(user: User): void {
    this.router.navigate(['/systems/users', user.id, 'permissions']);
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private resetForm(): void {
    this.userFormData = {
      userName: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dob: ''
    };
    this.currentUserId = '';
  }
}
