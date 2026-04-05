import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuard } from '../guards/bearer/jwtRefresh-auth.guard';
import { SecurityDevicesQueryRepository } from '../infrastructure/query/devices.query-repositories';
import { DevicesViewModel } from './view-dto/securityDevices.view-dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserCookiesDto } from '../guards/dto/user-cookies.dto';
import { DeleteAllDevicesExceptCurrentCommand } from '../application/usecases/security-devices/delete-all-devices-except-current.usecase';
import { DeleteDeviceByIdCommand } from '../application/usecases/security-devices/delete-device-by-id.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@UseGuards(JwtRefreshAuthGuard)
@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}

  @Get()
  async getDevices(
    @ExtractUserFromRequest() user: UserCookiesDto,
  ): Promise<DevicesViewModel[]> {
    return this.securityDevicesQueryRepository.getAllDevices(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevicesExceptCurrent(
    @ExtractUserFromRequest() user: UserCookiesDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAllDevicesExceptCurrentCommand(user),
    );
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('deviceId') deviceId: string,
    @ExtractUserFromRequest() user: UserCookiesDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteDeviceByIdCommand(user.id, deviceId),
    );
  }
}
