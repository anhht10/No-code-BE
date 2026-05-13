import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.user?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Chỉ tài khoản admin mới thực hiện được thao tác này');
    }
    return true;
  }
}
