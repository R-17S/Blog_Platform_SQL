import { LikeStatusTypes } from '../../posts/api/view-dto/posts.view-dto';

export type CommentLikeSqlEntity = {
  commentId: string;
  userId: string;
  userLogin: string;
  status: LikeStatusTypes;
  createdAt: string;
};
