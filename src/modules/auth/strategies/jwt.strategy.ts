
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Định nghĩa cái lõi bên trong Token có gì (Payload)
type JwtPayload = {
    sub: string;  // userId
    role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            // Lấy token từ Header: Authorization: Bearer ...
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Lấy Access Secret từ file cấu hình
            secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),        
        });
    }

    // Khi Token hợp lệ, hàm này sẽ chạy
    async validate(payload: JwtPayload) {
        // Trả về object này, NestJS sẽ gắn nó vào req.user
        return {
            userId: payload.sub,
            role: payload.role
        };
    }
}