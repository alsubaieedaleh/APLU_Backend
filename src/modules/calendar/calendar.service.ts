import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalendarEvent } from './schemas/calendar-event.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private calendarEventModel: Model<CalendarEvent>,
  ) {}

  async createEvent(eventData: any) {
    return this.calendarEventModel.create(eventData);
  }

  async getEvents(startDate: Date, endDate: Date) {
    return this.calendarEventModel.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
  }

  async getEventById(id: string) {
    return this.calendarEventModel.findById(id);
  }

  async updateEvent(id: string, updateData: any) {
    return this.calendarEventModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteEvent(id: string) {
    return this.calendarEventModel.findByIdAndDelete(id);
  }

  async syncWithGoogle(id: string) {
    const event = await this.calendarEventModel.findById(id);
    // Implement Google Calendar sync logic here
    return this.calendarEventModel.findByIdAndUpdate(
      id,
      { isSyncedWithGoogle: true },
      { new: true }
    );
  }
} 