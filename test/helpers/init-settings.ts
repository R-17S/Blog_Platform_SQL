import { Test, TestingModuleBuilder } from '@nestjs/testing';
// пример: моки для сервисов
import { appSetup } from '../../src/setup/app.setup';
import { EmailService } from '../../src/modules/user-accounts/application/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';

import { UsersTestManager } from './users-test-manager';
import { initAppModule } from '../../src/init-app-module';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })

    // ✅ подмена EmailService на мок
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  // ✅ если нужно, можно добавить кастомные override
  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  // let app;
  // try {
  //   const testingAppModule = await testingModuleBuilder.compile();
  //   app = testingAppModule.createNestApplication();
  //
  //   console.log('🔥 INIT: calling appSetup...');
  //   appSetup(app);
  //
  //   console.log('🔥 INIT: calling app.init()...');
  //   await app.init();
  //
  //   console.log('🔥 INIT: app.init() completed successfully');
  // } catch (e) {
  //   console.error('❌ ERROR DURING APP INIT:', e);
  //   throw e;
  // }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();

  console.log('🔥 INIT: calling appSetup...');
  appSetup(app);

  console.log('🔥 INIT: calling app.init()...');
  await app.init();

  // try {
  //   console.log('🔥 INIT: cleaning database...');
  //   await deleteAllData(app);
  //   // console.log('🔥 INIT: database cleaned');
  // } catch (e) {
  //   console.error('❌ ERROR DURING DB CLEAN:', e);
  //   throw e;
  // }

  return {
    app,
    httpServer: app.getHttpServer(),
    userTestManager: new UsersTestManager(app),
  };
};
