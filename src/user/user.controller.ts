import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser('id') userId: number, @GetUser('email') email: string) {
    return { userId, email };
  }

  @Patch()
  editUser(@GetUser('id') id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }
}
