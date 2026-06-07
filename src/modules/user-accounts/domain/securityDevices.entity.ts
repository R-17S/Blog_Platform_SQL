import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Devices {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  lastActiveDate: Date;

  /**
   * Factory method to create a Devices instance
   */
  static createInstance(
    userId: string,
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: Date,
  ): DevicesDocument {
    const device = new this();
    device.userId = userId;
    device.deviceId = deviceId;
    device.ip = ip;
    device.title = title;
    device.lastActiveDate = lastActiveDate;
    return device as DevicesDocument;
  }

  /**
   * Updates user email and resets confirmation
   */
  updateLastActive(date: Date) {
    this.lastActiveDate = date;
  }

  /**
   * Marks user as deleted (soft delete)
   */
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     this.deletedAt = new Date();
  //   }
  // }
}

export const DevicesEntity = SchemaFactory.createForClass(Devices);
DevicesEntity.loadClass(Devices);

export type DevicesDocument = HydratedDocument<Devices>;
export type DevicesModelType = Model<DevicesDocument> & typeof Devices;
