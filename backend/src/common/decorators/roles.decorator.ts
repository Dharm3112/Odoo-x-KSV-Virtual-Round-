import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route handler.
 * Usage: @Roles(Role.admin, Role.manager)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
