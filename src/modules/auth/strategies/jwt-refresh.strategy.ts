
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            // Quan trọng: Cho phép truy cập vào đối tượng Request để lấy token gốc
            passReqToCallback: true,
        });
    }

    // payload: Là dữ liệu đã giải mã bên trong token
    // req: Là cái request gửi lên (chứa cái token dạng chuỗi thô)
    async validate(req: Request, payload: any) {
        // Lấy chuỗi token thô (để tí nữa so sánh với Database xem có khớp không)
        const authHeader = req.get('Authorization');
        const refreshToken = authHeader?.replace('Bearer', '').trim();

        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

        return {
            userId: payload.sub,
            role: payload.role,
            refreshToken: refreshToken
        };
    }
}