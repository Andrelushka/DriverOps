import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DriverOps API')
      .setDescription('REST API for the DriverOps platform.')
      .setVersion('1.0')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
