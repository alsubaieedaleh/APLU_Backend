import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private quizModel: Model<Quiz>,
  ) {}

  async generateQuiz(quizData: any) {
    return this.quizModel.create(quizData);
  }

  async getQuizById(id: string) {
    return this.quizModel.findById(id);
  }

  async getUserQuizzes(userId: string, page: number, limit: number) {
    return this.quizModel
      .find({ userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async shareQuiz(id: string) {
    return this.quizModel.findByIdAndUpdate(
      id,
      { isShared: true },
      { new: true }
    );
  }

  async submitQuiz(id: string, answers: any[]) {
    const quiz = await this.quizModel.findById(id);
    // Implement quiz submission and scoring logic here
    return { score: 0, feedback: [] };
  }

  async getSharedQuizzes(
    page: number,
    limit: number,
    difficulty?: 'Easy' | 'Medium' | 'Hard'
  ) {
    const query: any = { isShared: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    return this.quizModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async saveFeedback(id: string, feedback: any) {
    return this.quizModel.findByIdAndUpdate(
      id,
      { $push: { feedback: feedback } },
      { new: true }
    );
  }

  async findOne(id: string, userId: string) {
    return this.quizModel.findOne({ _id: id, userId }).exec();
  }
} 