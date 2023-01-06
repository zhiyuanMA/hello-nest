import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    this.logger.debug(`Get current login user, email: ${user.email}`);
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    this.logger.debug(
      `Edit current user, id: ${userId}, ${JSON.stringify(dto)}`,
    );
    return this.userService.editUser(userId, dto);
  }
}
