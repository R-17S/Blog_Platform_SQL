export type SecurityDeviceSqlEntity = {
  id: string;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string; // или Date, если будешь маппить
  createdAt: string;
};