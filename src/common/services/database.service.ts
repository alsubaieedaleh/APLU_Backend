import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Readable } from 'stream';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private connection: Connection) {}

  async streamQuery(model: string, query: any): Promise<Readable> {
    const cursor = this.connection.models[model].find(query).cursor();
    return Readable.from(cursor);
  }

  async findOneOptimized(model: string, query: any, projection: any = {}) {
    return this.connection.models[model]
      .findOne(query)
      .select(projection)
      .lean()
      .exec();
  }

  async updateOneOptimized(model: string, query: any, update: any) {
    return this.connection.models[model]
      .updateOne(query, update)
      .lean()
      .exec();
  }
} 