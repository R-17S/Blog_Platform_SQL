import { Injectable } from '@nestjs/common';

import { User, UserDocument } from '../../domain/user.entity';

import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

// @Injectable()
// export class AuthQueryRepository {
//   constructor(
//     @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
//   ) {}
//
//   async me(userId: string): Promise<MeViewDto> {
//     const user = await this.userModel.findById(userId);
//     if (!user) {
//       throw new DomainException({
//         code: DomainExceptionCode.Unauthorized,
//         message: 'Invalid username or password',
//       });
//     }
//     return MeViewDto.mapToView(user);
//   }
// }
