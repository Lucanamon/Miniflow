import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async login(dto: LoginDto) {
    // Placeholder: validate against DB or auth provider in production
    const valid =
      typeof dto.username === 'string' &&
      dto.username.length > 0 &&
      typeof dto.password === 'string' &&
      dto.password.length > 0;
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      token: `mock-jwt-${Date.now()}`,
      expiresIn: 3600,
      user: { id: '1', username: dto.username },
    };
  }
}
