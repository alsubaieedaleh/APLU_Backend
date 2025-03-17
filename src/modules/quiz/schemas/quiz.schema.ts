import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true, default: false })
  isCorrect: boolean;
}

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [QuizOption], required: true })
  options: QuizOption[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true })
  explanation: string;

  @Prop({ type: Number, required: true })
  points: number;
}

@Schema({ _id: false })
export class QuizFeedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop({ type: String })
  comment?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ 
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true 
  })
  difficulty: string;

  @Prop([{
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    points: { type: Number, required: true, default: 10 }
  }])
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
  }>;

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ type: [QuizFeedback], default: [] })
  feedback: QuizFeedback[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz); 