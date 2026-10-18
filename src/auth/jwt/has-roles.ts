import { SetMetadata } from '@nestjs/common';
import { JwtRole } from './jwt-role.js';

export const HasRoles = (...roles: JwtRole[]) =>
  SetMetadata('roles', roles);