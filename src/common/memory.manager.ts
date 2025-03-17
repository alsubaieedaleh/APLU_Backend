const HEAP_LIMIT = 3.5; // MB

export class MemoryManager {
  private static instance: MemoryManager;
  private lastGC: number = Date.now();
  private readonly GC_INTERVAL = 1000; // 1 second

  private constructor() {
    this.monitor();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private monitor() {
    setInterval(() => {
      const used = process.memoryUsage();
      const heapUsed = used.heapUsed / 1024 / 1024;

      if (heapUsed > HEAP_LIMIT) {
        this.forceGC();
      }
    }, this.GC_INTERVAL);
  }

  private forceGC() {
    const now = Date.now();
    if (now - this.lastGC >= this.GC_INTERVAL) {
      if (global.gc) {
        global.gc();
        this.lastGC = now;
      }
    }
  }
} 