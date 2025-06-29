import { Permission } from '@app/shared/models/permission';

export interface PermissionUpdateRequest {
  permissions: Permission[];
}
