import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiTutorService } from './ai-tutor.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('ai-tutor')
@UseGuards(JwtAuthGuard)
export class AiTutorController {
  constructor(private readonly aiTutorService: AiTutorService) {}

  @Post('ask')
  async askQuestion(
    @Body() body: { question: string },
    @Request() req
  ) {
    // Use req.user.userId if available; otherwise fallback to req.user.sub
    const userId = req.user.userId || req.user.sub;
    return this.aiTutorService.handleQuestion(body.question, userId);
  }

  @Get('history')
  async getHistory(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.aiTutorService.getHistory(userId);
  }

  @Post('feedback')
  async giveFeedback(@Body() body: { interactionId: string; feedback: boolean }) {
    return this.aiTutorService.saveFeedback(body.interactionId, body.feedback);
  }
}
