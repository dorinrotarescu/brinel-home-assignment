import { PersonDto } from './person.model';

export interface CommentDto {
  id: number;
  content: string;
  author: PersonDto;
  createdDate: string;
}

export interface CreateCommentRequest {
  authorId: number;
  content: string;
}
