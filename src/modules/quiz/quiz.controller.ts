import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Query,
  Request,
  BadRequestException
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('quiz')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  async generateQuiz(
    @Body() quizData: any,
    @Request() req
  ) {
    return this.quizService.generateQuiz({
      ...quizData,
      userId: req.user.userId
    });
  }

  @Get(':id')
  async getQuiz(
    @Param('id') id: string,
    @Request() req
  ) {
    if (!id) {
      throw new BadRequestException('Quiz ID is required');
    }
    return this.quizService.getQuizById(id);
  }

  @Get('user/:userId')
  async getUserQuizzes(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.quizService.getUserQuizzes(userId, page, limit);
  }

  @Post(':id/share')
  async shareQuiz(@Param('id') id: string) {
    return this.quizService.shareQuiz(id);
  }

  @Post(':id/submit')
  async submitQuiz(
    @Param('id') id: string,
    @Body() answers: Array<{
      questionId: string;
      answer: string;
    }>
  ) {
    return this.quizService.submitQuiz(id, answers);
  }

  @Get('shared')
  @Roles('Student', 'Instructor')
  async getSharedQuizzes(
    @Query('difficulty') difficulty?: 'Easy' | 'Medium' | 'Hard',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.quizService.getSharedQuizzes(page, limit, difficulty);
  }

  @Post(':id/feedback')
  async provideFeedback(
    @Param('id') id: string,
    @Body() feedback: {
      rating: number;
      comment?: string;
    }
  ) {
    return this.quizService.saveFeedback(id, feedback);
  }
} 