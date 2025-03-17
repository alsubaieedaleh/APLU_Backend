import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiTutorController } from './ai-tutor.controller';
import { AiTutorService } from './ai-tutor.service';
import { AiTutorInteraction, AiTutorInteractionSchema } from './schemas/ai-tutor-interaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiTutorInteraction.name, schema: AiTutorInteractionSchema }
    ])
  ],
  controllers: [AiTutorController],
  providers: [AiTutorService],
  exports: [AiTutorService],
})
export class AiTutorModule {} 