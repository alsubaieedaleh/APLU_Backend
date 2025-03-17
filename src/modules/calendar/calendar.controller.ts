import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  async createEvent(@Body() eventData: {
    title: string;
    eventType: 'Meeting' | 'Deadline' | 'Exam';
    date: Date;
    isSyncedWithGoogle?: boolean;
  }) {
    return this.calendarService.createEvent(eventData);
  }

  @Get('events')
  async getEvents(@Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    return this.calendarService.getEvents(startDate, endDate);
  }

  @Get('events/:id')
  async getEvent(@Param('id') id: string) {
    return this.calendarService.getEventById(id);
  }

  @Put('events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateData: {
      title?: string;
      eventType?: 'Meeting' | 'Deadline' | 'Exam';
      date?: Date;
      isSyncedWithGoogle?: boolean;
    }
  ) {
    return this.calendarService.updateEvent(id, updateData);
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.calendarService.deleteEvent(id);
  }

  @Post('events/:id/sync')
  async syncWithGoogle(@Param('id') id: string) {
    return this.calendarService.syncWithGoogle(id);
  }
} 