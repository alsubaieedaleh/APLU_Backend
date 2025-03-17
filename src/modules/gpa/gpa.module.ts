import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GPAController } from './gpa.controller';
import { GPAService } from './gpa.service';
import { GPA, GPASchema } from './schemas/gpa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GPA.name, schema: GPASchema }])
  ],
  controllers: [GPAController],
  providers: [GPAService],
  exports: [GPAService],
})
export class GPAModule {} 