import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [
    RolesGuard,
    LoggerService,
  ],
  exports: [
    RolesGuard,
    LoggerService,
  ],
})
export class SharedModule {} 