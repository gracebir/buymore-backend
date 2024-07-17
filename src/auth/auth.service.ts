import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      const passwordHash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          passwordHash,
          username: dto.username,
          email: dto.email,
          role: dto.role,
        },
      });
      if (user)
        return {
          statusCode: 200,
          username: user.username,
          message: 'Your account has been created!!!',
        };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User already exists');
        }
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) throw new ForbiddenException('User does exists!!');

      const compare = await argon.verify(user.passwordHash, dto.password);
      if (!compare) throw new ForbiddenException('Incorrect password!!');

      return {
        access_token: await this.signToken(user.id, user.email, user.username),
        id: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw error;
    }
  }

  signToken(id: number, email: string, username: string) {
    const payload = {
      sub: id,
      email,
      username,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '1y',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
