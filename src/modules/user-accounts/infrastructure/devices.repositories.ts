import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Devices, DevicesDocument } from '../domain/securityDevices.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(Devices.name)
    private readonly devicesModel: Model<DevicesDocument>,
  ) {}

  async save(device: DevicesDocument): Promise<void> {
    // console.log('saving device:', device);
    await device.save();
  }

  async findAllByUserId(userId: string): Promise<DevicesDocument[]> {
    return this.devicesModel.find({ userId });
  }

  async deleteManyByDeviceIds(deviceIds: string[]): Promise<void> {
    await this.devicesModel.deleteMany({ deviceId: { $in: deviceIds } });
  }

  async findByDeviceId(deviceId: string): Promise<DevicesDocument | null> {
    return this.devicesModel.findOne({ deviceId });
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await this.devicesModel.deleteOne({ deviceId });
  }

  async deleteAll(): Promise<void> {
    await this.devicesModel.deleteMany({});
  }
}
