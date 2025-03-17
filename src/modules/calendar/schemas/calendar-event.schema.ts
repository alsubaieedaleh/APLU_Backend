import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventType = 'Meeting' | 'Deadline' | 'Exam';

@Schema({ timestamps: true })
export class CalendarEvent extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ 
    type: String, 
    enum: ['Meeting', 'Deadline', 'Exam'],
    required: true 
  })
  eventType: EventType;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  isSyncedWithGoogle: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  location?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants?: Types.ObjectId[];
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);

// Add indexes for common queries
CalendarEventSchema.index({ userId: 1, date: 1 });
CalendarEventSchema.index({ date: 1 }); 