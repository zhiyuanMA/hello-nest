import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Role } from '@prisma/client/index';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          roles: [Role.USER],
        },
      });
      return this.signToken(user.id, user.email, user.roles);
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        this.logger.error(`Credentials taken, user email: ${dto.email}`);
        throw new ForbiddenException('Credentials taken');
      }
      throw err;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      this.logger.error(`Credentials not found, user email: ${dto.email}`);
      throw new ForbiddenException('Credentials incorrect');
    }

    const isMatch = await argon.verify(user.hash, dto.password);
    if (!isMatch) {
      this.logger.error(`Credentials incorrect, user email: ${dto.email}`);
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.signToken(user.id, user.email, user.roles);
  }

  async signToken(
    userId: number,
    email: string,
    roles: Role[],
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      roles,
    };
    const secret = this.config.get('JWT_SECRET');
    const expiresIn = this.config.get('JWT_EXPIRE_IN');
    const token = await this.jwt.signAsync(payload, { secret, expiresIn });

    return { access_token: token };
  }
}
