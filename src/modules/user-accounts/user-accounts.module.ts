import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { ArgonService } from './application/argon2.service';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from './infrastructure/devices.repositories';
import { SecurityDevicesQueryRepository } from './infrastructure/query/devices.query-repositories';
import { SecurityDevicesController } from './api/security-devices.controller';
import { DeleteDeviceByIdUseCase } from './application/usecases/security-devices/delete-device-by-id.usecase';
import { DeleteAllDevicesExceptCurrentUseCase } from './application/usecases/security-devices/delete-all-devices-except-current.usecase';
import { Devices, DevicesEntity } from './domain/securityDevices.entity';
import { UserAccountsConfig } from './config/user-accounts.config';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserEntity },
      { name: Devices.name, schema: DevicesEntity },
    ]),
  ],
  controllers: [UsersController, SecurityDevicesController],
  providers: [
    //
    UsersRepository,
    UsersQueryRepository,
    CreateUserUseCase,
    DeleteUserUseCase,
    //
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,
    DeleteDeviceByIdUseCase,
    DeleteAllDevicesExceptCurrentUseCase,
    //
    ArgonService,
    //
    UserAccountsConfig,
  ],
  exports: [
    UsersRepository,
    SecurityDevicesRepository,
    //UsersService,
    ArgonService,
    UserAccountsConfig,
  ],
})
export class UserAccountsModule {}
