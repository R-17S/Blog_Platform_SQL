import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../domain/user.entity';
import {
  UsersViewPaginated,
  UserViewModel,
} from '../../api/view-dto/users.view-dto';
import { UserInputQuery } from '../../api/input-dto/get-users-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(params: UserInputQuery): Promise<UsersViewPaginated> {
    const filter: any = {}; //а что тут делать, есть какой то FilterQuery<UserDocument> но он не хочет работать и почему ?
    //const filter: FilterQuery<UserDocument> = {};

    if (params.searchLoginTerm && params.searchEmailTerm) {
      filter.$or = [
        { login: { $regex: params.searchLoginTerm, $options: 'i' } },
        { email: { $regex: params.searchEmailTerm, $options: 'i' } },
      ];
    } else if (params.searchLoginTerm) {
      filter.login = { $regex: params.searchLoginTerm, $options: 'i' };
    } else if (params.searchEmailTerm) {
      filter.email = { $regex: params.searchEmailTerm, $options: 'i' };
    }

    const [totalCount, users] = await Promise.all([
      this.userModel.countDocuments(filter),
      this.userModel
        .find(filter)
        .sort(params.SortOptions(params.sortBy))
        .skip(params.calculateSkip())
        .limit(params.pageSize)
        .lean(),
    ]);
    // console.log(params);
    return UsersViewPaginated.mapToView({
      items: users.map((user) => UserViewModel.mapToView(user)),
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }

  async getUserByIdOrError(id: string): Promise<UserViewModel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    const result = await this.userModel
      .findOne({ _id: id, deletedAt: null }) // фильтруем только "живые" блоги
      .lean();
    if (!result)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    return UserViewModel.mapToView(result);
  }
}
