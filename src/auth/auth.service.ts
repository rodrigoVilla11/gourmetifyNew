// auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload, LoginResponse } from './types';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async login({ email, password }: LoginDto): Promise<LoginResponse> {
    // normalizamos emai
    const user = await this.users.findByEmailGlobal(email.toLowerCase());

    if (!user || !user.isActive)
      throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // payload del JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const access_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: '15m',
    });

    return {
      access_token,
      role: user.role,
      tenantId: user.tenantId,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async changePassword(
    userId: string,
    tenantId: string,
    dto: ChangePasswordDto,
  ) {
    // buscamos usuario dentro del tenant
    const user = await this.users['prisma'].user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, password: true }, // password = hash
    });
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok)
      throw new BadRequestException('La contraseña actual no es correcta');

    const nextHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users['prisma'].user.update({
      where: { id: userId },
      data: { password: nextHash, updatedAt: new Date() },
    });

    return { ok: true };
  }
}
