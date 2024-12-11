import { Reaction } from './types';
import { reactionSchema } from './schemas';

export class ReactionModel {
  private data: Reaction;

  constructor(data: Omit<Reaction, 'id' | 'createdAt' | 'updatedAt'>) {
    this.data = reactionSchema.parse(data);
  }

  public toJSON(): Reaction {
    return this.data;
  }
}
