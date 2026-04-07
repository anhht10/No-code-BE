import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import ms, { StringValue } from 'ms';

import { plainToInstance } from 'class-transformer';
import { UserService } from '../user/user.service';
import { LoginDto, LoginResponseDto, RegisterDto } from './dto/auth.dto';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema'; // Nhớ dùng Document

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) { }

  // 1. ĐĂNG KÝ (Giữ nguyên)
  async register(registerDto: RegisterDto) {
    const isExist = await this.userService.findInternalByEmail(registerDto.email);
    if (isExist) throw new BadRequestException('Email đã được sử dụng!');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userService.create({
      ...registerDto,
      username: registerDto.name ? registerDto.name.replace(/\s+/g, '').toLowerCase() : `user${Date.now()}`,
      avatar: "https://i.pravatar.cc/150?img=1",
      gender: "other",
      role: "student",
      password: hashedPassword,
    });
      return { userId: newUser.id };

  }

  // 2. ĐĂNG NHẬP (Giữ nguyên)
  async login(loginDto: LoginDto, ipAddress: string, deviceInfo: string, requiredRole?: string) {
    const user = await this.userService.findInternalByEmail(loginDto.email);
    if (!user) {
            console.log(`Login failed for email: ${loginDto.email} - User not found`);


      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    } 

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch){
      console.log(`Login failed for email: ${loginDto.email} - Incorrect password`);
      throw new UnauthorizedException('Sai email hoặc mật khẩu}');
      
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new UnauthorizedException(
        'Tài khoản của bạn không có quyền truy cập vào khu vực này'
      );
    }

    await this.refreshTokenModel.deleteMany({
      userId: user._id,
      deviceInfo: deviceInfo
    });
    const tokens = await this.generateAuthTokens(user._id.toString(), user.role, ipAddress, deviceInfo);
    return plainToInstance(LoginResponseDto, {
      ...tokens,
      user: user.toObject()
    }, { excludeExtraneousValues: true });
  }

  // 3. REFRESH TOKEN (Giữ nguyên logic)
  async refresh(userId: string, refreshToken: string, ipAddress: string, deviceInfo: string) {
    // KHÔNG CẦN: jwtService.verifyAsync(...) vì Guard đã làm rồi

    // 1. Tìm token trong DB
    const tokenDoc = await this.refreshTokenModel.findOne({
      token: refreshToken,
      deleted: false
    });

    // 2. Nếu không thấy -> Hacker dùng token giả hoặc token đã bị thu hồi
    if (!tokenDoc) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã được sử dụng');
    }

    // 3. Xóa token cũ (Rotation)
    await tokenDoc.deleteOne();

    // 4. Tìm User để lấy Roles mới nhất (phòng trường hợp Admin vừa đổi quyền của User này)
    const user = await this.userService.findInternalById(userId);
    if (!user) throw new UnauthorizedException('User không tồn tại');

    // 5. Tạo cặp Token mới
    return this.generateAuthTokens(user._id.toString(), user.role, ipAddress, deviceInfo);
  }

  // ==========================================
  // 4. BỔ SUNG: ĐĂNG XUẤT (LOGOUT)
  // ==========================================
  async logout(refreshToken: string) {
    // Chỉ cần xóa Refresh Token khỏi DB là user hết đường quay lại
    const result = await this.refreshTokenModel.deleteOne({ token: refreshToken });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Token không tồn tại hoặc đã được đăng xuất trước đó');
    }
    return {};
  }

  // 5. HÀM TẠO TOKEN (Đã tối ưu thời gian)
  private async generateAuthTokens(userId: string, role: string, ipAddress: string, deviceInfo: string) {
    const payload = { sub: userId, role };

    // Lấy config
    const accessExpires = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN');
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'); // Ví dụ: '30d'

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires as JwtSignOptions['expiresIn'],
    });

    // --- TÍNH TOÁN NGÀY HẾT HẠN CHÍNH XÁC ---
    const expirationDate = new Date();
    // Sử dụng 'ms' để đổi '30d' -> mili-giây và cộng vào thời gian hiện tại
    expirationDate.setTime(expirationDate.getTime() + ms(refreshExpires as StringValue));

    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(userId),
      token: refreshToken,
      ipAddress,
      deviceInfo,
      expiresAt: expirationDate, // Lưu ngày chính xác theo config
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}