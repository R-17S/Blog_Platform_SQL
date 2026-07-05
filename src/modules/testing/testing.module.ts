import { Module } from '@nestjs/common';
import { TestingController } from './ api/testing.controller';
import { TestingService } from './ application/testing.service';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BloggersPlatformModule } from '../bloggers-platform/bloggers-platform.module';
import { PgModule } from '../../pg.module';

@Module({
  imports: [UserAccountsModule, BloggersPlatformModule, PgModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
