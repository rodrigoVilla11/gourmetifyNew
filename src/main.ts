import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0'); // 👈 importante en Docker
  console.log(`API ready on http://localhost:${port}`);
}
bootstrap();
