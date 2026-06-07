export type SecurityDeviceSqlEntity = {
  id: string;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string; // или Date, если будешь маппить
  createdAt: string;
};

//   /**
//    * Factory method to create a Devices instance
//    */
//   static createInstance(
//     userId: string,
//     deviceId: string,
//     ip: string,
//     title: string,
//     lastActiveDate: Date,
//   ): DevicesDocument {
//     const device = new this();
//     device.userId = userId;
//     device.deviceId = deviceId;
//     device.ip = ip;
//     device.title = title;
//     device.lastActiveDate = lastActiveDate;
//     return device as DevicesDocument;
//   }
//
//   /**
//    * Updates user email and resets confirmation
//    */
//   updateLastActive(date: Date) {
//     this.lastActiveDate = date;
//   }
//
//   /**
//    * Marks user as deleted (soft delete)
//    */
//   // makeDeleted() {
//   //   if (this.deletedAt !== null) {
//   //     this.deletedAt = new Date();
//   //   }
//   // }
// }
//
// export const DevicesEntity = SchemaFactory.createForClass(Devices);
// DevicesEntity.loadClass(Devices);
//
// export type DevicesDocument = HydratedDocument<Devices>;
// export type DevicesModelType = Model<DevicesDocument> & typeof Devices;
