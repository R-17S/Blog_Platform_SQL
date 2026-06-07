import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PasswordRecovery {
  @Prop({ required: true })
  recoveryCode: string;

  @Prop({ required: true })
  expirationDate: Date;
}
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
