import { Injectable, OnModuleInit, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

declare const global: any;

@Injectable()
export class MemoryManagementService implements OnModuleInit, NestInterceptor {
  private readonly MEMORY_USAGE_THRESHOLD = 0.5; // Lower threshold to 50%
  private readonly CRITICAL_THRESHOLD = 0.7; // Critical threshold at 70%
  private readonly CHECK_INTERVAL = 10000; // Check every 10 seconds
  private readonly HEAP_USED_LIMIT = 400; // MB
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;

  onModuleInit() {
    this.startMemoryMonitoring();
    this.setupGlobalErrorHandler();
    this.setupProcessHandlers();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    return next.handle().pipe(
      tap(() => {
        const endMemory = process.memoryUsage().heapUsed;
        const memoryDiff = (endMemory - startMemory) / 1024 / 1024;
        if (memoryDiff > 50) { // If route consumed more than 50MB
          console.warn(`High memory usage in route: ${memoryDiff.toFixed(2)}MB`);
          this.forceGarbageCollection();
        }
      }),
      finalize(() => {
        const duration = Date.now() - startTime;
        if (duration > 1000) { // If route took more than 1 second
          console.warn(`Slow route execution: ${duration}ms`);
        }
      })
    );
  }

  private startMemoryMonitoring() {
    if (global.gc) {
      global.gc();
    }

    const interval = setInterval(() => {
      try {
        this.checkMemoryUsage();
      } catch (error) {
        console.error('Error in memory monitoring:', error);
        if (++this.retryCount >= this.MAX_RETRIES) {
          console.error('Max retries reached, stopping memory monitoring');
          clearInterval(interval);
        }
      }
    }, this.CHECK_INTERVAL);

    interval.unref(); // Don't keep the process alive just for this
  }

  private setupGlobalErrorHandler() {
    process.on('memoryUsage', (data) => {
      console.error('Memory Usage Warning:', data);
      this.forceGarbageCollection();
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.forceGarbageCollection();
    });
  }

  private setupProcessHandlers() {
    process.on('SIGTERM', () => this.handleProcessTermination());
    process.on('SIGINT', () => this.handleProcessTermination());
    process.on('exit', () => this.cleanup());
  }

  private async handleProcessTermination() {
    console.log('Process termination signal received');
    await this.cleanup();
    process.exit(0);
  }

  private async cleanup() {
    console.log('Cleaning up resources...');
    this.forceGarbageCollection();
    // Add any other cleanup tasks here
  }

  private checkMemoryUsage() {
    const used = process.memoryUsage();
    const heapUsed = used.heapUsed / 1024 / 1024; // MB
    const heapTotal = used.heapTotal / 1024 / 1024; // MB
    const external = used.external / 1024 / 1024; // MB
    const usage = heapUsed / heapTotal;

    const memoryInfo = {
      heapUsed: Math.round(heapUsed),
      heapTotal: Math.round(heapTotal),
      external: Math.round(external),
      rss: Math.round(used.rss / 1024 / 1024),
      usage: Math.round(usage * 100)
    };

    console.log('Memory Usage:', memoryInfo);

    if (heapUsed > this.HEAP_USED_LIMIT || usage > this.CRITICAL_THRESHOLD) {
      console.warn('Critical memory usage detected');
      this.handleCriticalMemory();
      return;
    }

    if (usage > this.MEMORY_USAGE_THRESHOLD) {
      console.log('High memory usage detected');
      this.forceGarbageCollection();
    }
  }

  private async handleCriticalMemory() {
    console.warn('Handling critical memory situation');
    
    // Force immediate garbage collection
    this.forceGarbageCollection();

    // If still critical after GC, take more drastic measures
    if (this.isMemoryStillHigh()) {
      console.warn('Memory still critical after GC, clearing caches');
      await this.clearAllCaches();
    }
  }

  private forceGarbageCollection() {
    if (global.gc) {
      console.log('Running garbage collection');
      try {
        global.gc();
      } catch (error) {
        console.error('Error during garbage collection:', error);
      }
    }
  }

  private isMemoryStillHigh(): boolean {
    const used = process.memoryUsage();
    const heapUsed = used.heapUsed / 1024 / 1024;
    return heapUsed > this.HEAP_USED_LIMIT;
  }

  private async clearAllCaches() {
    // Clear require cache
    Object.keys(require.cache).forEach(key => {
      if (!key.includes('node_modules')) {
        delete require.cache[key];
      }
    });

    // Clear module caches
    if (global.gc) {
      global.gc();
    }
  }
} 