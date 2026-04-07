import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UserService } from './user.service';
@ApiTags('Users')
@ApiBearerAuth()
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly usersService: UserService) { }
  
  @Get('profile')
  @ResponseMessage('Lấy thông tin người dùng thành công')
  async getProfile(@Req() req) {
    // req.user được tạo ra từ JwtStrategy sau khi verify token thành công
    return this.usersService.getProfile(req.user.userId);
  }
  
}
