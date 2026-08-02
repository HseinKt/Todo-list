import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { generateSecret, verify, generateURI } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: dto.fullName || null,
        },
      });

      let role = await tx.role.findUnique({ where: { name: 'User' } });
      if (!role) {
        role = await tx.role.create({
          data: {
            name: 'User',
            description: 'Standard application user',
          },
        });
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return {
        id: user.id,
        email: user.email,
        message: 'Signup successful. You can now login.',
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.twoFactorEnabled) {
      return {
        require2FA: true,
        userId: user.id,
        message: 'Two-factor authentication is required to complete login',
      };
    }

    return this.generateTokens(user);
  }

  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshTokenString = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenString,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        roles: user.roles?.map((ur: any) => ur.role?.name),
      },
    };
  }

  async refresh(token: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { profile: true, roles: { include: { role: true } } } } },
    });

    if (!storedToken || storedToken.isRevoked || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(storedToken.user);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  async generate2FaSecret(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      secret,
      label: user.email,
      issuer: 'HorizonOS',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, otpAuthUrl };
  }

  async enable2Fa(userId: string, code: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not initialized for this user');
    }

    const isValid = await verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: 'Two-factor authentication successfully enabled' };
  }

  async verify2FaLogin(userId: string, code: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('User account error');
    }

    const isValid = await verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    return this.generateTokens(user);
  }
}
