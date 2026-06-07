import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EmailConfirmation {
  @Prop({ required: false, type: String }) //default: null
  confirmationCode: string | null;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true, default: false })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
