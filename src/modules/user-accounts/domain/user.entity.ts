import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { EmailConfirmation } from './emailConfirmation.schema';
import { add } from 'date-fns';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './passwordRecovery.schema';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, ...loginConstraints })
  login: string;

  @Prop({ type: String, required: true, ...emailConstraints })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: false, default: null })
  passwordRecovery: PasswordRecovery | null;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  /**
   * Factory method to create a User instance
   */
  static createInstance(
    login: string,
    email: string,
    passwordHash: string,
  ): UserDocument {
    const user = new this();
    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: new Date(),
      isConfirmed: true, // админ создаёт сразу подтверждённого
    }; // бизнес‑правило: всегда требует подтверждения
    return user as UserDocument;
  }

  /**
   * Factory method for creating an instance of a registered in user
   */
  static createForRegistration(
    login: string,
    email: string,
    passwordHash: string,
    confirmationCode: string,
  ): UserDocument {
    const user = new this();

    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;

    user.emailConfirmation = {
      confirmationCode,
      expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
      isConfirmed: false,
    };

    return user as UserDocument;
  }

  /**
   * Updates user email and resets confirmation
   */
  updateEmail(newEmail: string) {
    if (newEmail !== this.email) {
      this.email = newEmail;
      //this.isEmailConfirmed = false;
    }
  }

  /**
   * Marks user as deleted (soft delete)
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      this.deletedAt = new Date();
    }
  }
}

export const UserEntity = SchemaFactory.createForClass(User);
UserEntity.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
