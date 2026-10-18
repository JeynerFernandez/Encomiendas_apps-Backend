import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import {
  AppModule,
} from './app.module.js';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,

      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig =
    new DocumentBuilder()
      .setTitle(
        'MANDA YA API',
      )
      .setDescription(
        'API REST del sistema de encomiendas MANDA YA',
      )
      .setVersion(
        '1.0',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Ingrese solamente el token JWT. No escriba Bearer.',
        },
        'access-token',
      )
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'swagger',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  await app.listen(
    3000,
    '0.0.0.0',
  );

  console.log(
    'MANDA YA API ejecutándose en http://localhost:3000',
  );

  console.log(
    'Swagger disponible en http://localhost:3000/swagger',
  );
}

await bootstrap();