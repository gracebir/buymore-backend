import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('/api/v1/user')
export class UserController {
  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@GetUser() user: User) {
    return user;
  }
}
