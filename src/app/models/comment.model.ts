import { Comment } from './types';
import { commentSchema } from './schemas';

export class CommentModel {
  private data: Comment;

  constructor(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) {
    this.data = commentSchema.parse(data);
  }

  public toJSON(): Comment {
    return this.data;
  }
}
