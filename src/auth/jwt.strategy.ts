// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // 👇 devolvemos el shape que el front espera
    return {
      id: payload.sub,                // 👈 mapear sub → id
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId ?? null,
      // branchId si lo agregás en el payload a futuro
    };
  }
}
