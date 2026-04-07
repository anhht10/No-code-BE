import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { JwtRefreshAuthGuard } from './gaurds/jwt-refresh.guard';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @ResponseMessage('Đăng ký thành công')
  @ApiCreatedResponse({ description: 'Đăng ký thành công' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Đăng nhập thành công' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    return this.authService.login(loginDto, ipAddress, deviceInfo);
  }

  @Public()
  @Post('login/admin')
  @ResponseMessage('Admin đã đăng nhập thành công')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Admin đã đăng nhập thành công' })
  async adminLogin(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    return this.authService.login(loginDto, ipAddress, deviceInfo, 'admin');
  }


  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @ApiBearerAuth("RefreshToken")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const user = req.user as any;
    const ipAddress = req.ip || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    return this.authService.refresh(
      user.userId,
      user.refreshToken,
      ipAddress,
      deviceInfo
    );
  }

  @Post('logout')
  @ResponseMessage('Đăng xuất thành công')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiBody({ type: RefreshTokenDto })
  async logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }
}