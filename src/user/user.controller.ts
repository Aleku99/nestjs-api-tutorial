import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser('id') userId: number, @GetUser('email') email: string) {
    return { userId, email };
  }

  @Patch()
  editUser() {}
}
