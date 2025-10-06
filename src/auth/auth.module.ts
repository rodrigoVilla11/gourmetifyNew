// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// importa el módulo que exporta UsersService
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule, // 👈 para poder inyectar UsersService en AuthService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],          // 👈 registra rutas /auth/*
  providers: [AuthService, JwtStrategy],  // 👈 registra servicio y strategy
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
