import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    // Get notifications for the authenticated user using the ID from the JWT payload.
    return this.notificationsService.getNotifications(req.user.sub);
  }

  @Post()
  async createNotification(
    @Body() data: { message: string; type: string },
    @Request() req
  ) {
    // Create a notification using the authenticated user's ID.
    return this.notificationsService.createNotification({
      message: data.message,
      type: data.type,
      userId: req.user.sub,
    });
  }

  @Patch(':id')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
