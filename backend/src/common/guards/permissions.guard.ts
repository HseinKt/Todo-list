import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles) {
      return false;
    }

    // Extract permissions from all roles associated with the user
    const userPermissions: string[] = [];
    user.roles.forEach((ur: any) => {
      if (ur.role?.permissions) {
        ur.role.permissions.forEach((rp: any) => {
          if (rp.permission?.action) {
            userPermissions.push(rp.permission.action);
          }
        });
      }
    });

    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
