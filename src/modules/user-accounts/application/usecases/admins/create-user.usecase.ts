import { CreateUserDto } from '../../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { ArgonService } from '../../argon2.service';
import { User } from '../../../domain/user.entity';
import type { UserModelType } from '../../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class CreateUserCommand {
  constructor(public readonly input: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly argonService: ArgonService,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}
  async execute({ input }: CreateUserCommand): Promise<string> {
    const [loginExists, emailExists] = await Promise.all([
      this.usersRepository.findByLogin(input.login),
      this.usersRepository.findByEmail(input.email),
    ]);
    if (loginExists)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login should be unique',
        extensions: [{ key: 'login', message: 'Login should be unique' }],
      });
    if (emailExists)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email should be unique',
        extensions: [{ key: 'email', message: 'Email should be unique' }],
      });
    const passwordHash = await this.argonService.generateHash(input.password);
    const newUser = this.userModel.createInstance(
      input.login,
      input.email,
      passwordHash,
    );
    await this.usersRepository.save(newUser);
    return newUser._id.toString();
  }
}
