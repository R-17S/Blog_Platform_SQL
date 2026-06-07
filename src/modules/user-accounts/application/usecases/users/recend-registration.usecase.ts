import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { RegistrationEmailRequestedEvent } from '../../../domain/events/registration-email-requested.event';

export class ResendRegistrationCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendRegistrationCommand)
export class ResendRegistrationUseCase
  implements ICommandHandler<ResendRegistrationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    //private readonly emailService: EmailService,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ email }: ResendRegistrationCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [{ key: 'email', message: 'Invalid confirmation code' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ key: 'email', message: 'Email already confirmed' }],
      });
    }

    const newCode = randomUUID();
    const newExpirationDate = add(new Date(), { hours: 24 });

    user.emailConfirmation.confirmationCode = newCode;
    user.emailConfirmation.expirationDate = newExpirationDate;

    await this.usersRepository.save(user);
    this.eventBus.publish(new RegistrationEmailRequestedEvent(email, newCode));
    //await this.emailService.sendRegistrationEmail(email, newCode);
  }
}
