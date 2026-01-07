import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { StringValue } from 'ms';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>
  ) {}

  async register(registerDto: RegisterDto) {
    // Create user
    const user = await this.usersService.create(registerDto);

    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await this.usersService.setEmailVerificationToken(
      user.id,
      verificationToken,
      expiresAt
    );

    // TODO: Send verification email via MailService
    // await this.mailService.sendVerificationEmail(user, verificationToken);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(user: User, ip: string) {
    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, ip);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshTokens(token: string, ip: string) {
    // Find refresh token
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is active
    if (!refreshToken.isActive) {
      // Token theft detected - revoke all user tokens
      if (refreshToken.isRevoked) {
        await this.revokeAllUserTokens(refreshToken.userId);
        throw new UnauthorizedException(
          'Token reuse detected. All sessions have been invalidated. Please login again.'
        );
      }

      throw new UnauthorizedException('Refresh token expired');
    }

    const user = refreshToken.user;

    // Revoke old refresh token
    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    refreshToken.revokedByIp = ip;

    // Generate new tokens
    const newRefreshToken = await this.generateRefreshToken(user, ip);
    refreshToken.replacedByToken = newRefreshToken.token;

    await this.refreshTokenRepository.save(refreshToken);

    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async logout(token: string, ip: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      refreshToken.revokedAt = new Date();
      refreshToken.revokedByIp = ip;
      await this.refreshTokenRepository.save(refreshToken);
    }

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);
    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.usersService.setPasswordResetToken(
      user.id,
      resetToken,
      expiresAt
    );

    // TODO: Send reset email via MailService
    // await this.mailService.sendPasswordResetEmail(user, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.resetPassword(token, newPassword);

    // Revoke all refresh tokens to force re-login
    await this.revokeAllUserTokens(user.id);

    return {
      message: 'Password reset successful. Please login with your new password',
    };
  }

  async getProfile(userId: string) {
    return await this.usersService.findOne(userId);
  }

  // Private helper methods

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m') as StringValue,
    });
  }

  private async generateRefreshToken(
    user: User,
    ip: string
  ): Promise<RefreshToken> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    const expirationDays = this.parseExpirationToDays(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d')
    );
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      userId: user.id,
      expiresAt,
      createdByIp: ip,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Cleanup expired tokens for this user
    await this.cleanupExpiredTokens(user.id);

    return refreshToken;
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({
      userId,
      expiresAt: LessThan(new Date()),
    });
  }

  private parseExpirationToDays(expiration: string): number {
    const match = expiration.match(/^(\d+)([dhm])$/);
    if (!match) return 7; // default 7 days

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 'd':
        return num;
      case 'h':
        return num / 24;
      case 'm':
        return num / (24 * 60);
      default:
        return 7;
    }
  }
}
