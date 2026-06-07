import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Devices, DevicesDocument } from '../../domain/securityDevices.entity';
import { DevicesViewModel } from '../../api/view-dto/securityDevices.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(Devices.name)
    private readonly devicesModel: Model<DevicesDocument>,
  ) {}

  async getAllDevices(userId: string): Promise<DevicesViewModel[]> {
    const devices = await this.devicesModel.find({ userId }).lean();
    return devices.map((device) => DevicesViewModel.mapToView(device));
  }
}
