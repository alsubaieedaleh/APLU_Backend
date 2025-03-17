import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiTutorInteraction } from './schemas/ai-tutor-interaction.schema';

@Injectable()
export class AiTutorService {
  constructor(
    @InjectModel(AiTutorInteraction.name)
    private aiTutorInteractionModel: Model<AiTutorInteraction>,
  ) {}

  async handleQuestion(question: string, userId: string) {
    // Generate a title from the question (truncate if longer than 30 characters)
    const title = question.length > 30 ? question.substring(0, 30) + '...' : question;
    // Create a new AI tutor interaction document with the title
    return this.aiTutorInteractionModel.create({
      question,
      response: 'AI response here',
      userId,
      title,
    });
  }

  async getHistory(userId: string) {
    // Return only the current user's interactions, including the title field
    return this.aiTutorInteractionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .select('title question response createdAt');
  }

  async saveFeedback(interactionId: string, feedback: boolean) {
    const updated = await this.aiTutorInteractionModel.findByIdAndUpdate(
      interactionId,
      { feedbackGiven: feedback },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Interaction not found');
    }
    return { message: 'Feedback submitted successfully' };
  }
}
