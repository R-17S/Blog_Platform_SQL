import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInputQuery } from './input-dto/get-users-query-params.input-dto';
import { UsersViewPaginated, UserViewModel } from './view-dto/users.view-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admins/delete-user.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@UseGuards(BasicAuthGuard)
@SkipThrottle() // можно ставить над классом и все методы контроллера будут требовать BasicAuth.
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    //private readonly usersService: UsersService,
    //private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(@Query() query: UserInputQuery): Promise<UsersViewPaginated> {
    return this.usersQueryRepository.getAllUsers(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() input: CreateUserDto): Promise<UserViewModel> {
    const newUserId = await this.commandBus.execute<any, string>(
      new CreateUserCommand(input),
    );
    return await this.usersQueryRepository.getUserByIdOrError(newUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
