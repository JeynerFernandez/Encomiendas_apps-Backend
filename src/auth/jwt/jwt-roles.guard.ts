import {CanActivate,ExecutionContext,Injectable,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtRole } from './jwt-role.js';

@Injectable()
export class JwtRolesGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {

    const requiredRoles =
      this.reflector.getAllAndOverride<JwtRole[]>(
        'roles',
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest();

    const user = request.user;

    return requiredRoles.includes(
      user?.role,
    );
  }
}