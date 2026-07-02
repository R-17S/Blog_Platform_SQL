import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './application/email.service';
import { join } from 'path';
import { CoreConfig } from '../../core/core.config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: coreConfig.smtpUser,
            pass: coreConfig.smtpPass,
          },
          //logger: true, // ← логирование SMTP
          //debug: true, // ← подробные SMTP-логи
        },
        defaults: {
          from: '"My App" <no-reply@myapp.com>',
        },
        template: {
          dir: join(__dirname, 'templates'), // ← путь к папке с .hbs
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
