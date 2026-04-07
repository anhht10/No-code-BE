import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserResponseDto } from '../../user/dto/user.dto';

export class LoginDto {
    @ApiProperty({ example: 'nguyenvana@gmail.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'MatKhau@123', description: 'Mật khẩu độ dài tối thiểu 6 ký tự' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'Nguyễnthailam,', description: 'Tên của người dùng' })
    @IsOptional() @IsString()
    name?: string;

    @ApiProperty({ example: 'nguyenvana@gmail.com' })
    @IsNotEmpty() @IsEmail()
    email: string;

    @ApiProperty({ example: 'MatKhau@123' })
    @IsNotEmpty() @MinLength(6)
    password: string;
}
export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
    @IsNotEmpty()
    refreshToken: string;
}

export class LoginResponseDto {
    @Expose()
    access_token: string;

    @Expose()
    refresh_token: string;

    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;
}
