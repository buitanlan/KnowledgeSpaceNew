import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TreeTableModule } from 'primeng/treetable';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FunctionsService } from '@app/shared/services/functions.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { AuthService } from '@app/shared/services/auth.service';

export interface Function {
  id: string;
  name: string;
  parentId?: string;
  url?: string;
  icon?: string;
  sortOrder?: number;
}

export interface FunctionTreeNode {
  data: Function;
  children?: FunctionTreeNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-functions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    DialogModule,
    CardModule,
    TreeTableModule,
    ToastModule,
    ConfirmDialogModule
  ],
  template: `
    <div class="p-6">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <div>
              <h1 class="text-2xl font-bold mb-1">Function Management</h1>
              <p class="text-green-100">Manage system functions and menu structure</p>
            </div>
            @if (authService.hasPermission('SystemFunction', 'Create')) {
              <button 
                pButton 
                type="button" 
                label="New Function" 
                icon="pi pi-plus"
                class="p-button-sm bg-white text-green-600 hover:bg-green-50"
                (click)="openCreateDialog()"
              ></button>
            }
          </div>
        </ng-template>

        <div class="p-4">
          <!-- Functions Tree Table -->
          <p-treeTable 
            [value]="functionTree()" 
            [loading]="loading()"
            [columns]="columns"
            styleClass="p-treetable-sm"
          >
            <ng-template pTemplate="header" let-columns>
              <tr>
                @for (col of columns; track col.field) {
                  <th [style.width]="col.width">{{ col.header }}</th>
                }
                @if (authService.hasPermission('SystemFunction', 'Update') || authService.hasPermission('SystemFunction', 'Delete')) {
                  <th class="text-center" style="width: 150px">Actions</th>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
              <tr>
                <td>
                  <p-treeTableToggler [rowNode]="rowNode" />
                  <div class="flex items-center gap-2 ml-2">
                    @if (rowData.icon) {
                      <i [class]="'pi ' + rowData.icon + ' text-gray-600'"></i>
                    }
                    <span class="font-medium">{{ rowData.name }}</span>
                  </div>
                </td>
                <td>
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ rowData.id }}</code>
                </td>
                <td>
                  @if (rowData.url) {
                    <span class="text-blue-600">{{ rowData.url }}</span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
                <td class="text-center">
                  @if (rowData.sortOrder) {
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {{ rowData.sortOrder }}
                    </span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
                @if (authService.hasPermission('SystemFunction', 'Update') || authService.hasPermission('SystemFunction', 'Delete')) {
                  <td class="text-center">
                    <div class="flex justify-center gap-2">
                      @if (authService.hasPermission('SystemFunction', 'Update')) {
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-pencil"
                          class="p-button-rounded p-button-text p-button-sm"
                          pTooltip="Edit Function"
                          (click)="editFunction(rowData)"
                        ></button>
                      }
                      @if (authService.hasPermission('SystemFunction', 'Delete')) {
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-trash"
                          class="p-button-rounded p-button-text p-button-sm p-button-danger"
                          pTooltip="Delete Function"
                          (click)="deleteFunction(rowData)"
                        ></button>
                      }
                    </div>
                  </td>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td [attr.colspan]="columns.length + 1" class="text-center py-8">
                  <div class="text-gray-500">
                    <i class="pi pi-sitemap text-4xl mb-3 block"></i>
                    <p>No functions found</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-treeTable>
        </div>
      </p-card>

      <!-- Create/Edit Function Dialog -->
      <p-dialog 
        [header]="isEditMode() ? 'Edit Function' : 'Create New Function'"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [(visible)]="showFunctionDialog"
        [style]="{ width: '500px' }"
      >
        <form (ngSubmit)="saveFunction()" #functionForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Function ID</label>
            <input 
              pInputText 
              [(ngModel)]="functionFormData.id"
              name="id"
              required
              [disabled]="isEditMode()"
              placeholder="e.g., SystemUser, Dashboard"
              class="w-full"
            />
            <small class="text-gray-500">Unique identifier for the function</small>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
            <input 
              pInputText 
              [(ngModel)]="functionFormData.name"
              name="name"
              required
              placeholder="e.g., User Management, Dashboard"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Parent Function</label>
            <p-dropdown 
              [(ngModel)]="functionFormData.parentId"
              name="parentId"
              [options]="parentFunctionOptions()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Parent (optional)"
              [showClear]="true"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input 
              pInputText 
              [(ngModel)]="functionFormData.url"
              name="url"
              placeholder="e.g., /systems/users"
              class="w-full"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input 
                pInputText 
                [(ngModel)]="functionFormData.icon"
                name="icon"
                placeholder="e.g., pi-users"
                class="w-full"
              />
              <small class="text-gray-500">PrimeIcons class name</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <p-inputNumber 
                [(ngModel)]="functionFormData.sortOrder"
                name="sortOrder"
                [min]="0"
                class="w-full"
              />
            </div>
          </div>
        </form>
        
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button 
              pButton 
              type="button" 
              label="Cancel"
              class="p-button-text"
              (click)="showFunctionDialog = false"
            ></button>
            <button 
              pButton 
              type="button"
              [label]="isEditMode() ? 'Update' : 'Create'"
              [loading]="saving()"
              [disabled]="!functionForm.valid"
              (click)="saveFunction()"
            ></button>
          </div>
        </ng-template>
      </p-dialog>

      <p-confirmDialog />
      <p-toast />
    </div>
  `
})
export class FunctionsComponent implements OnInit {
  private readonly functionsService = inject(FunctionsService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly authService = inject(AuthService);

  // Signals
  functions = signal<Function[]>([]);
  functionTree = signal<FunctionTreeNode[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Table configuration
  columns = [
    { field: 'name', header: 'Name', width: '30%' },
    { field: 'id', header: 'ID', width: '25%' },
    { field: 'url', header: 'URL', width: '30%' },
    { field: 'sortOrder', header: 'Order', width: '15%' }
  ];

  // Form data
  showFunctionDialog = false;
  currentFunctionId = '';
  
  functionFormData: Function = {
    id: '',
    name: '',
    parentId: '',
    url: '',
    icon: '',
    sortOrder: 0
  };

  // Parent function options (computed)
  parentFunctionOptions = signal<Function[]>([]);

  ngOnInit(): void {
    this.loadFunctions();
  }

  loadFunctions(): void {
    this.loading.set(true);
    this.functionsService.getFunctions().subscribe({
      next: (functions) => {
        this.functions.set(functions);
        this.buildFunctionTree(functions);
        this.updateParentOptions(functions);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading functions:', error);
        this.notificationService.showError('Failed to load functions');
        this.loading.set(false);
      }
    });
  }

  private buildFunctionTree(functions: Function[]): void {
    const tree = this.buildTree(functions, null);
    this.functionTree.set(tree);
  }

  private buildTree(functions: Function[], parentId: string | null): FunctionTreeNode[] {
    return functions
      .filter(f => f.parentId === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(func => ({
        data: func,
        children: this.buildTree(functions, func.id),
        expanded: true
      }));
  }

  private updateParentOptions(functions: Function[]): void {
    this.parentFunctionOptions.set(functions.filter(f => !f.parentId));
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.resetForm();
    this.showFunctionDialog = true;
  }

  editFunction(func: Function): void {
    this.isEditMode.set(true);
    this.currentFunctionId = func.id;
    this.functionFormData = { ...func };
    this.showFunctionDialog = true;
  }

  saveFunction(): void {
    this.saving.set(true);
    
    if (this.isEditMode()) {
      this.functionsService.updateFunction(this.currentFunctionId, this.functionFormData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Function updated successfully');
          this.showFunctionDialog = false;
          this.loadFunctions();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating function:', error);
          this.notificationService.showError('Failed to update function');
          this.saving.set(false);
        }
      });
    } else {
      this.functionsService.createFunction(this.functionFormData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Function created successfully');
          this.showFunctionDialog = false;
          this.loadFunctions();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creating function:', error);
          this.notificationService.showError('Failed to create function');
          this.saving.set(false);
        }
      });
    }
  }

  deleteFunction(func: Function): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete function "${func.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.functionsService.deleteFunction(func.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Function deleted successfully');
            this.loadFunctions();
          },
          error: (error) => {
            console.error('Error deleting function:', error);
            this.notificationService.showError('Failed to delete function');
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.functionFormData = {
      id: '',
      name: '',
      parentId: '',
      url: '',
      icon: '',
      sortOrder: 0
    };
    this.currentFunctionId = '';
  }
} 