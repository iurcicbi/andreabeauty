export type UserRole = 'super_admin' | 'admin' | 'operator' | 'staff';

export type Permission =
  | 'appointments:read'
  | 'appointments:create'
  | 'appointments:update'
  | 'appointments:delete'
  | 'appointments:confirm'
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:roles'
  | 'services:read'
  | 'services:create'
  | 'services:update'
  | 'services:delete'
  | 'specialists:read'
  | 'specialists:create'
  | 'specialists:update'
  | 'specialists:delete'
  | 'settings:read'
  | 'settings:update'
  | 'vouchers:read'
  | 'vouchers:create'
  | 'vouchers:update'
  | 'vouchers:delete'
  | 'reviews:moderate'
  | 'audit:read'
  | 'logs:read'
  | 'whatsapp:send'
  | 'whatsapp:settings'
  | 'system:monitor';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ['*'] as Permission[],

  admin: [
    'appointments:read', 'appointments:create', 'appointments:update', 'appointments:delete', 'appointments:confirm',
    'users:read', 'users:create', 'users:update',
    'services:read', 'services:create', 'services:update', 'services:delete',
    'specialists:read', 'specialists:create', 'specialists:update', 'specialists:delete',
    'settings:read', 'settings:update',
    'vouchers:read', 'vouchers:create', 'vouchers:update', 'vouchers:delete',
    'reviews:moderate',
    'audit:read',
    'whatsapp:send', 'whatsapp:settings',
    'system:monitor',
  ],

  operator: [
    'appointments:read', 'appointments:create', 'appointments:update', 'appointments:confirm',
    'users:read', 'users:create',
    'services:read',
    'specialists:read',
    'reviews:moderate',
    'whatsapp:send',
  ],

  staff: [
    'appointments:read', 'appointments:create', 'appointments:confirm',
    'users:read',
    'services:read',
    'specialists:read',
  ],
};

export interface JwtPayload {
  sub: string;
  role: UserRole;
  permissions: Permission[];
  fingerprint: string;
  type: 'access' | 'refresh';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  fingerprint: string;
  type: 'refresh';
}

export interface AuthUser {
  id: string;
  role: UserRole;
  permissions: Permission[];
}
