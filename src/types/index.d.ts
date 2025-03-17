declare namespace Express {
  interface Request {
    user?: any;
  }
}

declare module 'mongoose' {
  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
    cache(ttl?: number): this;
  }
} 