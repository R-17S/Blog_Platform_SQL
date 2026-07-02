import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

@Injectable()
export class CoreConfig {
  @IsNotEmpty()
  port: number;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string;

  @IsNotEmpty()
  accessTokenSecret: string;

  @IsNotEmpty()
  refreshTokenSecret: string;

  @IsBoolean({
    message:
      'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS to enable/disable Dangerous for production internal server error details (message, etc), example: true, available values: true, false, 0, 1',
  })
  sendInternalServerErrorDetails: boolean;

  @IsNotEmpty()
  adminUsername: string;

  @IsNotEmpty()
  adminPassword: string;

  @IsNotEmpty()
  smtpUser: string;

  @IsNotEmpty()
  smtpPass: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean;

  constructor(private configService: ConfigService<any, true>) {
    console.log('ENV LOADED:', {
      SEND_INTERNAL_SERVER_ERROR_DETAILS:
        process.env.SEND_INTERNAL_SERVER_ERROR_DETAILS,
      IS_SWAGGER_ENABLED: process.env.IS_SWAGGER_ENABLED,
      NODE_ENV: process.env.NODE_ENV,
    });
    this.port = Number(this.configService.get('PORT'));
    this.mongoURI = this.configService.get('DATABASE_URL');
    console.log(
      'DATABASE_URL from configService:',
      this.configService.get('DATABASE_URL'),
    );
    console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.sendInternalServerErrorDetails =
      configValidationUtility.convertToBoolean(
        this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
      ) as boolean;
    this.adminUsername = this.configService.get('ADMIN_USERNAME');
    this.adminPassword = this.configService.get('ADMIN_PASSWORD');
    this.smtpUser = this.configService.get('SMTP_USER');
    this.smtpPass = this.configService.get('SMTP_PASS2');
    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;
    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}


