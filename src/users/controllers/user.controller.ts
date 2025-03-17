import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateProfileDto, UpdateGPADto, UpdatePreferencesDto, UpdateStatusDto } from '../dto/user.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserId } from '../../auth/decorators/user-id.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.userService.update(userId, updateProfileDto as UpdateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@UserId() userId: string): Promise<void> {
    return this.userService.delete(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('status/:userId')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.userService.update(userId, updateStatusDto as UpdateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('gpa')
  async updateGPA(
    @UserId() userId: string,
    @Body() updateGPADto: UpdateGPADto
  ) {
    return this.userService.update(userId, updateGPADto as UpdateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(
    @UserId() userId: string,
    @Body() preferences: UpdatePreferencesDto
  ) {
    return this.userService.update(userId, preferences as UpdateUserDto);
  }
}
