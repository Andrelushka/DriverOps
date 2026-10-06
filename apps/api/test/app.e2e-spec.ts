import {
  Controller,
  Get,
  UnauthorizedException,
  type INestApplication,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CurrentUser } from '../src/modules/auth/current-user.decorator.js';

import { AppModule } from '../src/app.module.js';
import {
  AuthService,
  type AuthenticatedUser,
} from '../src/modules/auth/auth.service.js';

@Controller('test/protected')
class ProtectedTestController {
  @Get()
  getProtected(@CurrentUser() user: AuthenticatedUser) {
    return { userId: user.id };
  }
}

describe('Authentication boundary (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProtectedTestController],
    })
      .overrideProvider(AuthService)
      .useValue({
        verifyAccessToken: async (token: string) => {
          if (token === 'valid-test-token') {
            return { id: 'test-user-id' };
          }

          throw new UnauthorizedException('Invalid access token');
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('rejects requests without an access token', async () => {
    await request(app.getHttpServer()).get('/test/protected').expect(401);
  });

  it('rejects requests with an invalid authorization scheme', async () => {
    await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', 'Basic example')
      .expect(401);
  });

  it('rejects invalid bearer tokens', async () => {
    await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', 'Bearer invalid-test-token')
      .expect(401);
  });

  it('provides the authenticated user identity to the controller', async () => {
    await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', 'Bearer valid-test-token')
      .expect(200)
      .expect({ userId: 'test-user-id' });
  });
});
