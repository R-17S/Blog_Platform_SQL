import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { RecoveryEmailRequestedEvent } from '../../../domain/events/recovery-email-requested.event';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    //private readonly emailService: EmailService,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) return;

    const recoveryCode = randomUUID();
    const expirationDate = add(new Date(), { hours: 24 });

    user.passwordRecovery = {
      recoveryCode,
      expirationDate,
    };

    await this.usersRepository.save(user);
    this.eventBus.publish(new RecoveryEmailRequestedEvent(email, recoveryCode));
    //await this.emailService.sendRecoveryEmail(email, recoveryCode);
  }
}
