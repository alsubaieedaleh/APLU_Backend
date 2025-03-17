import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { MongoClient, Db } from 'mongodb';
import { URL } from 'node:url';

// Types
type CacheItem = {
  data: any;
  timestamp: number;
};

// Constants
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const MONGO_URI = process.env.MONGODB_URI ;
const CACHE_TTL = 60 * 1000; // 1 minute
const CACHE_SIZE = 100;

// Cache implementation
class Cache {
  private items = new Map<string, CacheItem>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  get(key: string): any | null {
    const item = this.items.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_TTL) {
      this.items.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any): void {
    if (this.items.size >= this.maxSize) {
      const oldestKey = this.items.keys().next().value;
      this.items.delete(oldestKey);
    }
    this.items.set(key, { data, timestamp: Date.now() });
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.items.entries()) {
        if (now - item.timestamp > CACHE_TTL) {
          this.items.delete(key);
        }
      }
    }, CACHE_TTL).unref();
  }
}

// Database connection
let db: Db;
async function connectDB(): Promise<void> {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 2000,
    });
    db = client.db('app');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize cache
const cache = new Cache(CACHE_SIZE);

// Request handler
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url!, `http://${req.headers.host}`);

  // Set common headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Connection', 'close');

  try {
    switch (url.pathname) {
      case '/api/auth/login': {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 1024) {
            res.writeHead(413);
            res.end(JSON.stringify({ error: 'Payload too large' }));
            return;
          }
        }

        const { email } = JSON.parse(body);
        const cacheKey = `user:${email}`;
        
        const cached = cache.get(cacheKey);
        if (cached) {
          res.writeHead(200);
          res.end(JSON.stringify(cached));
          return;
        }

        const user = await db.collection('users').findOne(
          { email },
          { 
            projection: { email: 1 },
            maxTimeMS: 1000
          }
        );

        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }

        cache.set(cacheKey, user);
        res.writeHead(200);
        res.end(JSON.stringify(user));
        break;
      }

      default:
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}

// Create and start server
async function bootstrap(): Promise<void> {
  await connectDB();

  const server = createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error('Request handler error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal error' }));
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Monitor memory usage
  setInterval(() => {
    const used = process.memoryUsage();
    if (used.heapUsed / 1024 / 1024 > 1500) {
      console.error('Memory limit exceeded, restarting...');
      process.exit(1);
    }
  }, 5000).unref();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
  process.exit(1);
}); 