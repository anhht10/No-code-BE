import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { UserResponseDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

// 1. Dùng nội bộ cho Auth (Trả về đầy đủ document kể cả password)
  async findInternalByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findInternalById(id: string) {
    return this.userModel.findOne({ _id: new Types.ObjectId(id), deleted: false }).exec();
  }

  // 2. Tạo User (Tách logic DB ra khỏi Auth)
  async create(userData: any) {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  async deleteInternal(userId: string | Types.ObjectId) {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    return result;
  }
}
