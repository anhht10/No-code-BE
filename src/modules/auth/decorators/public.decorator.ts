import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Dùng decorator này @Public() đặt trên đầu API login/register
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);