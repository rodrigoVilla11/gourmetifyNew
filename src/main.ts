import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: 'http://localhost:3001', // 👈 el puerto de tu frontend
    credentials: true, // ponelo en true solo si usás cookies/sesiones
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'x-branch-id',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0'); // 👈 importante en Docker
  console.log(`API ready on http://localhost:${port}`);
}
bootstrap();
