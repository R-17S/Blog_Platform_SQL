export type CommentSqlEntity = {
  id: string;
  postId: string;
  content: string;

  userId: string;

  likesCount: number;
  dislikesCount: number;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
