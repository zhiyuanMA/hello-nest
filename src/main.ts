import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // If set to true, validator will strip validated (returned) object
      // of any properties that do not use any validation decorators.
      whitelist: true,
      transform: true, // enable auto-transformation
    }),
  );

  await app.listen(app.get(ConfigService).get('APP_PORT'));

  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
}

bootstrap();
