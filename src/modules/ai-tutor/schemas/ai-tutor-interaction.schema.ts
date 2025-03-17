import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiTutorInteractionDocument = AiTutorInteraction & Document;

@Schema({ timestamps: true })
export class AiTutorInteraction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  response: string;

  @Prop({ default: false })
  feedbackGiven: boolean;

  // New field for conversation title
  @Prop({ required: false })
  title: string;
}

export const AiTutorInteractionSchema = SchemaFactory.createForClass(AiTutorInteraction);
