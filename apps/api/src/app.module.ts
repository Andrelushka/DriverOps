import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [AuthModule, HealthModule],
})
export class AppModule {}
