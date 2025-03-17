import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GPADocument = GPA & Document;

@Schema({ timestamps: true })
export class GPA {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  currentGPA: number;

  @Prop({ required: true })
  totalCredits: number;

  @Prop({ required: true })
  projectedGPA: number;
}

export const GPASchema = SchemaFactory.createForClass(GPA);
