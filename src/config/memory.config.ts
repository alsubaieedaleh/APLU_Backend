import { Global, Module } from '@nestjs/common';

declare const global: any;

const HEAP_USED_LIMIT = 3.5; // MB
const CHECK_INTERVAL = 1000; // 1 second

function checkMemoryUsage() {
  const used = process.memoryUsage();
  const heapUsed = used.heapUsed / 1024 / 1024; // Convert to MB

  if (heapUsed > HEAP_USED_LIMIT) {
    console.warn(`Memory limit exceeded: ${heapUsed.toFixed(2)}MB`);
    if (global.gc) {
      global.gc();
    }
  }
}

@Global()
@Module({})
export class MemoryModule {
  constructor() {
    setInterval(checkMemoryUsage, CHECK_INTERVAL);
  }
} 