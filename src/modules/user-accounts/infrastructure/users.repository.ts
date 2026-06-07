import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findOne({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ login, deletedAt: null });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: null });
  }

  async exists(id: string): Promise<boolean> {
    return !!(await this.userModel.exists({ _id: new Types.ObjectId(id) }));
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id });
  }

  async deleteAll(): Promise<void> {
    await this.userModel.deleteMany({});
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findByRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 'passwordRecovery.recoveryCode': code });
  }
}
