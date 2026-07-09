import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initSettings } from './helpers/init-settings';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule],
  //   }).compile();
  //
  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/')
      .expect(200)
      .expect('Hello World!');
  });
});
