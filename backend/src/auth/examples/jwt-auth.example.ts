/**
 * JWT AUTHENTICATION EXAMPLE
 * 
 * Demonstrates JWT-based authentication for NestJS with Prisma.
 * Install dependencies: npm install @nestjs/jwt @nestjs/passport passport passport-jwt
 * Install types: npm install -D @types/passport-jwt
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthExampleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials and return JWT token.
   */
  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Token expires in 1 hour
      secret: process.env.JWT_SECRET || 'your-secret-key', // Use env variable in production
    });

    return {
      accessToken,
      expiresIn: 3600, // seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Verify JWT token and return user.
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

/**
 * JWT GUARD EXAMPLE (for protecting routes)
 * 
 * Create: src/auth/guards/jwt-auth.guard.ts
 */

/*
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
*/

/**
 * USAGE IN CONTROLLER:
 * 
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user; // User from JWT payload
 * }
 */
