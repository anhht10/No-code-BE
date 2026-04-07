import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // 1. Kiểm tra xem Route này (hoặc Class này) có được gắn nhãn @Public không?
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. Nếu có nhãn @Public -> Cho qua luôn, không cần check token
        if (isPublic) {
            return true;
        }

        // 3. Nếu không -> Gọi cha (AuthGuard) để kích hoạt JwtStrategy kiểm tra token
        return super.canActivate(context);
    }

    // (Tùy chọn) Hàm xử lý khi có lỗi xác thực
    handleRequest(err, user, info) {
        // Nếu có lỗi (err) hoặc không có user (token sai/hết hạn) -> Ném lỗi 401
        if (err || !user) {
            throw err || new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
        return user;
    }
}