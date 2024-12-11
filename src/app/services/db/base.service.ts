import { PostgrestError } from '@supabase/supabase-js';

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryResultList<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

export abstract class BaseService<T> {
  protected abstract tableName: string;

  protected handleError(error: PostgrestError): never {
    console.error(`Error in ${this.tableName}:`, error);
    throw error;
  }
}
