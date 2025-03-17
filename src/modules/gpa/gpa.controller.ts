import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GPAService } from './gpa.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('gpa')
@UseGuards(JwtAuthGuard)
export class GPAController {
  constructor(private readonly gpaService: GPAService) {}

  // GET /gpa - Return the GPA record for the authenticated user
  @Get()
  async getGPA(@Request() req) {
    return this.gpaService.getGPA(req.user.sub);
  }

  // POST /gpa - Update or create a GPA record for the authenticated user.
  // Expected body: { currentGPA: number, totalCredits: number, projectedGPA: number }
  @Post()
  async createGPA(@Body() gpaData: any, @Request() req) {
    return this.gpaService.updateGPA({
      ...gpaData,
      userId: req.user.sub,
    });
  }

  // GET /gpa/project - Return the projected GPA for the authenticated user.
  @Get('project')
  async projectGPA(@Request() req) {
    return this.gpaService.projectGPA(req.user.sub);
  }
}
